import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		const [
			totalUsers,
			usersByRole,
			usersByArea,
			usersByInternalRole,
			twoFactorEnabled,
			recentlyActiveUsers,
		] = await Promise.all([
			// Total users
			prisma.user.count(),

			// Users by role
			prisma.user.groupBy({
				by: ["role"],
				_count: true,
				cacheStrategy: {
					ttl: 60,
					swr: 10,
				},
			}),

			// Users by area
			prisma.user.groupBy({
				by: ["area"],
				_count: true,
				where: {
					area: { not: null },
				},
				cacheStrategy: {
					ttl: 60,
					swr: 10,
				},
			}),

			// Users by internal role
			prisma.user.groupBy({
				by: ["internalRole"],
				_count: true,
				cacheStrategy: {
					ttl: 60,
					swr: 10,
				},
			}),

			// Users with 2FA enabled
			prisma.user.count({
				where: {
					twoFactorEnabled: true,
				},
				cacheStrategy: {
					ttl: 60,
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
				orderBy: [
					{
						sessions: {
							_count: "desc",
						},
					},
				],
				take: 4,
				cacheStrategy: {
					ttl: 60,
					swr: 10,
				},
			}),
		])

		const roleColors = {
			SUPERADMIN: "bg-red-500",
			ADMIN: "bg-amber-500",
			USER: "bg-blue-500",
			OPERATOR: "bg-green-500",
			PARTNER_COMPANY: "bg-purple-500",
		}

		const formattedUsersByRole = usersByRole.map(
			(role: { role: keyof typeof roleColors; _count: number }) => ({
				role: role.role,
				count: role._count,
				color: roleColors[role.role],
			})
		)

		const formattedUsersByArea = usersByArea.map(
			(area: { area: string | null; _count: number }) => ({
				area: area.area,
				count: area._count,
			})
		)

		const formattedUsersByInternalRole = usersByInternalRole.map(
			(role: { internalRole: string; _count: number }) => ({
				role: role.internalRole,
				count: role._count,
			})
		)

		const formattedRecentUsers = recentlyActiveUsers.map(
			(user: {
				id: string
				name: string
				role: string
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
					role: user.role,
					image: user.image,
					lastActive: lastActiveText,
				}
			}
		)

		return NextResponse.json({
			totalUsers,
			activeUsers: recentlyActiveUsers.length,
			usersByRole: formattedUsersByRole,
			usersByArea: formattedUsersByArea.sort(
				(a: { count: number }, b: { count: number }) => b.count - a.count
			),
			usersByInternalRole: formattedUsersByInternalRole,
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
