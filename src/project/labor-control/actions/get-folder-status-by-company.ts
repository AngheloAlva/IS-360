"use server"

import { LABOR_CONTROL_STATUS } from "@/generated/prisma/enums"
import prisma from "@/lib/prisma"

export async function getFolderStatusByCompany({ folderId }: { folderId: string }): Promise<{
	companyAccreditationStatus: LABOR_CONTROL_STATUS
	workerAccreditationStatus: LABOR_CONTROL_STATUS
}> {
	try {
		const workerLaborControlFolder = await prisma.workerLaborControlFolder.findUnique({
			where: { id: folderId },
			select: {
				status: true,
			},
		})

		const laborControlFolder = await prisma.laborControlFolder.findUnique({
			where: { id: folderId },
			select: {
				status: true,
			},
		})

		return {
			companyAccreditationStatus: laborControlFolder?.status || "DRAFT",
			workerAccreditationStatus: workerLaborControlFolder?.status || "DRAFT",
		}
	} catch (error) {
		console.error("Error fetching basic folder documents:", error)
		throw new Error("Could not fetch basic folder documents")
	}
}
