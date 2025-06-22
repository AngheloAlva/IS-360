"use server"

import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getWorkRequests() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return {
			ok: false,
			message: "No se pudo obtener la sesión del usuario",
		}
	}

	try {
		const workRequests = await prisma.workRequest.findMany({
			include: {
				user: {
					select: {
						name: true,
						email: true,
						image: true,
						company: {
							select: {
								name: true,
							},
						},
					},
				},
				attachments: true,
				comments: {
					include: {
						user: {
							select: {
								name: true,
								email: true,
								image: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		})

		return workRequests
	} catch (error) {
		console.error("Error al obtener las solicitudes de trabajo:", error)
		throw new Error("Error al obtener las solicitudes de trabajo")
	}
}

export async function getWorkRequestById(id: string) {
	try {
		const workRequest = await prisma.workRequest.findUnique({
			where: {
				id,
			},
			include: {
				user: {
					select: {
						name: true,
						email: true,
						image: true,
						company: {
							select: {
								name: true,
							},
						},
					},
				},
				attachments: true,
				comments: {
					include: {
						user: {
							select: {
								name: true,
								email: true,
								image: true,
							},
						},
					},
					orderBy: {
						createdAt: "asc",
					},
				},
			},
		})

		if (!workRequest) {
			throw new Error("Solicitud no encontrada")
		}

		return workRequest
	} catch (error) {
		console.error("Error al obtener la solicitud de trabajo:", error)
		throw new Error("Error al obtener la solicitud de trabajo")
	}
}
