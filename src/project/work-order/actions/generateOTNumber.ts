"use server"

import prisma from "@/lib/prisma"

export const generateOTNumber = async () => {
	const counter = await prisma.counter.upsert({
		where: { id: "ot_counter" },
		update: { value: { increment: 1 } },
		create: { id: "ot_counter", value: 1 },
	})

	const now = new Date()
	const day = now.getDate().toString().padStart(2, "0")
	const month = (now.getMonth() + 1).toString().padStart(2, "0")
	const year = now.getFullYear().toString().slice(-2)

	const otNumber = `OT-${counter.value.toString().padStart(4, "0")}${day}${month}${year}`

	return otNumber
}
