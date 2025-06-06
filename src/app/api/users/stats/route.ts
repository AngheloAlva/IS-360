import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET() {
	try {
		const [totalUsers, usersByArea, internalUsers, recentlyActiveUsers] = await Promise.all([
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

			// Get all internal users with their roles
			prisma.user.findMany({
				select: {
					role: true,
				},
				where: {
					accessRole: "ADMIN",
					role: { not: null },
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
					accessRole: "ADMIN",
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
				take: 5,
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),
		])

		const formattedUsersByArea = usersByArea
			.filter((area) => area.area !== null)
			.map((area: { area: string | null; _count: number }) => ({
				area: area.area as string,
				count: area._count,
			}))

		// Process roles from comma-separated strings
		const roleCount = new Map<string, number>()
		internalUsers.forEach((user: { role: string | null }) => {
			if (user.role) {
				const roles = user.role.split(",")
				roles.forEach((role) => {
					const trimmedRole = role.trim()
					roleCount.set(trimmedRole, (roleCount.get(trimmedRole) || 0) + 1)
				})
			}
		})

		const formattedUsersByRole = Array.from(roleCount.entries())
			.map(([role, count]) => ({
				role,
				count,
			}))
			.sort((a, b) => b.count - a.count)

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
			usersByRole: formattedUsersByRole.sort(
				(a: { count: number }, b: { count: number }) => b.count - a.count
			),
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
