import { ACCESS_ROLE } from "@/generated/prisma/enums"
import { auth } from "@/lib/auth"

// Único usuario OTC autorizado a emitir/rotar QRs de acreditación.
// Los QRs se imprimen físicamente, así que regenerarlos invalida la tarjeta del trabajador;
// por eso restringimos la emisión a una sola persona designada.
export const QR_ISSUER_USER_ID = "csREIhAi7xKS1y4nohPsnk9A9tUkMidq"

type SessionUser = {
	id: string
	accessRole?: string | null
}

export class ForbiddenError extends Error {
	constructor(message = "No tienes permisos para realizar esta acción") {
		super(message)
		this.name = "ForbiddenError"
	}
}

function isOtcMember(user: SessionUser): boolean {
	return user.accessRole === (ACCESS_ROLE.ADMIN as string)
}

export function canIssueWorkerQR(user: SessionUser): boolean {
	return user.id === QR_ISSUER_USER_ID
}

export async function assertCanView(user: SessionUser, workerId: string): Promise<void> {
	// Self-service: worker viewing their own compliance card
	if (user.id === workerId) return

	// OTC member with explicit view permission
	if (isOtcMember(user)) {
		const result = await auth.api.userHasPermission({
			body: {
				userId: user.id,
				permission: { workerCompliance: ["view"] },
			},
		})
		if (result.success) return
	}

	throw new ForbiddenError()
}

export async function assertCanGenerateFor(user: SessionUser, _workerId: string): Promise<void> {
	if (canIssueWorkerQR(user)) return

	throw new ForbiddenError("Solo el emisor designado de OTC puede generar QRs de acreditación")
}

export async function assertCanRevokeFor(user: SessionUser, _workerId: string): Promise<void> {
	if (canIssueWorkerQR(user)) return

	throw new ForbiddenError("Solo el emisor designado de OTC puede revocar QRs de acreditación")
}
