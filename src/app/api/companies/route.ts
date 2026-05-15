import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { getAllowedCompanyIds } from "@/shared/actions/users/get-allowed-companies"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

const ALLOWED_SORT_FIELDS = ["name", "rut", "createdAt"] as const
type CompanySortBy = (typeof ALLOWED_SORT_FIELDS)[number]
type ActiveStatus = "all" | "active" | "inactive"

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const userAllowedCompanies = await getAllowedCompanyIds(session.user.id)

		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""
		const requestedOrder = searchParams.get("order") as Order | null
		const requestedOrderBy = searchParams.get("orderBy") as OrderBy | null
		const requestedActiveStatus = searchParams.get("activeStatus") as ActiveStatus | null
		const order: Order = requestedOrder === "desc" ? "desc" : "asc"
		const orderBy: CompanySortBy =
			requestedOrderBy && ALLOWED_SORT_FIELDS.includes(requestedOrderBy as CompanySortBy)
				? (requestedOrderBy as CompanySortBy)
				: "name"
		const showAll = searchParams.get("showAll") === "true"
		const activeStatus: ActiveStatus =
			requestedActiveStatus === "inactive"
				? "inactive"
				: requestedActiveStatus === "all"
					? "all"
					: "active"

		const skip = (page - 1) * limit

		const activeWhere = showAll
			? activeStatus === "inactive"
				? { isActive: false }
				: activeStatus === "active"
					? { isActive: true }
					: {}
			: { isActive: true }

		const where = {
			...activeWhere,
			...(userAllowedCompanies?.length
				? {
						id: {
							in: userAllowedCompanies,
						},
					}
				: {}),
			...(search
				? {
						OR: [
							{ name: { contains: search, mode: "insensitive" as const } },
							{ rut: { contains: search, mode: "insensitive" as const } },
							{
								users: {
									some: {
										OR: [
											{ name: { contains: search, mode: "insensitive" as const } },
											{ rut: { contains: search, mode: "insensitive" as const } },
										],
									},
								},
							},
						],
					}
				: {}),
		}

		const [companies, total] = await Promise.all([
			prisma.company.findMany({
				where,
				select: {
					id: true,
					rut: true,
					name: true,
					image: true,
					isActive: true,
					createdBy: {
						select: {
							id: true,
							name: true,
						},
					},
					users: {
						where: {
							isActive: true,
							isSupervisor: true,
						},
						select: {
							id: true,
							name: true,
							isSupervisor: true,
						},
					},
					StartupFolders: {
						select: {
							id: true,
							status: true,
						},
					},
					createdAt: true,
				},
				orderBy: {
					[orderBy]: order,
				},
				skip,
				take: limit,
			}),
			prisma.company.count({
				where,
			}),
		])

		return NextResponse.json({
			companies,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("Error fetching companies:", error)
		return NextResponse.json({ error: "Error fetching companies" }, { status: 500 })
	}
}
