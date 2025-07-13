import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10
		const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1
		const skip = (page - 1) * limit
		const onlyUnread = searchParams.get("onlyUnread") === "true"

		// Filtrar por notificaciones no leídas si se solicita
		const where = {
			userId: session.user.id,
			...(onlyUnread ? { isRead: false } : {}),
		}

		// Obtener notificaciones - usando el modelo Notification generado por Prisma
		const notifications = await prisma.notification.findMany({
			where,
			orderBy: {
				createdAt: "desc",
			},
			skip,
			take: limit,
		})

		// Obtener el total de notificaciones para la paginación
		const total = await prisma.notification.count({ where })
		const pages = Math.ceil(total / limit)

		return NextResponse.json({
			notifications,
			pagination: {
				total,
				pages,
				page,
				limit,
			},
		})
	} catch (error) {
		console.error("[NOTIFICATIONS_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}

// Endpoint para marcar notificaciones como leídas
export async function PATCH(req: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		const body = await req.json()
		const { id, markAllAsRead } = body

		if (markAllAsRead) {
			// Marcar todas las notificaciones del usuario como leídas
			await prisma.notification.updateMany({
				where: {
					userId: session.user.id,
					isRead: false,
				},
				data: {
					isRead: true,
				},
			})

			return NextResponse.json({ success: true })
		}

		if (!id) {
			return new NextResponse("Notification ID is required", { status: 400 })
		}

		// Marcar una notificación específica como leída
		const notification = await prisma.notification.update({
			where: {
				id,
				userId: session.user.id,
			},
			data: {
				isRead: true,
			},
		})

		return NextResponse.json(notification)
	} catch (error) {
		console.error("[NOTIFICATIONS_MARK_READ]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
