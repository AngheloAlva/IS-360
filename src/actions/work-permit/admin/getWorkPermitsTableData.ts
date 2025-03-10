"use server"

import prisma from "@/lib/prisma"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export async function getWorkPermitsTableData() {
	const workPermits = await prisma.workPermit.findMany({
		include: {
			otNumber: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	})

	return workPermits.map((permit) => ({
		id: permit.id,
		otNumber: permit.otNumber.otNumber,
		company: permit.executanCompany,
		area: permit.exactPlace,
		type: permit.workWillBe,
		status: permit.workCompleted ? "Completado" : "En Progreso",
		date: format(permit.createdAt, "PPP", { locale: es }),
	}))
}
