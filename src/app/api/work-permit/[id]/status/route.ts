import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const updateWorkPermitStatusSchema = z.object({
	workCompleted: z.boolean(),
})

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const body = await req.json()
		const { workCompleted } = updateWorkPermitStatusSchema.parse(body)

		const { id } = await params

		const workPermit = await prisma.workPermit.update({
			where: {
				id,
			},
			data: {
				workCompleted,
			},
		})

		return NextResponse.json(workPermit)
	} catch (error) {
		console.error("[WORK_PERMIT_STATUS_UPDATE]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}
