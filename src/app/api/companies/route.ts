import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""
		const order = searchParams.get("order") as Order
		const orderBy = searchParams.get("orderBy") as OrderBy

		const skip = (page - 1) * limit

		const [companies, total] = await Promise.all([
			prisma.company.findMany({
				where: {
					isActive: true,
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" as const } },
									{ rut: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
				select: {
					id: true,
					rut: true,
					name: true,
					image: true,
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
				cacheStrategy: {
					ttl: 10,
					swr: 10,
				},
			}),
			prisma.company.count({
				where: {
					isActive: true,
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" as const } },
									{ rut: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
				cacheStrategy: {
					ttl: 10,
					swr: 10,
				},
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
