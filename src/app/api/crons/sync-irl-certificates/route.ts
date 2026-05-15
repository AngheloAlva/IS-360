import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"
import { syncIrlSafetyTalkCertificate } from "@/project/startup-folder/actions/sync-irl-safety-talk-certificate"

export async function GET(): Promise<NextResponse> {
	try {
		const workersWithPassedIrl = await prisma.userSafetyTalk.findMany({
			where: {
				category: "IRL",
				status: "PASSED",
				user: {
					isActive: true,
				},
			},
			select: {
				userId: true,
			},
			distinct: ["userId"],
		})

		if (workersWithPassedIrl.length === 0) {
			console.log("[CRON_SYNC_IRL_CERTIFICATES] No workers with passed IRL safety talks found")
			return NextResponse.json({
				message: "No workers with passed IRL safety talks found",
				processed: 0,
				successful: 0,
				failed: 0,
			})
		}

		const workerIds = workersWithPassedIrl.map((w) => w.userId)

		const [workerFoldersWithDoc, basicFoldersWithDoc] = await Promise.all([
			prisma.workerFolder.findMany({
				where: {
					workerId: { in: workerIds },
					documents: {
						some: {
							type: "IRL_SAFETY_TALK",
						},
					},
				},
				select: {
					workerId: true,
					startupFolderId: true,
				},
			}),
			prisma.basicFolder.findMany({
				where: {
					workerId: { in: workerIds },
					documents: {
						some: {
							type: "IRL_SAFETY_TALK",
						},
					},
				},
				select: {
					workerId: true,
					startupFolderId: true,
				},
			}),
		])

		const [allWorkerFolders, allBasicFolders] = await Promise.all([
			prisma.workerFolder.findMany({
				where: {
					workerId: { in: workerIds },
				},
				select: {
					workerId: true,
					startupFolderId: true,
				},
			}),
			prisma.basicFolder.findMany({
				where: {
					workerId: { in: workerIds },
				},
				select: {
					workerId: true,
					startupFolderId: true,
				},
			}),
		])

		const workerFolderDocSet = new Set(
			workerFoldersWithDoc.map((f) => `${f.workerId}:${f.startupFolderId}`)
		)
		const basicFolderDocSet = new Set(
			basicFoldersWithDoc.map((f) => `${f.workerId}:${f.startupFolderId}`)
		)

		const workersMissingDoc = new Set<string>()

		for (const folder of allWorkerFolders) {
			if (!workerFolderDocSet.has(`${folder.workerId}:${folder.startupFolderId}`)) {
				workersMissingDoc.add(folder.workerId)
			}
		}

		for (const folder of allBasicFolders) {
			if (!basicFolderDocSet.has(`${folder.workerId}:${folder.startupFolderId}`)) {
				workersMissingDoc.add(folder.workerId)
			}
		}

		if (workersMissingDoc.size === 0) {
			console.log("[CRON_SYNC_IRL_CERTIFICATES] All workers already have IRL safety talk certificates synced")
			return NextResponse.json({
				message: "All workers already have IRL safety talk certificates synced",
				processed: 0,
				successful: 0,
				failed: 0,
			})
		}

		const results: { workerId: string; success: boolean; error?: string }[] = []

		for (const workerId of workersMissingDoc) {
			try {
				const result = await syncIrlSafetyTalkCertificate(workerId)

				results.push({
					workerId,
					success: result.success,
					error: result.error,
				})
			} catch (error) {
				console.error(`[CRON_SYNC_IRL_CERTIFICATES] Error syncing worker ${workerId}:`, error)

				results.push({
					workerId,
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				})
			}
		}

		const successful = results.filter((r) => r.success).length
		const failed = results.filter((r) => !r.success).length

		console.log(
			`[CRON_SYNC_IRL_CERTIFICATES] Completed: ${results.length} processed, ${successful} successful, ${failed} failed`
		)

		return NextResponse.json({
			message: "IRL safety talk certificates sync completed",
			processed: results.length,
			successful,
			failed,
			failures: results
				.filter((r) => !r.success)
				.map((r) => ({ workerId: r.workerId, error: r.error })),
		})
	} catch (error) {
		console.error("[CRON_SYNC_IRL_CERTIFICATES_ERROR]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
