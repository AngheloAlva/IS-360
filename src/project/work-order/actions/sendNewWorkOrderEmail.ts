"use server"

import NewWorkOrderEmail from "@/project/work-order/components/emails/NewWorkOrderEmail"
import { resend } from "@/lib/resend"

interface SendNewWorkOrderEmailProps {
	workOrder: {
		otNumber: string
		type: string
		priority: string
		equipments: {
			name: string
		}[]
		programDate: Date
		estimatedDays: number
		estimatedHours: number
		responsible: {
			name: string
		}
		workDescription: string | null
		supervisor: {
			name: string
			email: string
		}
	}
}

export const sendNewWorkOrderEmail = async ({ workOrder }: SendNewWorkOrderEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [workOrder.supervisor.email],
			bcc: ["soporte@ingenieriasimple.cl"],
			subject: `Nueva Orden de Trabajo Asignada - ${workOrder.otNumber}`,
			react: await NewWorkOrderEmail({
				workOrder,
			}),
		})

		if (error) {
			return {
				ok: false,
				error,
			}
		}

		return {
			ok: true,
			data,
		}
	} catch (error) {
		return {
			ok: false,
			error,
		}
	}
}
