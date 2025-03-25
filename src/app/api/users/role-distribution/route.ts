import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		const roleDistribution = await prisma.user.groupBy({
			by: ['role'],
			_count: true
		})

		const supervisorsCount = await prisma.user.count({
			where: {
				isSupervisor: true
			}
		})

		return NextResponse.json({
			roleDistribution: roleDistribution.map(item => ({
				role: item.role,
				count: item._count
			})),
			supervisorsCount
		})
	} catch (error) {
		console.error('Error fetching role distribution:', error)
		return NextResponse.json(
			{ error: 'Error fetching role distribution' },
			{ status: 500 }
		)
	}
}
