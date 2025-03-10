"use server"

import prisma from "@/lib/prisma"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export async function getWorkBooksTableData() {
	const workBooks = await prisma.workBook.findMany({
		include: {
			otNumber: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	})

	return workBooks.map((book) => ({
		id: book.id,
		otNumber: book.otNumber.otNumber,
		company: book.contractingCompany,
		workName: book.workName,
		location: book.workLocation,
		type: book.workType,
		status: book.workStatus,
		date: format(book.createdAt, "PPP", { locale: es }),
	}))
}
