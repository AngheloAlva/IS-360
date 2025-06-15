"use server"

import prisma from "@/lib/prisma"

interface UpdateCompanyProps {
	companyId: string
	imageUrl?: string
}

export const updateCompany = async ({ companyId, imageUrl }: UpdateCompanyProps) => {
	try {
		const user = await prisma.company.update({
			where: {
				id: companyId,
			},
			data: {
				image: imageUrl || undefined,
			},
		})

		return {
			ok: true,
			data: user,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar el usuario",
		}
	}
}
