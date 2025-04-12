"use server"

import prisma from "@/lib/prisma"

import type { CompanySchema } from "@/lib/form-schemas/admin/company/company.schema"

interface CreateCompanyProps {
	values: CompanySchema
}

export const createCompany = async ({ values }: CreateCompanyProps) => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { vehicles, addVehicle, supervisors, ...rest } = values

		const company = await prisma.company.create({
			data: {
				...rest,
				vehicles: {
					create:
						vehicles?.map((vehicle) => ({
							...vehicle,
							year: Number(vehicle.year),
						})) ?? [],
				},
			},
		})

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
