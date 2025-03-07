"use server"

import prisma from "@/lib/prisma"

import type { workBookSchema } from "@/lib/form-schemas/work-book/work-book.schema"
import type { z } from "zod"

export const updateWorkBook = async (id: string, values: z.infer<typeof workBookSchema>) => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { otNumber, ...rest } = values

		const newWorkBook = await prisma.workBook.update({
			where: {
				id: id,
			},
			data: rest,
		})

		return {
			ok: true,
			message: "Área de prevención actualizada exitosamente",
			workBookName: newWorkBook.workName,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear el área de prevención",
		}
	}
}
