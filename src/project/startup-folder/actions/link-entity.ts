"use server"

import { headers } from "next/headers"

import { linkVehicleEntity } from "./vehicle/link-vehicle-entity"
import { linkWorkerEntity } from "./worker/link-worker-entity"
import { linkBasicEntity } from "./basic/link-basic-entity"
import { DocumentCategory } from "@prisma/client"
import { auth } from "@/lib/auth"

interface LinkEntityProps {
	entityId: string
	isDriver?: boolean
	startupFolderId: string
	entityCategory: DocumentCategory
}

interface LinkEntityResponse {
	ok: boolean
	message: string
}

export const linkEntity = async ({
	entityId,
	isDriver,
	entityCategory,
	startupFolderId,
}: LinkEntityProps): Promise<LinkEntityResponse> => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		throw new Error("No se encontro usuario")
	}

	const userId = session.user.id

	try {
		switch (entityCategory) {
			case DocumentCategory.VEHICLES:
				await linkVehicleEntity({ startupFolderId, entityId, userId })
				break
			case DocumentCategory.PERSONNEL:
				await linkWorkerEntity({ startupFolderId, entityId, userId, isDriver: isDriver || false })
				break
			case DocumentCategory.BASIC:
				await linkBasicEntity({ startupFolderId, entityId, userId })
				break
		}

		return {
			ok: true,
			message: "Entidad vinculada exitosamente",
		}
	} catch (error) {
		console.error("Error vinculando entidad:", error)
		return {
			ok: false,
			message: "Error al vincular la entidad",
		}
	}
}
