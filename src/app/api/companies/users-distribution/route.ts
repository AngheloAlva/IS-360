import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET() {
	try {
		const usersDistribution = await prisma.company.findMany({
			select: {
				id: true,
				name: true,
				_count: {
					select: {
						users: true,
					},
				},
			},
			cacheStrategy: {
				ttl: 60,
				swr: 10,
			},
		})

		return NextResponse.json({
			usersDistribution: usersDistribution.map((company) => ({
				name: company.name,
				count: company._count.users,
			})),
		})
	} catch (error) {
		console.error("Error fetching users distribution:", error)
		return NextResponse.json({ error: "Error fetching users distribution" }, { status: 500 })
	}
}
