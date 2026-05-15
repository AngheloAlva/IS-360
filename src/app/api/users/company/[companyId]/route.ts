import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ReviewStatus } from "@/generated/prisma/enums"

const ALLOWED_SORT_FIELDS = [
	"name",
	"email",
	"rut",
	"internalRole",
	"internalArea",
	"isSupervisor",
	"isActive",
	"createdAt",
] as const

type UsersByCompanySortBy = (typeof ALLOWED_SORT_FIELDS)[number]
type SortOrder = "asc" | "desc"
type ActiveStatus = "all" | "active" | "inactive"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ companyId: string }> }
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const companyId = (await params).companyId

		const searchParams = req.nextUrl.searchParams
		const search = searchParams.get("search") || ""
		const page = parseInt(searchParams.get("page") || "1")
		const showAll = searchParams.get("showAll") === "true"
		const limit = parseInt(searchParams.get("limit") || "10")
		const requestedSortBy = searchParams.get("sortBy") as UsersByCompanySortBy | null
		const requestedSortOrder = searchParams.get("sortOrder") as SortOrder | null
		const requestedActiveStatus = searchParams.get("activeStatus") as ActiveStatus | null

		const sortBy: UsersByCompanySortBy =
			requestedSortBy && ALLOWED_SORT_FIELDS.includes(requestedSortBy)
				? requestedSortBy
				: "createdAt"
		const sortOrder: SortOrder = requestedSortOrder === "asc" ? "asc" : "desc"
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
			companyId,
			...activeWhere,
			...(search
				? {
						OR: [
							{ name: { contains: search, mode: "insensitive" as const } },
							{ email: { contains: search, mode: "insensitive" as const } },
							{ rut: { contains: search, mode: "insensitive" as const } },
						],
					}
				: {}),
		}

		const [rawUsers, total] = await Promise.all([
			prisma.user.findMany({
				where,
				select: {
					id: true,
					rut: true,
					name: true,
					role: true,
					phone: true,
					email: true,
					image: true,
					isActive: true,
					accreditationOverride: true,
					companyId: true,
					isSupervisor: true,
					internalRole: true,
					internalArea: true,
					workerFolder: {
						where: {
							status: ReviewStatus.APPROVED,
							startupFolder: { isArchived: false },
						},
						select: { id: true },
						take: 1,
					},
					basicFolder: {
						where: {
							status: ReviewStatus.APPROVED,
							startupFolder: { isArchived: false },
						},
						select: { id: true },
						take: 1,
					},
				},
				skip,
				take: limit,
				orderBy: {
					[sortBy]: sortOrder,
				},
			}),
			prisma.user.count({
				where,
			}),
		])

		const users = rawUsers.map(({ workerFolder, basicFolder, ...user }) => ({
			...user,
			isAccredited:
				user.accreditationOverride ?? (workerFolder.length > 0 || basicFolder.length > 0),
		}))

		return NextResponse.json({
			total,
			users,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[USERS_GET]", error)
		return NextResponse.json({ error: "Error fetching users" }, { status: 500 })
	}
}
