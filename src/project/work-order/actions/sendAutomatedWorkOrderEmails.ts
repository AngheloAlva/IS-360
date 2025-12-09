"use server"

import { resend } from "@/lib/resend"

import AutomatedWorkOrderResponsibleEmail from "@/project/work-order/components/emails/AutomatedWorkOrderResponsibleEmail"
import AutomatedWorkOrderControlRoomEmail from "@/project/work-order/components/emails/AutomatedWorkOrderControlRoomEmail"
import NewWorkOrderEmail from "@/project/work-order/components/emails/NewWorkOrderEmail"

interface SendAutomatedWorkOrderEmailsProps {
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
			email: string
		}
		workDescription: string | null
		supervisor: {
			name: string
			email: string
		}
		company: {
			name: string
		}
	}
	maintenanceTask: {
		name: string
		frequency: string
		emailsForCopy: string[]
	}
}

export const sendAutomatedWorkOrderEmails = async ({
	workOrder,
	maintenanceTask,
}: SendAutomatedWorkOrderEmailsProps) => {
	const results = {
		responsibleEmail: { ok: false, error: null as unknown },
		supervisorEmail: { ok: false, error: null as unknown },
		controlRoomEmail: { ok: false, error: null as unknown },
	}

	try {
		const responsibleEmailResult = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [workOrder.responsible.email],
			cc: maintenanceTask.emailsForCopy,
			subject: `🤖 OT Automática Creada - ${workOrder.otNumber} | ${maintenanceTask.name}`,
			react: await AutomatedWorkOrderResponsibleEmail({
				workOrder,
				maintenanceTask,
			}),
		})

		if (responsibleEmailResult.error) {
			results.responsibleEmail.error = responsibleEmailResult.error
		} else {
			results.responsibleEmail.ok = true
		}

		const supervisorEmailResult = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [workOrder.supervisor.email],
			subject: `Nueva Orden de Trabajo Asignada - ${workOrder.otNumber}`,
			react: await NewWorkOrderEmail({
				workOrder,
			}),
		})

		if (supervisorEmailResult.error) {
			results.supervisorEmail.error = supervisorEmailResult.error
		} else {
			results.supervisorEmail.ok = true
		}

		const controlRoomEmailResult = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: ["anghelo.alva@ingenieriasimple.cl"],
			subject: `🎛️ OT Automática Generada - ${workOrder.otNumber} | Sala de Control`,
			react: await AutomatedWorkOrderControlRoomEmail({
				workOrder,
				maintenanceTask,
			}),
		})

		if (controlRoomEmailResult.error) {
			results.controlRoomEmail.error = controlRoomEmailResult.error
		} else {
			results.controlRoomEmail.ok = true
		}

		// 4. Notificación privada para ti (usando el email existente en el sistema)
		await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: ["soporte@ingenieriasimple.cl"],
			subject: `🤖 [SISTEMA] OT Automática Creada - ${workOrder.otNumber}`,
			react: await AutomatedWorkOrderResponsibleEmail({
				workOrder,
				maintenanceTask,
			}),
		})

		return {
			ok: true,
			results,
			message: `Notificaciones enviadas para OT ${workOrder.otNumber}`,
		}
	} catch (error) {
		console.error("Error enviando emails de OT automática:", error)
		return {
			ok: false,
			error,
			results,
		}
	}
}

export const sendAutomatedWorkOrderEmailsWithFallback = async (
	props: SendAutomatedWorkOrderEmailsProps
) => {
	try {
		const result = await sendAutomatedWorkOrderEmails(props)

		return result
	} catch (error) {
		console.error("Error crítico enviando emails:", error)
		return {
			ok: false,
			error,
			message: "Error enviando notificaciones, pero OT creada exitosamente",
		}
	}
}
