import { z } from "zod"

export const workBookSchema = z.object({
	userId: z.string().nonempty(),

	otNumber: z.string().nonempty({ message: "Debe seleccionar un número de OT" }),
	companyId: z.string().nonempty({ message: "La empresa no puede estar vacía" }),
	workLocation: z.string().nonempty({ message: "La ubicación de la obra no puede estar vacía" }),
	contractingCompany: z
		.string()
		.nonempty({ message: "La empresa contratante no puede estar vacía" }),
	workResponsibleName: z
		.string()
		.nonempty({ message: "El nombre del responsable de la obra no puede estar vacío" }),
	workResponsiblePhone: z
		.string()
		.nonempty({ message: "El teléfono del responsable de la obra no puede estar vacío" }),
	otcInspectorName: z
		.string()
		.nonempty({ message: "El nombre del inspector OTC no puede estar vacío" }),
	otcInspectorPhone: z
		.string()
		.nonempty({ message: "El teléfono del inspector OTC no puede estar vacío" }),
	workName: z.string().nonempty({ message: "El nombre de la obra no puede estar vacío" }),
	workType: z.enum(["construccion", "mantenimiento", "ampliacion"]),
	workStartDate: z.date({ message: "La fecha de inicio no es válida" }),
	workEstimatedEndDate: z.date({ message: "La fecha estimada de fin no es válida" }),
	workStatus: z.enum(["planificado", "ejecucion", "finalizado"]),
	workProgressStatus: z.enum(["pendiente", "proceso", "terminado", "postergado"]),
})
