import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { generateSecureSasUrl, FILES_CONTAINER_NAME } from "@/lib/azure-storage-client"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const { id } = await params

		const workOrder = await prisma.workOrder.findFirst({
			where: {
				id,
				deletedAt: null,
			},
			include: {
				company: {
					select: {
						name: true,
						rut: true,
					},
				},
				supervisor: {
					select: {
						name: true,
						rut: true,
						internalRole: true,
					},
				},
				responsible: {
					select: {
						name: true,
						rut: true,
						internalRole: true,
					},
				},
				equipments: {
					select: {
						id: true,
						name: true,
						tag: true,
						location: { select: { id: true, name: true, path: true } },
						description: true,
					},
				},
				milestones: {
					include: {
						activities: {
							include: {
								createdBy: {
									select: {
										name: true,
										rut: true,
									},
								},
								assignedUsers: {
									select: {
										name: true,
										rut: true,
									},
								},
							},
							orderBy: {
								createdAt: "asc",
							},
						},
					},
					orderBy: {
						order: "asc",
					},
				},
				workBookEntries: {
					include: {
						createdBy: {
							select: {
								name: true,
								rut: true,
							},
						},
						milestone: {
							select: {
								name: true,
							},
						},
						assignedUsers: {
							select: {
								name: true,
								rut: true,
							},
						},
						attachments: {
							select: {
								id: true,
								name: true,
								url: true,
								type: true,
							},
						},
					},
					orderBy: {
						createdAt: "asc",
					},
				},
			},
		})

		if (!workOrder) {
			return NextResponse.json({ error: "Orden de trabajo no encontrada" }, { status: 404 })
		}

		// Generar URLs SAS para las imágenes adjuntas en las actividades
		const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"]

		if (workOrder.workBookEntries && workOrder.workBookEntries.length > 0) {
			for (const entry of workOrder.workBookEntries) {
				if (entry.attachments && entry.attachments.length > 0) {
					for (const attachment of entry.attachments) {
						// Verificar si es una imagen
						const isImage = imageExtensions.some(
							(ext) =>
								attachment.name.toLowerCase().endsWith(ext) ||
								attachment.type.toLowerCase().includes("image")
						)

						if (isImage && attachment.url) {
							try {
								// Extraer el nombre del blob de la URL
								const blobName = attachment.url.split("/").pop() || attachment.url

								// Generar URL SAS con 60 minutos de expiración
								const sasUrl = await generateSecureSasUrl(
									FILES_CONTAINER_NAME,
									blobName,
									"read",
									60,
									false // inline para que se muestre en el PDF
								)

								// Agregar la URL SAS al attachment
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								;(attachment as any).sasUrl = sasUrl
							} catch (error) {
								console.error(`Error generando SAS URL para ${attachment.name}:`, error)
								// Continuar sin la URL SAS si falla
							}
						}
					}
				}
			}
		}

		// Devolver los datos de la orden de trabajo
		return NextResponse.json(workOrder)
	} catch (error) {
		console.error("Error obteniendo datos de la orden de trabajo:", error)
		return NextResponse.json(
			{ error: "Error obteniendo datos de la orden de trabajo" },
			{ status: 500 }
		)
	}
}
