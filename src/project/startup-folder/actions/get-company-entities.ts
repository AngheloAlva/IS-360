"use server"

import prisma from "@/lib/prisma"
import { DocumentCategory, USER_ROLE } from "@prisma/client"

interface GetCompanyEntitiesParams {
	companyId: string
	category: DocumentCategory
}

export async function getCompanyEntities({ companyId, category }: GetCompanyEntitiesParams) {
	try {
		switch (category) {
			case "PERSONNEL":
				return await prisma.user.findMany({
					where: {
						companyId,
						accessRole: USER_ROLE.PARTNER_COMPANY,
					},
					select: {
						id: true,
						name: true,
					},
					orderBy: {
						name: "asc",
					},
				})
			case "VEHICLES":
				return await prisma.vehicle
					.findMany({
						where: {
							companyId,
						},
						select: {
							id: true,
							plate: true,
							brand: true,
							model: true,
						},
						orderBy: {
							plate: "asc",
						},
					})
					.then((vehicles) =>
						vehicles.map((vehicle) => ({
							id: vehicle.id,
							name: `${vehicle?.brand ?? ""} ${vehicle?.model ?? ""} - ${vehicle?.plate ?? ""}`.trim(),
						}))
					)
			default:
				return []
		}
	} catch (error) {
		console.error("Error fetching company entities:", error)
		throw new Error("No se pudieron cargar las entidades de la empresa")
	}
}
