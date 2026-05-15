import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { PLAN_FREQUENCY } from "@/generated/prisma/enums"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

import type {
	MaintenanceTaskOrder,
	MaintenanceTaskOrderBy,
} from "@/project/maintenance-plan/components/data/MaintenanceTaskOrderByButton"

const ALLOWED_SORT_FIELDS: MaintenanceTaskOrderBy[] = ["name", "createdAt", "nextDate", "frequency"]
const ALLOWED_AUTOMATION_FILTERS = ["all", "automated", "manual"] as const
type AutomationFilter = (typeof ALLOWED_AUTOMATION_FILTERS)[number]

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ planSlug: string }> }
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	const { planSlug } = await params
	const searchParams = req.nextUrl.searchParams
	const limit = parseInt(searchParams.get("limit") ?? "10")
	const page = parseInt(searchParams.get("page") ?? "1")
	const search = searchParams.get("search") ?? ""
	const frequency = searchParams.get("frequency") ?? ""
	const requestedAutomation = searchParams.get("isAutomated") as AutomationFilter | null
	const nextDateFrom = searchParams.get("nextDateFrom") ?? ""
	const nextDateTo = searchParams.get("nextDateTo") ?? ""
	const isAutomatedFilter: AutomationFilter =
		requestedAutomation && ALLOWED_AUTOMATION_FILTERS.includes(requestedAutomation)
			? requestedAutomation
			: "all"
	const requestedOrder = searchParams.get("order") as MaintenanceTaskOrder | null
	const requestedOrderBy = searchParams.get("orderBy") as MaintenanceTaskOrderBy | null
	const order: MaintenanceTaskOrder = requestedOrder === "desc" ? "desc" : "asc"
	const orderBy: MaintenanceTaskOrderBy =
		requestedOrderBy && ALLOWED_SORT_FIELDS.includes(requestedOrderBy)
			? requestedOrderBy
			: "createdAt"

	const skip = (page - 1) * limit

	try {
		const maintenancePlan = await prisma.maintenancePlan.findFirst({
			where: {
				slug: planSlug,
				isActive: true,
			},
			select: {
				id: true,
			},
		})

		if (!maintenancePlan) {
			return NextResponse.json({
				message: "Plan de mantenimiento no encontrado",
				status: 404,
			})
		}

		const taskWhere = {
			maintenancePlanId: maintenancePlan.id,
			isActive: true,
			...(search
				? {
						OR: [
							{ name: { contains: search, mode: "insensitive" as const } },
							{ description: { contains: search, mode: "insensitive" as const } },
							{ equipment: { name: { contains: search, mode: "insensitive" as const } } },
							{
								equipments: { some: { name: { contains: search, mode: "insensitive" as const } } },
							},
						],
					}
				: {}),
			...(frequency ? { frequency: frequency as PLAN_FREQUENCY } : {}),
			...(isAutomatedFilter === "automated" ? { isAutomated: true } : {}),
			...(isAutomatedFilter === "manual" ? { isAutomated: false } : {}),
			...(nextDateFrom ? { nextDate: { gte: new Date(nextDateFrom) } } : {}),
			...(nextDateTo
				? {
						nextDate: {
							...(nextDateFrom ? { gte: new Date(nextDateFrom) } : {}),
							lte: new Date(nextDateTo),
						},
					}
				: {}),
		}

		const [tasks, total] = await Promise.all([
			await prisma.maintenancePlanTask.findMany({
				where: taskWhere,
				select: {
					id: true,
					name: true,
					slug: true,
					nextDate: true,
					createdAt: true,
					frequency: true,
					specialty: true,
					taskType: true,
					description: true,
					emailsForCopy: true,
					automatedDaysInAdvance: true,
					equipment: {
						select: {
							id: true,
							tag: true,
							name: true,
							location: { select: { id: true, name: true, path: true } },
						},
					},
					equipments: {
						select: {
							id: true,
							tag: true,
							name: true,
							location: { select: { id: true, name: true, path: true } },
						},
					},
					createdBy: {
						select: {
							id: true,
							name: true,
						},
					},
					attachments: {
						select: {
							id: true,
							name: true,
							url: true,
						},
					},
					isAutomated: true,
					automatedCompanyId: true,
					automatedResponsibleId: true,
					automatedSupervisorId: true,
					automatedWorkOrderType: true,
					automatedPriority: true,
					automatedCapex: true,
					automatedEstimatedDays: true,
					automatedEstimatedDaysByMonth: true,
					automatedEstimatedHours: true,
					automatedWorkDescription: true,
					blockIfPreviousNotCompleted: true,
					_count: {
						select: {
							workOrders: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: {
					[orderBy || "createdAt"]: order || "asc",
				},
			}),
			await prisma.maintenancePlanTask.count({
				where: taskWhere,
			}),
		])

		const normalizedTasks = tasks.map((task) => {
			const normalizedEquipments =
				task.equipments.length > 0 ? task.equipments : task.equipment ? [task.equipment] : []
			const primaryEquipment = normalizedEquipments[0] ?? task.equipment

			return {
				...task,
				equipments: normalizedEquipments,
				equipment: primaryEquipment,
			}
		})

		return NextResponse.json({
			tasks: normalizedTasks,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[MAINTENANCE_PLAN_TASKS_GET]", error)
		return NextResponse.json({
			message: "Internal Error",
			status: 500,
		})
	}
}
