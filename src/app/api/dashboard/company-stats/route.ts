import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { ACCESS_ROLE, WORK_ORDER_STATUS, WORK_PERMIT_STATUS } from "@prisma/client"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const companyId = searchParams.get("companyId")

		if (!companyId) {
			return new NextResponse("ID de empresa requerido", { status: 400 })
		}

		// 1. Obtener información básica de la empresa
		const company = await prisma.company.findUnique({
			where: { id: companyId },
		})

		if (!company) {
			return new NextResponse("Empresa no encontrada", { status: 404 })
		}

		// 2. Obtener estadísticas básicas
		const [collaborators, activeWorkPermits, vehicles, activeWorkOrders] = await Promise.all([
			// Total de colaboradores (usuarios con rol PARTNER_COMPANY)
			prisma.user.count({
				where: {
					companyId,
					isActive: true,
					accessRole: ACCESS_ROLE.PARTNER_COMPANY,
				},
			}),
			// Permisos de trabajo activos
			prisma.workPermit.count({
				where: {
					companyId,
					status: WORK_PERMIT_STATUS.ACTIVE,
				},
			}),
			// Total de vehículos
			prisma.vehicle.count({
				where: { companyId, isActive: true },
			}),
			// Libros de obras activos
			prisma.workOrder.count({
				where: {
					companyId,
					status: {
						in: [WORK_ORDER_STATUS.PLANNED, WORK_ORDER_STATUS.IN_PROGRESS],
					},
				},
			}),
		])

		// Validar que company no sea null antes de continuar
		if (!company) {
			throw new Error("Company not found")
		}

		// 3. Obtener conteos de permisos de trabajo por estado
		const workPermitStats = await prisma.workPermit.groupBy({
			by: ["status"],
			where: { companyId },
			_count: { _all: true },
		})

		// Calcular totales por estado
		const workPermitStatusCounts = workPermitStats.reduce(
			(acc, { status, _count }) => {
				acc[status] = _count._all
				return acc
			},
			{} as Record<WORK_PERMIT_STATUS, number>
		)

		// Nota: El desglose por tipo de permiso requiere una actualización del modelo
		// Por ahora, retornamos un array vacío
		const workPermitTypes: Array<{
			type: string
			total: number
			active: number
			expired: number
		}> = []

		return NextResponse.json({
			companyInfo: {
				name: company.name,
				rut: company.rut,
				// Campos opcionales
				address: null,
				phone: null,
				email: company.rut, // Usamos RUT como email por ahora
				representativeName: null,
				representativeEmail: null,
				representativePhone: null,
			},
			basicStats: {
				collaborators,
				activeWorkPermits,
				vehicles,
				activeWorkOrders,
			},
			workPermitTypes,
			workPermitStatusCounts,
		})
	} catch (error) {
		console.error("[COMPANY_DASHBOARD_STATS]", error)
		return new NextResponse("Error interno del servidor", { status: 500 })
	}
}
