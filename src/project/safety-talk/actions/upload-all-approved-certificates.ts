/**
 * Demo stub: the production version iterates all approved IRL evaluations and
 * uploads PDF certificates to startup folders. With PDF generation disabled in
 * the demo, this is a successful noop returning the no-op result shape.
 */

interface RetroactiveUploadResult {
	success: boolean
	processed: number
	successful: number
	failed: number
	errors: Array<{ userId: string; userName: string; error: string }>
}

export async function uploadAllApprovedIRLCertificates(): Promise<RetroactiveUploadResult> {
	return {
		success: true,
		processed: 0,
		successful: 0,
		failed: 0,
		errors: [],
	}
}
