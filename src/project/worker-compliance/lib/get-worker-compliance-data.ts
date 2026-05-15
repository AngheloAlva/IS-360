import prisma from "@/lib/prisma"

import type { WorkerComplianceData } from "@/project/worker-compliance/types/worker-compliance"

export async function getWorkerComplianceData(
	workerId: string
): Promise<WorkerComplianceData | null> {
	const worker = await prisma.user.findUnique({
		where: { id: workerId },
		select: {
			id: true,
			name: true,
			rut: true,
			image: true,
			role: true,
			internalRole: true,
			company: {
				select: {
					id: true,
					name: true,
					isActive: true,
				},
			},
			safetyTalks: {
				where: { category: { not: "ENVIRONMENT" } },
				select: {
					category: true,
					status: true,
					score: true,
					minRequiredScore: true,
					completedAt: true,
					expiresAt: true,
					lastAttemptAt: true,
					manuallyApproved: true,
				},
				orderBy: { lastAttemptAt: "desc" },
			},
			workerFolder: {
				where: {
					startupFolder: { isDeleted: false, isArchived: false },
				},
				select: {
					id: true,
					status: true,
					isDriver: true,
					submittedAt: true,
					updatedAt: true,
					startupFolderId: true,
					startupFolder: {
						select: { id: true, name: true, status: true },
					},
					documents: {
						select: {
							id: true,
							type: true,
							status: true,
							expirationDate: true,
							reviewNotes: true,
						},
					},
				},
				orderBy: { updatedAt: "desc" },
			},
			basicFolder: {
				where: {
					startupFolder: { isDeleted: false, isArchived: false },
				},
				select: {
					id: true,
					status: true,
					submittedAt: true,
					updatedAt: true,
					startupFolderId: true,
					startupFolder: {
						select: { id: true, name: true, status: true },
					},
					documents: {
						select: {
							id: true,
							type: true,
							status: true,
							expirationDate: true,
							reviewNotes: true,
						},
					},
				},
				orderBy: { updatedAt: "desc" },
			},
		},
	})

	if (!worker) return null

	return worker as WorkerComplianceData
}
