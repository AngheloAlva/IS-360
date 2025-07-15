import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user || !session.user.role) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10
		const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1
		const onlyUnread = searchParams.get("onlyUnread") === "true"
		const skip = (page - 1) * limit

		const userRoles = session.user.role.split(",")

		const where = {
			targetRole: {
				in: userRoles,
			},
			...(onlyUnread ? { isRead: false } : {}),
		}

		const notifications = await prisma.notification.findMany({
			where,
			orderBy: {
				createdAt: "desc",
			},
			skip,
			take: limit,
		})

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

		const notification = await prisma.notification.update({
			where: {
				id,
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
