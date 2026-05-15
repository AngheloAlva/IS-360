"use server"

import { headers } from "next/headers"

import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { sendNewUserEmail } from "@/project/user/actions/sendNewUserEmail"
import { linkEntity } from "@/project/startup-folder/actions/link-entity"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"

interface PartnerUserInput {
	rut: string
	name: string
	email: string
	phone?: string
	internalRole?: string
	internalArea?: string
	isSupervisor?: boolean
	startupFoldersId?: string[]
}

interface PartnerUserResult {
	ok: boolean
	email: string
	name: string
	rut: string
	id?: string
	message?: string
}

export interface CreatePartnerUsersResult {
	ok: boolean
	message?: string
	results: PartnerUserResult[]
	successCount: number
	errorCount: number
}

export async function createPartnerUsers({
	companyId,
	users,
}: {
	companyId: string
	users: PartnerUserInput[]
}): Promise<CreatePartnerUsersResult> {
	const requestHeaders = await headers()
	const session = await auth.api.getSession({ headers: requestHeaders })

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
			results: [],
			successCount: 0,
			errorCount: users.length,
		}
	}

	const results: PartnerUserResult[] = []

	for (const user of users) {
		const temporalPassword = generateTemporalPassword()

		try {
			const created = await auth.api.createUser({
				headers: requestHeaders,
				body: {
					name: user.name,
					email: user.email,
					password: temporalPassword,
					role: ["partnerCompany"],
					data: {
						companyId,
						rut: user.rut,
						phone: user.phone,
						isSupervisor: user.isSupervisor ?? false,
						internalRole: user.internalRole,
						internalArea: user.internalArea,
					},
				},
			})

			const newUserId = created.user.id

			if (user.startupFoldersId && user.startupFoldersId.length > 0) {
				for (const folderId of user.startupFoldersId) {
					await linkEntity({
						entityId: newUserId,
						startupFolderId: folderId,
						entityCategory: "PERSONNEL",
					})
				}
			}

			await logActivity({
				userId: session.user.id,
				module: MODULES.USERS,
				action: ACTIVITY_TYPE.ASSIGN,
				entityId: newUserId,
				entityType: "User",
				metadata: {
					type: "partner-user-create",
					email: user.email,
					name: user.name,
					companyId,
					isSupervisor: user.isSupervisor ?? false,
					internalRole: user.internalRole,
					internalArea: user.internalArea,
					startupFoldersId: user.startupFoldersId ?? [],
				},
			})

			void sendNewUserEmail({
				name: user.name,
				email: user.email,
				password: temporalPassword,
			})

			results.push({
				ok: true,
				email: user.email,
				name: user.name,
				rut: user.rut,
				id: newUserId,
			})
		} catch (error) {
			console.error("[CREATE_PARTNER_USERS]", { email: user.email, error })

			const code = (error as { body?: { code?: string } })?.body?.code
			let message = "Error al crear el usuario"

			if (code === "USER_ALREADY_EXISTS") {
				message = `El RUT ${user.rut} o correo ${user.email} ya existe`
			} else if (code === "ONLY_ADMINS_CAN_ACCESS_THIS_ENDPOINT") {
				message = "No tienes permiso para crear colaboradores"
			}

			results.push({
				ok: false,
				email: user.email,
				name: user.name,
				rut: user.rut,
				message,
			})
		}
	}

	const successCount = results.filter((r) => r.ok).length
	const errorCount = results.length - successCount

	return {
		ok: errorCount === 0,
		results,
		successCount,
		errorCount,
	}
}
