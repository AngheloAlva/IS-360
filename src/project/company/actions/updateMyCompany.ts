"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface UpdateCompanyProps {
	companyId: string
	imageUrl?: string
}

export const updateCompany = async ({ companyId, imageUrl }: UpdateCompanyProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const company = await prisma.company.update({
			where: {
				id: companyId,
			},
			data: {
				image: imageUrl || undefined,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.COMPANY,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: company.id,
			entityType: "Company",
			metadata: {
				name: company.name,
				rut: company.rut,
				updatedImage: !!imageUrl,
			},
		})

		return {
			ok: true,
			data: company,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar la empresa",
		}
	}
}
