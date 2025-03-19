"use server"

import prisma from "@/lib/prisma"

import type { CompanySchema } from "@/lib/form-schemas/admin/company/company.schema"

interface CreateCompanyProps {
	values: CompanySchema
}

export const createCompany = async ({ values }: CreateCompanyProps) => {
	try {
		await prisma.company.create({
			data: values,
		})

		return {
			ok: true,
			message: "Empresa creada exitosamente",
		}
	} catch (error) {
		console.log(error)
		return {
			ok: false,
			message: "Error al crear la empresa",
		}
	}
}
