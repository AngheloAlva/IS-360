import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ planSlug: string }> }
) {
	const { planSlug } = await params

	const searchParams = request.nextUrl.searchParams
	const limit = parseInt(searchParams.get("limit") ?? "10")
	const page = parseInt(searchParams.get("page") ?? "1")
	const search = searchParams.get("search") ?? ""

	const skip = (page - 1) * limit

	try {
		const maintenancePlan = await prisma.maintenancePlan.findFirst({
			where: {
				slug: planSlug,
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

		const [tasks, total] = await Promise.all([
			await prisma.maintenancePlanTask.findMany({
				where: {
					maintenancePlanId: maintenancePlan.id,
					...(search
						? {
								name: { contains: search, mode: "insensitive" },
								description: { contains: search, mode: "insensitive" },
								equipment: { name: { contains: search, mode: "insensitive" } },
							}
						: {}),
				},
				select: {
					id: true,
					name: true,
					slug: true,
					nextDate: true,
					createdAt: true,
					description: true,
					isInternalResponsible: true,
					frequency: true,
					responsible: {
						select: {
							name: true,
						},
					},
					company: {
						select: {
							name: true,
						},
					},
					equipment: {
						select: {
							name: true,
						},
					},
					createdBy: {
						select: {
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
				},
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),
			await prisma.maintenancePlanTask.count({
				where: search
					? {
							maintenancePlanId: maintenancePlan.id,
							name: { contains: search, mode: "insensitive" },
							description: { contains: search, mode: "insensitive" },
							equipment: { name: { contains: search, mode: "insensitive" } },
						}
					: {},
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),
		])

		return NextResponse.json({
			tasks,
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
