"use server"

import prisma from "@/lib/prisma"
import {
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

import type { EnvironmentalDocType, SafetyAndHealthDocumentType } from "@prisma/client"

interface CreateStartupFolderProps {
	name: string
	companyId: string
}

export const createStartupFolder = async ({ name, companyId }: CreateStartupFolderProps) => {
	try {
		const startupFolder = await prisma.startupFolder.create({
			data: {
				name,
				companyId,
			},
		})

		const safetyAndHealthFolder = await prisma.safetyAndHealthFolder.create({
			data: {
				startupFolder: {
					connect: {
						id: startupFolder.id,
					},
				},
				documents: {
					createMany: {
						data: SAFETY_AND_HEALTH_STRUCTURE.documents.map((doc) => ({
							url: "",
							name: doc.name,
							type: doc.type as SafetyAndHealthDocumentType,
							category: SAFETY_AND_HEALTH_STRUCTURE.category,
						})),
					},
				},
			},
		})

		const environmentalFolder = await prisma.environmentalFolder.create({
			data: {
				startupFolder: {
					connect: {
						id: startupFolder.id,
					},
				},
				documents: {
					createMany: {
						data: ENVIRONMENTAL_STRUCTURE.documents.map((doc) => ({
							url: "",
							name: doc.name,
							type: doc.type as EnvironmentalDocType,
							category: ENVIRONMENTAL_STRUCTURE.category,
						})),
					},
				},
			},
		})

		if (!startupFolder || !safetyAndHealthFolder || !environmentalFolder) {
			return {
				ok: false,
				message: "Error al crear la carpeta de arranque",
			}
		}

		return {
			ok: true,
			message: "Carpeta de arranque creada correctamente",
			data: {
				folderId: startupFolder.id,
			},
		}
	} catch (error) {
		console.error("Error al crear la carpeta de arranque:", error)
		return {
			ok: false,
			message: "Error al crear la carpeta de arranque",
		}
	}
}
