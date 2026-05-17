/**
 * Demo: PDF generation via @react-pdf/renderer requires a server-side Node
 * runtime that's not available in the static-host demo. The return shape is
 * kept flat (success/pdf/filename/error) so consumers can branch on
 * `result.success && result.pdf` as in the original implementation.
 */

interface CertificateResult {
	success: boolean
	pdf?: string
	filename?: string
	error?: string
}

const DEMO_MESSAGE =
	"La generación de certificados PDF no está disponible en la demo. En el sistema real obtendrías el certificado descargable desde aquí."

export async function generateCertificate(userSafetyTalkId: string): Promise<CertificateResult> {
	void userSafetyTalkId
	return { success: false, error: DEMO_MESSAGE }
}

export async function generateExternalCertificate(
	token: string,
	email: string,
): Promise<CertificateResult> {
	void token
	void email
	return { success: false, error: DEMO_MESSAGE }
}
