import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
	_: NextRequest,
	{ params }: { params: Promise<{ fileId: string }> }
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

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
