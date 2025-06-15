"use server"

import prisma from "@/lib/prisma"

import type { WorkBookSchema } from "@/project/work-order/schemas/work-book.schema"

interface UpdateWorkOrderLikeBook {
	id: string
	values: WorkBookSchema
}

export const updateWorkOrderLikeBook = async ({ id, values }: UpdateWorkOrderLikeBook) => {
	try {
		await prisma.workOrder.update({
			where: {
				id,
			},
			data: {
				isWorkBookInit: true,
				workName: values.workName,
				workLocation: values.workLocation,
				workStartDate: values.workStartDate,
			},
		})

		return {
			ok: true,
			message: "Libro de obras actualizado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar el libro de obras",
		}
	}
}
