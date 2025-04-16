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

			await tx.rootFolder.createMany({
				data: [
					{
						name: "Datos de la Empresa",
						slug: "datos-de-la-empresa",
						type: "COMPANY_INFORMATION",
						companyId: company.id,
					},
					{
						name: "MIPER y Plan de Prevención de Riesgos",
						slug: "miper-y-plan-de-prevencion-de-riesgos",
						type: "RISK_PREVENTION",
						companyId: company.id,
					},
					{
						name: "Procedimientos de Trabajo y Emergencia",
						slug: "procedimientos-de-trabajo-y-emergencia",
						type: "WORK_PROCEDURES",
						companyId: company.id,
					},
					{
						name: "Documentación del Personal",
						slug: "documentacion-del-personal",
						type: "PERSONNEL_DOCUMENTS",
						companyId: company.id,
					},
					{
						name: "Exámenes Ocupacionales",
						slug: "examenes-ocupacionales",
						type: "OCCUPATIONAL_EXAMS",
						companyId: company.id,
					},
					{
						name: "Reglamento Interno de Orden, Higiene y Seguridad (RIOHS)",
						slug: "reglamento-interno-de-orden-higiene-y-seguridad-riohs",
						type: "INTERNAL_REGULATIONS",
						companyId: company.id,
					},
					{
						name: "Obligaciones de Informar (ODI)",
						slug: "obligaciones-de-informar-odi",
						type: "INFORMATION_DUTIES",
						companyId: company.id,
					},
					{
						name: "Entrega de Equipos de Protección Personal (EPP)",
						slug: "entrega-de-equipos-de-proteccion-personal",
						type: "PPE_DELIVERY",
						companyId: company.id,
					},
					{
						name: "Certificados de EPP",
						slug: "certificados-de-epp",
						type: "PPE_CERTIFICATES",
						companyId: company.id,
					},
					{
						name: "Documentación de Vehículos",
						slug: "documentacion-de-vehiculos",
						type: "VEHICLES",
						companyId: company.id,
					},
					{
						name: "Prevencionista de Riesgos",
						slug: "prevencionista-de-riesgos",
						type: "SAFETY_ADVISOR",
						companyId: company.id,
					},
					{
						name: "Documentación Legal",
						slug: "documentacion-legal",
						type: "LEGAL",
						companyId: company.id,
					},
				],
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
