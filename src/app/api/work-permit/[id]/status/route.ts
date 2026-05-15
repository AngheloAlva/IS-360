import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import {
	getScopedWorkPermitId,
	hasWorkPermitUpdatePermission,
} from "@/project/work-permit/utils/authorization"
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
		const hasPermission = await hasWorkPermitUpdatePermission(session.user.id)

		if (!hasPermission) {
			return new NextResponse("Sin permisos", { status: 403 })
		}

		const scopedWorkPermitId = await getScopedWorkPermitId({
			workPermitId: id,
			userId: session.user.id,
		})

		if (!scopedWorkPermitId) {
			return new NextResponse("No encontrado", { status: 404 })
		}

		const workPermit = await prisma.workPermit.update({
			where: {
				id: scopedWorkPermitId,
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
