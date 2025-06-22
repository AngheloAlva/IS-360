import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ companyId: string }> }
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const { companyId } = await params

		const startupFolders = await prisma.startupFolder.findMany({
			where: {
				company: {
					id: companyId,
				},
			},
			select: {
				id: true,
				name: true,
			},
		})

		return NextResponse.json(startupFolders)
	} catch (error) {
		console.error("[STARTUP_FOLDERS_BY_COMPANY_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
