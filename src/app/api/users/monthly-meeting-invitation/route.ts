import { createHash } from "node:crypto"

import { NextResponse } from "next/server"

import { ACCESS_ROLE } from "@/generated/prisma/enums"
import prisma from "@/lib/prisma"
import { resend } from "@/lib/resend"

import { MonthlyMeetingInvitationEmail } from "@/project/user/components/emails/MonthlyMeetingInvitationEmail"

const DEFAULT_SUBJECT = "Invitacion a Reunion Mensual - OTC 360"
const DEFAULT_MEETING_URL =
	"https://teams.microsoft.com/l/meetup-join/19%3ameeting_YWQxZWZiOTItNDU0MC00OTM1LTgxMTAtYjc5NGUxN2Y0ZTlm%40thread.v2/0?context=%7b%22Tid%22%3a%22532d15da-4091-4505-979f-314786a64481%22%2c%22Oid%22%3a%224f601088-f31a-43f9-af0a-1ed43a45da19%22%7d"

const MAX_RETRIES = 4
const BATCH_SIZE = 100
const BATCH_PAUSE_MS = 1100
const RETRY_BASE_DELAY_MS = 1200

interface MonthlyMeetingInvitationPayload {
	subject?: string
	meetingUrl?: string
	campaignKey?: string
	onlyEmails?: string[]
	excludeEmails?: string[]
}

type SendResult =
	| {
			ok: true
			email: string
	  }
	| {
			ok: false
			email: string
			error: string
			statusCode?: number
	  }

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const normalizeEmail = (email: string) => email.trim().toLowerCase()
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const extractStatusCode = (error: unknown): number | undefined => {
	if (!error || typeof error !== "object") return undefined

	const err = error as Record<string, unknown>
	const statusCode = err.statusCode
	if (typeof statusCode === "number") return statusCode

	const name = err.name
	if (typeof name === "string") {
		const match = name.match(/\b(\d{3})\b/)
		if (match) return Number(match[1])
	}

	return undefined
}

const extractErrorMessage = (error: unknown): string => {
	if (!error || typeof error !== "object") return "Error desconocido"

	const err = error as Record<string, unknown>
	if (typeof err.message === "string") return err.message
	if (typeof err.name === "string") return err.name

	return "Error desconocido"
}

const chunkArray = <T>(items: T[], size: number): T[][] => {
	const chunks: T[][] = []
	for (let i = 0; i < items.length; i += size) {
		chunks.push(items.slice(i, i + size))
	}
	return chunks
}

export async function POST(request: Request): Promise<NextResponse> {
	let body: MonthlyMeetingInvitationPayload = {}

	try {
		body = (await request.json()) as MonthlyMeetingInvitationPayload
	} catch {
		body = {}
	}

	const subject = body.subject?.trim() || DEFAULT_SUBJECT
	const meetingUrl = body.meetingUrl?.trim() || DEFAULT_MEETING_URL
	const campaignKey =
		body.campaignKey?.trim() ||
		createHash("sha256").update(`${subject}__${meetingUrl}`).digest("hex").slice(0, 24)

	const requestedOnlyEmails = new Set((body.onlyEmails || []).map(normalizeEmail))
	const excludedEmails = new Set((body.excludeEmails || []).map(normalizeEmail))

	const sendBatchChunk = async (
		recipients: Array<{ email: string }>,
		chunkIndex: number
	): Promise<
		| { ok: true; sentEmails: string[] }
		| { ok: false; failedEmails: string[]; error: string; statusCode?: number }
	> => {
		const chunkHash = createHash("sha256")
			.update(recipients.map((recipient) => recipient.email).join(","))
			.digest("hex")
			.slice(0, 16)

		const idempotencyKey = `monthly-meeting-batch/${campaignKey}/chunk-${chunkIndex}-${chunkHash}`
		for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
			const { error } = await resend.batch.send(
				recipients.map((recipient, index) => ({
					from: "sistema.otc360@otc360.cl",
					to: [recipient.email],
					bcc: chunkIndex === 0 && index === 0 ? ["soporte@ingenieriasimple.cl"] : undefined,
					subject,
					react: MonthlyMeetingInvitationEmail({
						meetingUrl,
					}),
					tags: [
						{
							name: "type",
							value: "monthly-meeting-invitation",
						},
						{
							name: "campaign",
							value: campaignKey,
						},
					],
				})),
				{ idempotencyKey }
			)

			if (!error) {
				return {
					ok: true,
					sentEmails: recipients.map((recipient) => recipient.email),
				}
			}

			const statusCode = extractStatusCode(error)
			const retryable = statusCode === 429 || (typeof statusCode === "number" && statusCode >= 500)

			if (retryable && attempt < MAX_RETRIES) {
				await sleep(RETRY_BASE_DELAY_MS * (attempt + 1))
				continue
			}

			return {
				ok: false,
				failedEmails: recipients.map((recipient) => recipient.email),
				error: extractErrorMessage(error),
				statusCode,
			}
		}

		return {
			ok: false,
			failedEmails: recipients.map((recipient) => recipient.email),
			error: "Error desconocido",
		}
	}

	try {
		const supervisors = await prisma.user.findMany({
			where: {
				isActive: true,
				isSupervisor: true,
				accessRole: ACCESS_ROLE.PARTNER_COMPANY,
			},
			select: {
				name: true,
				email: true,
			},
		})

		const dedupedByEmail = new Map<string, { email: string }>()
		const invalidEmails: string[] = []

		supervisors.forEach((user) => {
			const email = normalizeEmail(user.email)

			if (!isValidEmail(email)) {
				invalidEmails.push(user.email)
				return
			}

			if (!dedupedByEmail.has(email)) {
				dedupedByEmail.set(email, {
					email,
				})
			}
		})

		let recipients = Array.from(dedupedByEmail.values())

		if (requestedOnlyEmails.size > 0) {
			recipients = recipients.filter((recipient) => requestedOnlyEmails.has(recipient.email))
		}

		if (excludedEmails.size > 0) {
			recipients = recipients.filter((recipient) => !excludedEmails.has(recipient.email))
		}

		if (recipients.length === 0) {
			return NextResponse.json({
				ok: true,
				message: "No hay destinatarios para enviar en esta ejecución.",
				campaignKey,
				totalRecipients: 0,
				sent: 0,
				failed: 0,
				invalidEmails,
			})
		}

		const results: SendResult[] = []
		const recipientChunks = chunkArray(recipients, BATCH_SIZE)

		for (let chunkIndex = 0; chunkIndex < recipientChunks.length; chunkIndex += 1) {
			const chunk = recipientChunks[chunkIndex]
			const chunkResult = await sendBatchChunk(chunk, chunkIndex)

			if (chunkResult.ok) {
				chunkResult.sentEmails.forEach((email) => {
					results.push({
						ok: true,
						email,
					})
				})
			} else {
				chunkResult.failedEmails.forEach((email) => {
					results.push({
						ok: false,
						email,
						error: chunkResult.error,
						statusCode: chunkResult.statusCode,
					})
				})
			}

			if (chunkIndex + 1 < recipientChunks.length) {
				await sleep(BATCH_PAUSE_MS)
			}
		}

		const successfulResults = results.filter((result) => result.ok)
		const failedResults = results.filter((result) => !result.ok)
		const failedRecipients = failedResults.map((result) => result.email)

		return NextResponse.json(
			{
				ok: failedResults.length === 0,
				message:
					failedResults.length > 0
						? "Invitaciones enviadas parcialmente."
						: "Invitaciones enviadas correctamente.",
				campaignKey,
				totalRecipients: recipients.length,
				sent: successfulResults.length,
				failed: failedResults.length,
				failedRecipients,
				failureDetails: failedResults,
				invalidEmails,
			},
			{ status: failedResults.length > 0 ? 207 : 200 }
		)
	} catch (error) {
		console.error("[MONTHLY_MEETING_INVITATION_POST]", error)
		return NextResponse.json(
			{
				ok: false,
				message: "Error interno del servidor.",
			},
			{ status: 500 }
		)
	}
}
