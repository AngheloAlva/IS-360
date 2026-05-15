import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import db from "@/lib/prisma"

export async function GET(request: NextRequest) {
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

		const apiKeys = await db.apiKey.findMany({
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				keyPrefix: true,
				isActive: true,
				expiresAt: true,
				lastUsedAt: true,
				requestCount: true,
				createdAt: true,
				createdBy: { select: { name: true } },
			},
		})

		return NextResponse.json({ data: apiKeys })
	} catch (error) {
		console.error("[API_KEYS_GET]", error)
		return NextResponse.json(
			{ error: "Internal server error", code: "INTERNAL_ERROR" },
			{ status: 500 },
		)
	}
}
