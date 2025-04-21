import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
	try {
		const fileId = (await params).fileId

		if (!fileId) {
			return new NextResponse("Not Found", { status: 404 })
		}

		const comments = await prisma.fileComment.findMany({
			where: {
				fileId,
			},
			include: {
				user: {
					select: {
						name: true,
					},
				},
			},
		})
		return NextResponse.json({
			comments,
		})
	} catch (error) {
		console.error("[FILES_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
