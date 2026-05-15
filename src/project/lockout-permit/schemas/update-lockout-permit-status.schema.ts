import { LOCKOUT_PERMIT_STATUS } from "@/generated/prisma/enums"
import { z } from "zod"

export const updateLockoutPermitStatusSchema = z.object({
	lockoutPermitId: z.string().min(1, "ID del permiso de bloqueo requerido"),
	status: z.nativeEnum(LOCKOUT_PERMIT_STATUS),
	approvalNotes: z.string().optional(),
})

export type UpdateLockoutPermitStatusSchema = z.infer<typeof updateLockoutPermitStatusSchema>
