import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"

import { ACTIVITY_TYPE, ACTOR_TYPE, ACTIVITY_SEVERITY, MODULES } from "@/generated/prisma/enums"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

const ALLOWED_SORT_FIELDS = ["timestamp", "module", "action", "entityType"] as const
type ActivityLogSortBy = (typeof ALLOWED_SORT_FIELDS)[number]

const VALID_MODULES = Object.values(MODULES) as string[]
const VALID_ACTIONS = Object.values(ACTIVITY_TYPE) as string[]

const actorTypeSchema = z.enum(
	Object.values(ACTOR_TYPE) as [ACTOR_TYPE, ...ACTOR_TYPE[]]
)
const activitySeveritySchema = z.enum(
	Object.values(ACTIVITY_SEVERITY) as [ACTIVITY_SEVERITY, ...ACTIVITY_SEVERITY[]]
)

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "15")
		const search = searchParams.get("search") || ""
		const module = searchParams.get("module") || "all"
		const action = searchParams.get("action") || "all"
		const userId = searchParams.get("userId") || "all"
		const dateFrom = searchParams.get("dateFrom")
		const dateTo = searchParams.get("dateTo")
		const requestedOrderBy = searchParams.get("orderBy") as OrderBy | null
		const requestedOrder = searchParams.get("order") as Order | null
		const orderBy: ActivityLogSortBy =
			requestedOrderBy && ALLOWED_SORT_FIELDS.includes(requestedOrderBy as ActivityLogSortBy)
				? (requestedOrderBy as ActivityLogSortBy)
				: "timestamp"
		const order: Order = requestedOrder === "asc" ? "asc" : "desc"

		const rawActorType = searchParams.get("actorType")
		const parsedActorType = rawActorType ? actorTypeSchema.safeParse(rawActorType) : null
		const actorType = parsedActorType?.success ? parsedActorType.data : null

		const rawSeverity = searchParams.get("severity")
		const parsedSeverity = rawSeverity ? activitySeveritySchema.safeParse(rawSeverity) : null
		const severity = parsedSeverity?.success ? parsedSeverity.data : null

		const skip = (page - 1) * limit

		const where = {
			...(module !== "all" && VALID_MODULES.includes(module)
				? { module: module as MODULES }
				: {}),
			...(action !== "all" && VALID_ACTIONS.includes(action)
				? { action: action as ACTIVITY_TYPE }
				: {}),
			...(userId !== "all" ? { userId } : {}),
			...(actorType ? { actorType } : {}),
			...(severity ? { severity } : {}),
			...(dateFrom || dateTo
				? {
						timestamp: {
							...(dateFrom ? { gte: new Date(dateFrom) } : {}),
							...(dateTo ? { lte: new Date(dateTo) } : {}),
						},
					}
				: {}),
			...(search
				? {
						OR: [
							{ entityType: { contains: search, mode: "insensitive" as const } },
							{ entityId: { contains: search, mode: "insensitive" as const } },
							{ user: { name: { contains: search, mode: "insensitive" as const } } },
							{ user: { email: { contains: search, mode: "insensitive" as const } } },
							{ externalActor: { name: { contains: search, mode: "insensitive" as const } } },
							{ externalActor: { email: { contains: search, mode: "insensitive" as const } } },
						],
					}
				: {}),
		}

		const [logs, total] = await Promise.all([
			prisma.activityLog.findMany({
				where,
				select: {
					id: true,
					timestamp: true,
					module: true,
					action: true,
					entityId: true,
					entityType: true,
					metadata: true,
					actorType: true,
					severity: true,
					ipAddress: true,
					userAgent: true,
					sessionId: true,
					requestId: true,
					changesBefore: true,
					changesAfter: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
							company: {
								select: {
									id: true,
									name: true,
									rut: true,
									image: true,
								},
							},
						},
					},
					externalActor: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: {
					[orderBy]: order,
				},
			}),
			prisma.activityLog.count({ where }),
		])

		return NextResponse.json({
			logs,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[ACTIVITY_LOGS_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
