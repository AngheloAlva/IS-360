import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import db from "@/lib/prisma"

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return NextResponse.json(
				{ error: "No autorizado", code: "UNAUTHORIZED" },
				{ status: 401 },
			)
		}

		if (session.user.role !== "admin") {
			return NextResponse.json(
				{ error: "Forbidden", code: "FORBIDDEN" },
				{ status: 403 },
			)
		}

		const { id } = await params
		const body = await request.json().catch(() => null)

		if (body?.action === "revoke") {
			const apiKey = await db.apiKey.update({
				where: { id },
				data: { isActive: false },
				select: { id: true, name: true, isActive: true },
			})
			return NextResponse.json({ data: apiKey, message: "API key revocada" })
		}

		if (body?.action === "activate") {
			const apiKey = await db.apiKey.update({
				where: { id },
				data: { isActive: true },
				select: { id: true, name: true, isActive: true },
			})
			return NextResponse.json({
				data: apiKey,
				message: "API key activada",
			})
		}

		if (body?.action === "renew") {
			const existingKey = await db.apiKey.findUnique({
				where: { id },
				select: { name: true, createdById: true },
			})

			if (!existingKey) {
				return NextResponse.json(
					{ error: "API key not found", code: "NOT_FOUND" },
					{ status: 404 },
				)
			}

			// Revoke old key
			await db.apiKey.update({
				where: { id },
				data: { isActive: false },
			})

			// Generate new key with same name
			const { generateApiKey } = await import("@/lib/api-key")
			const { plainTextKey, apiKey } = await generateApiKey({
				name: existingKey.name,
				createdById: session.user.id,
				expiresInDays: 90,
			})

			return NextResponse.json({
				data: apiKey,
				key: plainTextKey,
				message: "Nueva API key generada. La anterior fue revocada.",
				warning:
					"Store this key securely. It cannot be retrieved again.",
			})
		}

		return NextResponse.json(
			{ error: "Invalid action", code: "VALIDATION_ERROR" },
			{ status: 400 },
		)
	} catch (error) {
		console.error("[API_KEY_PATCH]", error)
		return NextResponse.json(
			{ error: "Internal server error", code: "INTERNAL_ERROR" },
			{ status: 500 },
		)
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return NextResponse.json(
				{ error: "No autorizado", code: "UNAUTHORIZED" },
				{ status: 401 },
			)
		}

		if (session.user.role !== "admin") {
			return NextResponse.json(
				{ error: "Forbidden", code: "FORBIDDEN" },
				{ status: 403 },
			)
		}

		const { id } = await params

		await db.apiKey.delete({ where: { id } })

		return NextResponse.json({ message: "API key eliminada" })
	} catch (error) {
		console.error("[API_KEY_DELETE]", error)
		return NextResponse.json(
			{ error: "Internal server error", code: "INTERNAL_ERROR" },
			{ status: 500 },
		)
	}
}
