import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	try {
		const { searchParams } = new URL(request.url)
		const lockoutPermitId = searchParams.get("lockoutPermitId")

		if (!lockoutPermitId) {
			return NextResponse.json(
				{ error: "El ID del permiso de bloqueo es requerido" },
				{ status: 400 }
			)
		}

		// Verificar que el permiso de bloqueo existe y el usuario tiene acceso
		const lockoutPermit = await prisma.lockoutPermit.findUnique({
			where: { id: lockoutPermitId },
			select: {
				id: true,
				companyId: true,
			},
		})

		if (!lockoutPermit) {
			return NextResponse.json({ error: "Permiso de bloqueo no encontrado" }, { status: 404 })
		}

		// Verificar permisos de acceso
		if (
			session.user.accessRole === "PARTNER_COMPANY" &&
			session.user.companyId !== lockoutPermit.companyId
		) {
			return NextResponse.json({ error: "No tiene permisos para ver estas revisiones" }, { status: 403 })
		}

		// Obtener las revisiones de energía cero
		const reviews = await prisma.zeroEnergyReview.findMany({
			where: { lockoutPermitId },
			include: {
				equipment: {
					select: {
						id: true,
						name: true,
						tag: true,
					},
				},
				performedBy: {
					select: {
						id: true,
						name: true,
						rut: true,
					},
				},
				reviewer: {
					select: {
						id: true,
						name: true,
						rut: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		})

		return NextResponse.json({ reviews })
	} catch (error) {
		console.error("[GET_ZERO_ENERGY_REVIEWS]", error)
		return NextResponse.json(
			{ error: "Error al obtener las revisiones de energía cero" },
			{ status: 500 }
		)
	}
}
