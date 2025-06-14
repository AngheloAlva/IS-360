"use server"

import prisma from "@/lib/prisma"
import {
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
	VEHICLE_STRUCTURE,
	WORKER_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

import type {
	EnvironmentalDocType,
	SafetyAndHealthDocumentType,
	VehicleDocumentType,
	WorkerDocumentType,
} from "@prisma/client"

interface CreateStartupFolderProps {
	name: string
	companyId: string
}

export const createStartupFolderWithAll = async ({ name, companyId }: CreateStartupFolderProps) => {
	try {
		const company = await prisma.company.findUnique({
			where: {
				id: companyId,
			},
			select: {
				users: {
					select: {
						id: true,
					},
				},
				vehicles: {
					select: {
						id: true,
					},
				},
			},
		})

		if (!company) {
			return {
				ok: false,
				message: "Empresa no encontrada",
			}
		}

		return await prisma.$transaction(async (tx) => {
			const startupFolder = await tx.startupFolder.create({
				data: {
					name,
					companyId,
				},
			})

			const safetyAndHealthFolder = await tx.safetyAndHealthFolder.create({
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

			const environmentalFolder = await tx.environmentalFolder.create({
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

			await Promise.all(
				company.users.map((user) =>
					tx.workerFolder.create({
						data: {
							worker: {
								connect: {
									id: user.id,
								},
							},
							startupFolder: {
								connect: {
									id: startupFolder.id,
								},
							},
							documents: {
								create: WORKER_STRUCTURE.documents.map((doc) => ({
									url: "",
									name: doc.name,
									category: WORKER_STRUCTURE.category,
									type: doc.type as WorkerDocumentType,
								})),
							},
						},
					})
				)
			)

			await Promise.all(
				company.vehicles.map((vehicle) =>
					tx.vehicleFolder.create({
						data: {
							startupFolder: {
								connect: {
									id: startupFolder.id,
								},
							},
							vehicle: {
								connect: {
									id: vehicle.id,
								},
							},
							documents: {
								create: VEHICLE_STRUCTURE.documents.map((doc) => ({
									url: "",
									name: doc.name,
									category: VEHICLE_STRUCTURE.category,
									type: doc.type as VehicleDocumentType,
								})),
							},
						},
					})
				)
			)

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
		})
	} catch (error) {
		console.error("Error al crear la carpeta de arranque:", error)
		return {
			ok: false,
			message: "Error al crear la carpeta de arranque",
		}
	}
}
