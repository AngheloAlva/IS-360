import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ companyId: string }> }
) {
	try {
		const companyId = (await params).companyId

		const company = await prisma.company.findFirst({
			where: {
				id: companyId,
			},
			select: {
				id: true,
				name: true,
				rut: true,
				users: {
					select: {
						id: true,
						name: true,
						isSupervisor: true,
					},
				},
				createdAt: true,
			},
			cacheStrategy: {
				ttl: 60,
				swr: 10,
			},
		})

		return NextResponse.json({
			company,
		})
	} catch (error) {
		console.error("Error fetching companies:", error)
		return NextResponse.json({ error: "Error fetching companies" }, { status: 500 })
	}
}
