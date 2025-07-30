import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"

import { inspectionCommentSchema } from "@/project/work-order/schemas/inspection-comment.schema"
import { createInspectionComment } from "@/project/work-order/actions/createInspectionComment"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user?.id) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const workEntryId = searchParams.get("workEntryId")

		if (!workEntryId) {
			return NextResponse.json({ error: "workEntryId es requerido" }, { status: 400 })
		}

		const workEntry = await prisma.workEntry.findUnique({
			where: { id: workEntryId },
			select: {
				id: true,
				entryType: true,
				workOrder: {
					select: {
						id: true,
						supervisorId: true,
						responsibleId: true,
						companyId: true,
					},
				},
				createdBy: {
					select: {
						id: true,
						companyId: true,
					},
				},
			},
		})

		if (!workEntry || workEntry.entryType !== "OTC_INSPECTION") {
			return NextResponse.json({ error: "Inspección no encontrada" }, { status: 404 })
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				id: true,
				companyId: true,
				accessRole: true,
			},
		})

		if (!user) {
			return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
		}

		const hasAccess =
			user.accessRole === "ADMIN" ||
			user.id === workEntry.workOrder.supervisorId ||
			user.id === workEntry.workOrder.responsibleId ||
			user.companyId === workEntry.workOrder.companyId ||
			user.companyId === workEntry.createdBy.companyId

		if (!hasAccess) {
			return NextResponse.json(
				{ error: "Sin permisos para acceder a esta inspección" },
				{ status: 403 }
			)
		}

		const comments = await prisma.inspectionComment.findMany({
			where: { workEntryId },
			select: {
				id: true,
				content: true,
				type: true,
				isResolved: true,
				createdAt: true,
				updatedAt: true,
				author: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				attachments: {
					select: {
						id: true,
						name: true,
						type: true,
						url: true,
					},
				},
			},
			orderBy: { createdAt: "asc" },
		})

		return NextResponse.json(comments)
	} catch (error) {
		console.error("[GET_INSPECTION_COMMENTS]", error)
		return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
	}
}

const createCommentSchema = inspectionCommentSchema.extend({
	userId: z.string(),
	attachment: z
		.array(
			z.object({
				name: z.string(),
				url: z.string(),
				size: z.number(),
				type: z.string(),
				mimeType: z.string().optional(),
				containerType: z.string().optional(),
			})
		)
		.optional(),
})

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user?.id) {
			return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 })
		}

		const body = await request.json()
		const validatedData = createCommentSchema.parse({
			...body,
			userId: session.user.id,
		})

		const result = await createInspectionComment(validatedData)

		if (result.ok) {
			return NextResponse.json(result, { status: 201 })
		} else {
			return NextResponse.json(result, { status: 400 })
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ ok: false, message: "Datos inválidos", errors: error.errors },
				{ status: 400 }
			)
		}

		console.error("[POST_INSPECTION_COMMENT]", error)
		return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 })
	}
}
