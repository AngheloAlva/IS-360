import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		const totalUsers = await prisma.user.count()

		return NextResponse.json({
			totalUsers
		})
	} catch (error) {
		console.error('Error fetching general summary:', error)
		return NextResponse.json(
			{ error: 'Error fetching general summary' },
			{ status: 500 }
		)
	}
}
