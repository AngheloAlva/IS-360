"use server"

import prisma from "@/lib/prisma"

import type { workBookSchema } from "@/lib/form-schemas/work-book/work-book.schema"
import type { z } from "zod"

export const createWorkBook = async (values: z.infer<typeof workBookSchema>) => {
	try {
		const newWorkBook = await prisma.workBook.create({
			data: values,
		})

		return {
			ok: true,
			message: "Área de prevención creada exitosamente",
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
