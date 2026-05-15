import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { generateApiKey } from "@/lib/api-key"

export async function POST(request: NextRequest) {
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

		const body = await request.json().catch(() => null)

		if (!body?.name || typeof body.name !== "string") {
			return NextResponse.json(
				{ error: "Field 'name' is required", code: "VALIDATION_ERROR" },
				{ status: 400 },
			)
		}

		const { plainTextKey, apiKey } = await generateApiKey({
			name: body.name,
			createdById: session.user.id,
			expiresInDays:
				typeof body.expiresInDays === "number" ? body.expiresInDays : 90,
		})

		return NextResponse.json({
			key: plainTextKey,
			id: apiKey.id,
			name: apiKey.name,
			prefix: apiKey.keyPrefix,
			expiresAt: apiKey.expiresAt?.toISOString() ?? null,
			warning: "Store this key securely. It cannot be retrieved again.",
		})
	} catch (error) {
		console.error("[GENERATE_KEY_POST]", error)
		return NextResponse.json(
			{ error: "Internal server error", code: "INTERNAL_ERROR" },
			{ status: 500 },
		)
	}
}
