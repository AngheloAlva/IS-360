"use server"

import { createStartupFolder } from "@/actions/startup-folders/createStartupFolder"
import prisma from "@/lib/prisma"

import type { CompanySchema } from "@/lib/form-schemas/admin/company/company.schema"
import { createVehicleStartupFolder } from "../vehicles/createVehicleStartupFolder"

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
		const { vehicles, supervisors, ...rest } = values

		const company = await prisma.company.create({
			data: {
				...rest,
			},
		})

		const { ok, message } = await createStartupFolder({ companyId: company.id })

		if (vehicles && vehicles.length > 0) {
			vehicles.forEach(async (vehicle) => {
				const newVehicle = await prisma.vehicle.create({
					data: {
						...vehicle,
						companyId: company.id,
						year: Number(vehicle.year),
					},
				})

				await createVehicleStartupFolder(newVehicle.id)
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
