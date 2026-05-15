import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { StartupGuideDocumentVisibility } from "@/generated/prisma/enums"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const visibility = searchParams.get("visibility") as StartupGuideDocumentVisibility | null
		const includeInactive = searchParams.get("includeInactive") === "true"

		const where: {
			isActive?: boolean
			visibility?: StartupGuideDocumentVisibility | { in: StartupGuideDocumentVisibility[] }
		} = {}

		if (!includeInactive) {
			where.isActive = true
		}

		if (visibility) {
			if (visibility === "BASIC") {
				where.visibility = { in: ["BASIC", "BOTH"] }
			} else if (visibility === "FULL") {
				where.visibility = { in: ["FULL", "BOTH"] }
			} else {
				where.visibility = visibility
			}
		}

		const guideDocuments = await prisma.startupGuideDocument.findMany({
			where,
			select: {
				id: true,
				name: true,
				description: true,
				url: true,
				type: true,
				size: true,
				visibility: true,
				order: true,
				isActive: true,
				createdAt: true,
				updatedAt: true,
				createdBy: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: [{ order: "asc" }, { createdAt: "desc" }],
		})

		return NextResponse.json(guideDocuments)
	} catch (error) {
		console.error("[STARTUP_GUIDE_DOCUMENTS_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
