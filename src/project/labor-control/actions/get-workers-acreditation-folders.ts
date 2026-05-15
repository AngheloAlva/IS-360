"use server"

import prisma from "@/lib/prisma"

import type { WorkerLaborControlFolder } from "../types"

export async function getWorkersAcreditacionFolders({ folderId }: { folderId: string }): Promise<{
	workerFolders: WorkerLaborControlFolder[]
}> {
	try {
		const workerFolders = await prisma.workerLaborControlFolder.findMany({
			where: { laborControlFolderId: folderId },
			select: {
				id: true,
				status: true,
				workerId: true,
				worker: {
					select: {
						id: true,
						rut: true,
						name: true,
					},
				},
			},
			orderBy: {
				worker: {
					name: "asc",
				},
			},
		})

		return {
			workerFolders,
		}
	} catch (error) {
		console.error("Error fetching startup folder documents:", error)
		throw new Error("Could not fetch startup folder documents")
	}
}
