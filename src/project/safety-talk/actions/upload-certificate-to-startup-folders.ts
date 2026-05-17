/**
 * Demo stub: the production flow generates a PDF certificate and uploads it to
 * Azure Blob storage + creates BasicDocument/WorkerDocument rows with status
 * APPROVED, then auto-approves the parent folders. None of that is meaningful
 * in the demo (no PDF generation, no Azure). The stub is a successful noop so
 * the submit-evaluation flow doesn't break.
 */

interface UploadCertificateResult {
	success: boolean
	error?: string
	uploadedToFolders?: {
		basicFolders: number
		workerFolders: number
	}
}

export async function uploadCertificateToStartupFolders(
	userSafetyTalkId: string,
	userId: string,
): Promise<UploadCertificateResult> {
	void userSafetyTalkId
	void userId
	return {
		success: true,
		uploadedToFolders: { basicFolders: 0, workerFolders: 0 },
	}
}
