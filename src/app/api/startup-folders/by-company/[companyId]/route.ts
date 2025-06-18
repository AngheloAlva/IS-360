import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ companyId: string }> }) {
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
