"use server"

import { pusherServer } from "@/lib/pusher"
import prisma from "@/lib/prisma"

interface SendNotificationProps {
	type: string
	title: string
	link?: string
	message: string
	creatorId: string
	targetRoles: string[]
}

export const sendNotification = async ({
	link,
	type,
	title,
	message,
	creatorId,
	targetRoles,
}: SendNotificationProps) => {
	try {
		for (const targetRole of targetRoles) {
			const notification = await prisma.notification.create({
				data: {
					type,
					link,
					title,
					message,
					targetRole,
					user: {
						connect: {
							id: creatorId,
						},
					},
				},
			})

			const res = await pusherServer.trigger(`${targetRole}-channel`, "notification", {
				isRead: false,
				id: notification.id,
				type: notification.type,
				link: notification.link,
				title: notification.title,
				message: notification.message,
				createdAt: notification.createdAt,
			})
			console.log(res)
		}

		return {
			ok: true,
			message: "Notificación enviada correctamente",
		}
	} catch (error) {
		console.error("Error al enviar notificación:", error)
		return {
			ok: false,
			error: "Error al enviar notificación",
		}
	}
}
