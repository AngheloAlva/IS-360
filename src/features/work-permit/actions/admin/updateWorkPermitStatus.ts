"use server"

import { z } from "zod"

import prisma from "@/lib/prisma"

const updateWorkPermitStatusSchema = z.object({
	id: z.string(),
	workCompleted: z.boolean(),
})

export async function updateWorkPermitStatus(data: z.infer<typeof updateWorkPermitStatusSchema>) {
	try {
		const { id, workCompleted } = updateWorkPermitStatusSchema.parse(data)

		await prisma.workPermit.update({
			where: { id },
			data: { workCompleted },
		})

		return { success: true }
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new Error("Invalid data")
		}

		throw new Error("Internal Server Error")
	}
}
