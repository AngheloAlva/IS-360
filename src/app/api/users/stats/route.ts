import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET() {
	try {
		const [totalUsers, usersByArea, twoFactorEnabled, recentlyActiveUsers] = await Promise.all([
			// Total users
			prisma.user.count(),

			// Users by area
			prisma.user.groupBy({
				by: ["area"],
				_count: true,
				where: {
					area: { not: null },
				},
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),

			// Users with 2FA enabled
			prisma.user.count({
				where: {
					twoFactorEnabled: true,
				},
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),

			// Recently active users
			prisma.user.findMany({
				where: {
					sessions: {
						some: {},
					},
				},
				select: {
					id: true,
					name: true,
					role: true,
					image: true,
					sessions: {
						orderBy: {
							updatedAt: "desc",
						},
						take: 1,
						select: {
							updatedAt: true,
						},
					},
				},
				orderBy: {
					updatedAt: "desc",
				},
				take: 3,
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),
		])

		const formattedUsersByArea = usersByArea.map(
			(area: { area: string | null; _count: number }) => ({
				area: area.area,
				count: area._count,
			})
		)

		const formattedRecentUsers = recentlyActiveUsers.map(
			(user: {
				id: string
				name: string
				image: string | null
				sessions: { updatedAt: Date }[]
			}) => {
				const lastActive = user.sessions[0].updatedAt
				const now = new Date()
				const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60))

				let lastActiveText = "Hace un momento"
				if (diffInMinutes > 0) {
					if (diffInMinutes < 60) {
						lastActiveText = `Hace ${diffInMinutes} minutos`
					} else {
						const hours = Math.floor(diffInMinutes / 60)
						lastActiveText = `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`
					}
				}

				return {
					id: user.id,
					name: user.name,
					image: user.image,
					lastActive: lastActiveText,
				}
			}
		)

		return NextResponse.json({
			totalUsers,
			activeUsers: recentlyActiveUsers.length,
			usersByArea: formattedUsersByArea.sort(
				(a: { count: number }, b: { count: number }) => b.count - a.count
			),
			twoFactorEnabled,
			recentlyActiveUsers: formattedRecentUsers,
		})
	} catch (error) {
		console.error("Error fetching user stats:", error)
		return NextResponse.json(
			{ error: "Error al obtener estadísticas de usuarios" },
			{ status: 500 }
		)
	}
}
