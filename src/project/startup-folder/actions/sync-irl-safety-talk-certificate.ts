interface SyncIrlSafetyTalkCertificateResult {
	processed: boolean
	success: boolean
	error?: string
}

export async function syncIrlSafetyTalkCertificate(
	_workerId: string,
): Promise<SyncIrlSafetyTalkCertificateResult> {
	return { processed: false, success: true }
}
