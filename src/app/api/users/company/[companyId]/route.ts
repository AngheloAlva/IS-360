import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

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
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""

		const skip = (page - 1) * limit

		// Get statistics
		const [users, total] = await Promise.all([
			// Fetch work books with pagination
			prisma.user.findMany({
				where: {
					isActive: true,
					companyId,
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" as const } },
									{ email: { contains: search, mode: "insensitive" as const } },
									{ rut: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
				select: {
					id: true,
					rut: true,
					name: true,
					role: true,
					phone: true,
					email: true,
					image: true,
					companyId: true,
					isSupervisor: true,
					internalRole: true,
					internalArea: true,
				},
				skip,
				take: limit,
				orderBy: {
					createdAt: "desc",
				},
			}),
			// Get total count
			prisma.user.count({
				where: {
					companyId,
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" as const } },
									{ email: { contains: search, mode: "insensitive" as const } },
									{ rut: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
			}),
		])

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
