"use server"

import prisma from "@/lib/prisma"

import type { workBookSchema } from "@/lib/form-schemas/work-book/work-book.schema"
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import type { z } from "zod"

export const createWorkBook = async (values: z.infer<typeof workBookSchema>) => {
	try {
		const { userId, ...rest } = values

		const newWorkBook = await prisma.workBook.create({
			data: {
				...rest,
				otNumber: {
					create: {
						otNumber: rest.otNumber,
						contractCompany: "",
						endDate: new Date(),
						initDate: new Date(),
						quantityDays: 0,
						equipmentProperty: "",
						type: "",
						estimatedDuration: 0,
						printed: false,
						responsible: {
							connect: {
								id: userId,
							},
						},
					},
				},
				user: {
					connect: {
						id: userId,
					},
				},
			},
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
			code: (error as PrismaClientKnownRequestError).code,
			target: (error as PrismaClientKnownRequestError).meta?.target,
		}
	}
}
