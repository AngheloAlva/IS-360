"use server"

import { headers } from "next/headers"

import { createStartupFolder } from "@/project/startup-folder/actions/createStartupFolder"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { CompanySchema } from "@/project/company/schemas/company.schema"

interface CreateCompanyProps {
	values: CompanySchema
}

interface CreateCompanyResponse {
	ok: boolean
	message: string
	data?: {
		id: string
	}
}

export const createCompany = async ({
	values,
}: CreateCompanyProps): Promise<CreateCompanyResponse> => {
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
				company: ["create"],
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
		const {
			vehicles,
			supervisors,
			startupFolderName,
			startupFolderType,
			startupFolderMoreMonthDuration,
			...rest
		} = values

		const existingCompany = await prisma.company.findUnique({
			where: {
				rut: rest.rut,
			},
		})

		if (existingCompany) {
			return {
				ok: false,
				message:
					"Ya existe una empresa con el RUT proporcionado. Por favor, verifique el RUT o contacte con el soporte.",
			}
		}

		const company = await prisma.company.create({
			data: {
				...rest,
				createdBy: {
					connect: {
						id: session.user.id,
					},
				},
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.COMPANY,
			action: ACTIVITY_TYPE.CREATE,
			entityId: company.id,
			entityType: "Company",
			metadata: {
				name: rest.name,
				rut: rest.rut,
				hasVehicles: vehicles && vehicles.length > 0,
				hasSupervisors: supervisors && supervisors.length > 0,
			},
		})

		const { ok, message } = await createStartupFolder({
			companyId: company.id,
			type: startupFolderType,
			name: startupFolderName || "Carpeta de arranque",
			moreMonthDuration: startupFolderMoreMonthDuration || false,
		})

		if (vehicles && vehicles.length > 0) {
			vehicles.forEach(async (vehicleData) => {
				const vehicle = await prisma.vehicle.create({
					data: {
						...vehicleData,
						companyId: company.id,
						year: Number(vehicleData.year),
					},
				})

				logActivity({
					userId: session.user.id,
					module: MODULES.COMPANY,
					action: ACTIVITY_TYPE.CREATE,
					entityId: vehicle.id,
					entityType: "Vehicle",
					metadata: {
						companyId: company.id,
						plate: vehicle.plate,
						brand: vehicle.brand,
						model: vehicle.model,
						year: vehicle.year,
					},
				})
			})
		}

		if (!ok) {
			return {
				ok: false,
				message,
			}
		}

		return {
			ok: true,
			message: "Empresa creada exitosamente",
			data: {
				id: company.id,
			},
		}
	} catch (error) {
		console.log(error)
		return {
			ok: false,
			message: "Error al crear la empresa",
		}
	}
}
