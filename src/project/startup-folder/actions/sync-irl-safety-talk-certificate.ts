"use server"

import { uploadCertificateToStartupFolders } from "@/project/safety-talk/actions/upload-certificate-to-startup-folders"
import prisma from "@/lib/prisma"

interface SyncIrlSafetyTalkCertificateResult {
	processed: boolean
	success: boolean
	error?: string
}

export async function syncIrlSafetyTalkCertificate(
	workerId: string
): Promise<SyncIrlSafetyTalkCertificateResult> {
	const latestPassedIrlTalk = await prisma.userSafetyTalk.findFirst({
		where: {
			userId: workerId,
			category: "IRL",
			status: "PASSED",
		},
		select: {
			id: true,
		},
		orderBy: [{ completedAt: "desc" }, { updatedAt: "desc" }],
	})

	if (!latestPassedIrlTalk) {
		return {
			processed: false,
			success: true,
		}
	}

	const uploadResult = await uploadCertificateToStartupFolders(latestPassedIrlTalk.id, workerId)

	return {
		processed: true,
		success: uploadResult.success,
		error: uploadResult.error,
	}
}
