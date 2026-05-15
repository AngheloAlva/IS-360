import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Order, OrderBy } from "@/shared/components/OrderByButton"

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
		const { companyId } = await params

		const searchParams = req.nextUrl.searchParams
		const order = searchParams.get("order") as Order
		const page = Number(searchParams.get("page") || 1)
		const limit = Number(searchParams.get("limit") || 15)
		const orderBy = searchParams.get("orderBy") as OrderBy

		const skip = (page - 1) * limit

		const [laborControlFolders, total] = await Promise.all([
			prisma.laborControlFolder.findMany({
				where: {
					company: {
						id: companyId,
					},
				},
				select: {
					id: true,
					status: true,
					createdAt: true,
				},
				orderBy: {
					[orderBy]: order,
				},
				skip,
				take: limit,
			}),
			prisma.laborControlFolder.count({
				where: {
					company: {
						id: companyId,
					},
				},
			}),
		])

		return NextResponse.json({ data: laborControlFolders, total })
	} catch (error) {
		console.error("[LABOR_CONTROL_FOLDERS_BY_COMPANY_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
