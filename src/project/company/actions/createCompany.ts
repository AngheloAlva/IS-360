"use server"

import { createStartupFolder } from "@/project/startup-folder/actions/createStartupFolder"
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
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { vehicles, supervisors, startupFolderName, ...rest } = values

		const company = await prisma.company.create({
			data: {
				...rest,
			},
		})

		const { ok, message } = await createStartupFolder({
			companyId: company.id,
			name: startupFolderName || "Carpeta de arranque",
		})

		if (vehicles && vehicles.length > 0) {
			vehicles.forEach(async (vehicle) => {
				await prisma.vehicle.create({
					data: {
						...vehicle,
						companyId: company.id,
						year: Number(vehicle.year),
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
