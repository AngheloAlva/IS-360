import { NextResponse } from "next/server"
import { pusherServer } from "@/lib/pusher"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		const body = await req.json()
		const { type, title, message, targetRoles, link } = body

		if (!type || !title || !message || !targetRoles || !Array.isArray(targetRoles) || targetRoles.length === 0) {
			return new NextResponse("Missing required fields", { status: 400 })
		}

		// Para cada rol de destino, crear una notificación en la base de datos
		const notifications = [];
		
		for (const targetRole of targetRoles) {
			// Crear la notificación en la base de datos
			const notification = await prisma.notification.create({
				data: {
					type,
					title,
					message,
					targetRole,
					link,
					userId: session.user.id,
					isRead: false,
				},
			});
			
			notifications.push(notification);
			
			// Enviar la notificación a través de Pusher al canal específico del rol
			await pusherServer.trigger(`${targetRole}-channel`, "notification", {
				id: notification.id,
				type,
				title,
				message,
				link,
				createdAt: notification.createdAt,
				isRead: false,
			});
		}

		return NextResponse.json({ success: true, notifications })
	} catch (error) {
		console.error("[NOTIFICATIONS_SEND]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
