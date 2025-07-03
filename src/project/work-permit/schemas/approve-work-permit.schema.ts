import z from "zod"

export const approveWorkPermitSchema = z.object({
	action: z.enum(["approve", "reject"]),
	approvedBy: z.string().min(1, "Seleccione un operador"),
})

export type ApproveWorkPermitSchema = z.infer<typeof approveWorkPermitSchema>
