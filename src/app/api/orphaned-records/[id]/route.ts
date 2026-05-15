import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { normalizeRut } from "@/project/safety-talk/utils/normalize-rut"
import { inPersonSafetyTalkSchema } from "@/project/safety-talk/schemas/in-person-safety-talk.schema"

const validateSession = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return { error: "No autorizado", status: 401 }
	}

	return { session }
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const { error, status, session } = await validateSession()

	if (error || !session) {
		return NextResponse.json({ error }, { status })
	}

	try {
		const { id } = await params
		const body = await request.json()
		const parsed = inPersonSafetyTalkSchema.partial().safeParse(body)

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
				{ status: 400 }
			)
		}

		const existing = await prisma.inPersonSafetyTalkRecord.findUnique({
			where: { id },
		})

		if (!existing) {
			return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
		}

		const { rut, name, company, category, sessionDate, expiresAt, score, notes, status: recordStatus } = parsed.data

		const record = await prisma.inPersonSafetyTalkRecord.update({
			where: { id },
			data: {
				...(rut !== undefined && { rut: normalizeRut(rut) }),
				...(name !== undefined && { name }),
				...(company !== undefined && { company }),
				...(category !== undefined && { category }),
				...(sessionDate !== undefined && { sessionDate }),
				...(expiresAt !== undefined && { expiresAt }),
				...(score !== undefined && { score }),
				...(notes !== undefined && { notes }),
				...(recordStatus !== undefined && { status: recordStatus }),
			},
		})

		return NextResponse.json(record)
	} catch (error) {
		console.error("[PUT_ORPHANED_RECORD]", error)
		return NextResponse.json({ error: "Error al actualizar el registro" }, { status: 500 })
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const { error, status } = await validateSession()

	if (error) {
		return NextResponse.json({ error }, { status })
	}

	try {
		const { id } = await params

		const existing = await prisma.inPersonSafetyTalkRecord.findUnique({
			where: { id },
		})

		if (!existing) {
			return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
		}

		await prisma.inPersonSafetyTalkRecord.delete({
			where: { id },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("[DELETE_ORPHANED_RECORD]", error)
		return NextResponse.json({ error: "Error al eliminar el registro" }, { status: 500 })
	}
}
