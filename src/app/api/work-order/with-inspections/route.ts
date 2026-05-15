import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { getAllowedCompanyIds } from "@/shared/actions/users/get-allowed-companies"
import { ENTRY_TYPE } from "@/generated/prisma/enums"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type {
	WORK_ORDER_TYPE,
	WORK_ORDER_STATUS,
	INSPECTION_STATUS,
	WORK_ORDER_PRIORITY,
} from "@/generated/prisma/enums"

// Tipos para la respuesta del API
interface InspectionComment {
	id: string
	content: string | null
	type: string
	createdAt: Date
	author: {
		name: string
		email: string
	}
}

interface InspectionEntry {
	id: string
	executionDate: Date
	comments: string | null
	inspectionStatus: INSPECTION_STATUS | null
	supervisionComments: string | null
	safetyObservations: string | null
	nonConformities: string | null
	createdAt: Date
	createdBy: {
		id: string
		name: string
		email: string
	}
	inspectionComments: InspectionComment[]
}

interface WorkOrderWithInspections {
	id: string
	otNumber: string
	workBookName: string | null
	workRequest: string
	status: WORK_ORDER_STATUS
	type: WORK_ORDER_TYPE
	priority: WORK_ORDER_PRIORITY
	progress: number | null
	solicitationDate: Date
	programDate: Date
	estimatedEndDate: Date | null
	company: {
		id: string
		name: string
		rut: string
	} | null
	supervisor: {
		id: string
		name: string
		email: string
		phone: string | null
	} | null
	workBookEntries: InspectionEntry[]
	_count: {
		workBookEntries: number
	}
}

interface FormattedInspectionData {
	workOrder: {
		otNumber: string
		workBookName: string | null
		workRequest: string
		status: WORK_ORDER_STATUS
		type: WORK_ORDER_TYPE
		priority: WORK_ORDER_PRIORITY
		progress: number | null
		solicitationDate: Date
		programDate: Date
		estimatedEndDate: Date | null
		company: {
			id: string
			name: string
			rut: string
		} | null
		supervisor: {
			id: string
			name: string
			email: string
			phone: string | null
		} | null
		totalInspections: number
	}
	inspection: {
		inspectionNumber: number
		id: string
		executionDate: Date
		comments: string | null
		inspectionStatus: INSPECTION_STATUS | null
		supervisionComments: string | null
		safetyObservations: string | null
		nonConformities: string | null
		createdAt: Date
		createdBy: {
			id: string
			name: string
			email: string
		}
		inspectionComments: InspectionComment[]
	}
}

export interface WorkOrdersWithInspectionsResponse {
	workOrders: WorkOrderWithInspections[]
	formattedData: FormattedInspectionData[]
	total: number
	totalInspections: number
}

export async function GET(): Promise<
	NextResponse<WorkOrdersWithInspectionsResponse | { error: string }>
> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const userAllowedCompanies = await getAllowedCompanyIds(session.user.id)

		// Obtener todas las OTs que tienen al menos una inspección interna
		const workOrdersWithInspections = await prisma.workOrder.findMany({
			where: {
				deletedAt: null,
				...(userAllowedCompanies?.length
					? {
							company: {
								id: {
									in: userAllowedCompanies,
								},
							},
						}
					: {}),
				workBookEntries: {
					some: {
						entryType: ENTRY_TYPE.INTERNAL_INSPECTION,
					},
				},
			},
			select: {
				id: true,
				otNumber: true,
				workBookName: true,
				workRequest: true,
				status: true,
				type: true,
				priority: true,
				progress: true,
				solicitationDate: true,
				programDate: true,
				estimatedEndDate: true,
				company: {
					select: {
						id: true,
						name: true,
						rut: true,
					},
				},
				supervisor: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
					},
				},
				workBookEntries: {
					where: {
						entryType: ENTRY_TYPE.INTERNAL_INSPECTION,
					},
					select: {
						id: true,
						executionDate: true,
						comments: true,
						inspectionStatus: true,
						supervisionComments: true,
						safetyObservations: true,
						nonConformities: true,
						createdAt: true,
						createdBy: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
						inspectionComments: {
							select: {
								id: true,
								content: true,
								type: true,
								createdAt: true,
								author: {
									select: {
										name: true,
										email: true,
									},
								},
							},
							orderBy: {
								createdAt: "asc",
							},
						},
					},
					orderBy: {
						executionDate: "desc",
					},
				},
				_count: {
					select: {
						workBookEntries: {
							where: {
								entryType: ENTRY_TYPE.INTERNAL_INSPECTION,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		})

		// Formatear los datos para el Excel
		const formattedData = workOrdersWithInspections.flatMap((workOrder) =>
			workOrder.workBookEntries.map((inspection, index) => ({
				workOrder: {
					otNumber: workOrder.otNumber,
					workBookName: workOrder.workBookName,
					workRequest: workOrder.workRequest,
					status: workOrder.status,
					type: workOrder.type,
					priority: workOrder.priority,
					progress: workOrder.progress,
					solicitationDate: workOrder.solicitationDate,
					programDate: workOrder.programDate,
					estimatedEndDate: workOrder.estimatedEndDate,
					company: workOrder.company,
					supervisor: workOrder.supervisor,
					totalInspections: workOrder._count.workBookEntries,
				},
				inspection: {
					inspectionNumber: index + 1,
					id: inspection.id,
					executionDate: inspection.executionDate,
					comments: inspection.comments,
					inspectionStatus: inspection.inspectionStatus,
					supervisionComments: inspection.supervisionComments,
					safetyObservations: inspection.safetyObservations,
					nonConformities: inspection.nonConformities,
					createdAt: inspection.createdAt,
					createdBy: inspection.createdBy,
					inspectionComments: inspection.inspectionComments,
				},
			}))
		)

		return NextResponse.json({
			workOrders: workOrdersWithInspections,
			formattedData,
			total: workOrdersWithInspections.length,
			totalInspections: formattedData.length,
		})
	} catch (error) {
		console.error("[WORK_ORDERS_WITH_INSPECTIONS_GET]", error)
		return NextResponse.json(
			{ error: "Error al obtener órdenes de trabajo con inspecciones" },
			{ status: 500 }
		)
	}
}
