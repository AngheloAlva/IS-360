import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const ALLOWED_SORT_FIELDS = [
	"name",
	"tag",
	"location",
	"type",
	"isOperational",
	"createdAt",
	"updatedAt",
] as const

const querySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().default(10),
	search: z.string().optional().default(""),
	parentId: z.string().optional(),
	locationId: z.string().optional(),
	// rootOnly takes precedence over parentId when both are present (ADR-8)
	rootOnly: z.coerce.boolean().optional().default(false),
	showAll: z.coerce.boolean().optional().default(false),
	orderBy: z.enum(ALLOWED_SORT_FIELDS).default("createdAt"),
	order: z.enum(["asc", "desc"]).default("desc"),
})

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()))
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Parámetros inválidos", issues: parsed.error.issues },
			{ status: 400 }
		)
	}

	const { page, limit, search, parentId, locationId, rootOnly, showAll, orderBy, order } =
		parsed.data

	try {
		const skip = (page - 1) * limit

		const buildSearchWhere = (q: string) => ({
			OR: [
				{ name: { contains: q, mode: "insensitive" as const } },
				{ location: { path: { contains: q, mode: "insensitive" as const } } },
				{ tag: { contains: q, mode: "insensitive" as const } },
			],
		})

		const buildOrderBy = (field: (typeof ALLOWED_SORT_FIELDS)[number], dir: "asc" | "desc") => {
			if (field === "location") return { location: { path: dir } }
			return { [field]: dir }
		}

		const parentFilter = rootOnly
			? { parentId: null }
			: showAll
				? {}
				: { parentId: parentId ?? null }

		const whereClause = {
			...parentFilter,
			...(locationId ? { locationId } : {}),
			...(search ? buildSearchWhere(search) : {}),
		}

		const [equipments, total] = await Promise.all([
			prisma.equipment.findMany({
				where: whereClause,
				select: {
					id: true,
					name: true,
					locationId: true,
					location: {
						select: {
							id: true,
							name: true,
							path: true,
						},
					},
					createdAt: true,
					updatedAt: true,
					description: true,
					isOperational: true,
					type: true,
					tag: true,
					parentId: true,
					attachments: {
						select: {
							id: true,
							url: true,
							name: true,
							type: true,
						},
					},
					children: {
						select: {
							id: true,
							name: true,
							locationId: true,
							location: {
								select: {
									id: true,
									name: true,
									path: true,
								},
							},
							createdAt: true,
							updatedAt: true,
							description: true,
							isOperational: true,
							type: true,
							tag: true,
							_count: {
								select: {
									workOrders: true,
									children: true,
								},
							},
						},
					},
					_count: {
						select: {
							workOrders: true,
							children: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: buildOrderBy(orderBy, order),
			}),
			prisma.equipment.count({ where: whereClause }),
		])

		return NextResponse.json({
			total,
			equipments,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[EQUIPMENT_GET]", error)
		return NextResponse.json({ error: "Error fetching equipments" }, { status: 500 })
	}
}
