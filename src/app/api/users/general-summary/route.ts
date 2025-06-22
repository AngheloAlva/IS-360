import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function GET(): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {

		const totalUsers = await prisma.user.count({
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		})

		return NextResponse.json({
			totalUsers,
		})
	} catch (error) {
		console.error("Error fetching general summary:", error)
		return NextResponse.json({ error: "Error fetching general summary" }, { status: 500 })
	}
}
