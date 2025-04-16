"use server"

import prisma from "@/lib/prisma"

import type { CompanySchema } from "@/lib/form-schemas/admin/company/company.schema"

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
		const { vehicles, addVehicle, supervisors, ...rest } = values

		return await prisma.$transaction(async (tx) => {
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

			await tx.starterBook.create({
				data: {
					company: {
						connect: {
							id: company.id,
						},
					},
					folders: {
						create: [
							{
								name: "Medio Ambiente",
								type: "ENVIRONMENT",
								description:
									"Esta carpeta es para agregar toda información relacionada con el medio ambiente",
							},
							{
								name: "Seguridad",
								type: "SAFETY",
								description:
									"Esta carpeta es para agregar toda información relacionada con la seguridad",
							},
							{
								name: "Otros",
								type: "OTHER",
								description:
									"Esta carpeta es para agregar toda información relacionada con otros temas",
							},
						],
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
		})
	} catch (error) {
		console.log(error)
		return {
			ok: false,
			message: "Error al crear la empresa",
		}
	}
}
