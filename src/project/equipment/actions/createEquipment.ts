"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { EquipmentSchema } from "@/project/equipment/schemas/equipment.schema"
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/client"
import type { UploadResult } from "@/lib/upload-files"

interface CreateEquipmentProps {
	values: EquipmentSchema
	uploadResults: UploadResult[]
}

export const createEquipment = async ({ values, uploadResults }: CreateEquipmentProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				equipment: ["create"],
			},
		},
	})

	if (!hasPermission) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const barcode = generateBarcode()
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { parentId, files, locationId, ...rest } = values

		await prisma.location.findUniqueOrThrow({
			where: { id: locationId },
		})

		const equipment = await prisma.equipment.create({
			data: {
				barcode,
				createdBy: {
					connect: {
						id: session.user.id,
					},
				},
				location: { connect: { id: locationId } },
				...(parentId && { parent: { connect: { id: parentId } } }),
				...(uploadResults.length > 0 && {
					attachments: {
						create: uploadResults.map((result) => ({
							url: result.url,
							name: result.name,
							type: result.type,
							size: result.size,
						})),
					},
				}),
				...rest,
			},
		})

  await logActivity({
			userId: session.user.id,
			module: MODULES.EQUIPMENT,
			action: ACTIVITY_TYPE.CREATE,
			entityId: equipment.id,
			entityType: "Equipment",
			metadata: {
				name: equipment.name,
				barcode: equipment.barcode,
				createdBy: session.user.id,
				parentId: equipment.parentId,
				attachments: uploadResults.length,
			},
		})

		return {
			ok: true,
		}
	} catch (error) {
		if ((error as PrismaClientKnownRequestError).code === "P2002") {
			const target = (error as PrismaClientKnownRequestError).meta?.target as string[]
			const field = target[0]
			return {
				ok: false,
				message: `Ya existe un equipo con el ${field} '${values[field as keyof EquipmentSchema]}'. Este campo debe ser único.`,
			}
		}

		return {
			ok: false,
			message: "Error al crear el equipo",
		}
	}
}

const generateBarcode = () => {
	return `${Date.now()}`
}
