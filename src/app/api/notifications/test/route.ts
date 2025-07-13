import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { pusherServer } from "@/lib/pusher"
import prisma from "@/lib/prisma"

	export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		const { role = "ADMIN", message = "Notificación de prueba", title = "Notificación de prueba" } = await req.json()

		// Crear la notificación en la base de datos
		const notification = await prisma.notification.create({
			data: {
				type: "TEST",
				title,
				message,
				link: "/notifications",
				targetRole: role,
				userId: session.user.id,
				isRead: false,
			},
		})

		// Enviar la notificación a través de Pusher
		await pusherServer.trigger(`${role}-channel`, "notification", {
			id: notification.id,
			type: notification.type,
			title: notification.title,
			message: notification.message,
			link: notification.link,
			createdAt: notification.createdAt,
			isRead: notification.isRead,
		})

		return NextResponse.json({
			success: true,
			message: `Notificación enviada al rol ${role}`,
			notification,
		})
	} catch (error) {
		console.error("[NOTIFICATION_TEST]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
