import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateWorkPermitStatusSchema = z.object({
	workCompleted: z.boolean(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const body = await request.json()
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
