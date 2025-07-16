"use server"

import { Resend } from "resend"

import OtcInspectionNotificationEmail from "@/project/work-order/components/emails/OtcInspectionNotificationEmail"
import prisma from "@/lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendOtcInspectionNotificationProps {
	workEntryId: string
}

export const sendOtcInspectionNotification = async ({
	workEntryId,
}: SendOtcInspectionNotificationProps) => {
	try {
		const inspection = await prisma.workEntry.findUnique({
			where: { id: workEntryId },
			include: {
				createdBy: {
					select: {
						name: true,
						email: true,
						internal: true,
					},
				},
				attachments: {
					select: {
						id: true,
						name: true,
						url: true,
					},
				},
				workOrder: {
					include: {
						responsible: {
							select: {
								id: true,
								name: true,
								email: true,
								internal: true,
							},
						},
						supervisor: {
							select: {
								id: true,
								name: true,
								email: true,
								internal: true,
							},
						},
						company: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		})

		if (!inspection || inspection.entryType !== "OTC_INSPECTION") {
			throw new Error("Inspección no encontrada o tipo incorrecto")
		}

		const inspectionData = {
			id: inspection.id,
			activityName: inspection.activityName || "Inspección OTC",
			executionDate: inspection.executionDate,
			activityStartTime: inspection.activityStartTime || "",
			activityEndTime: inspection.activityEndTime || "",
			inspectorName: inspection.createdBy.name,
			nonConformities: inspection.nonConformities || undefined,
			safetyObservations: inspection.safetyObservations || undefined,
			supervisionComments: inspection.supervisionComments || undefined,
			recommendations: inspection.recommendations || undefined,
			hasAttachments: inspection.attachments.length > 0,
			attachmentCount: inspection.attachments.length,
		}

		const workOrderData = {
			otNumber: inspection.workOrder.otNumber,
			workName: inspection.workOrder.workName || undefined,
			workLocation: inspection.workOrder.workLocation || undefined,
			responsible: {
				name: inspection.workOrder.responsible.name,
				email: inspection.workOrder.responsible.email,
				internal: inspection.workOrder.responsible.internal,
			},
			supervisor: {
				name: inspection.workOrder.supervisor.name,
				email: inspection.workOrder.supervisor.email,
				internal: inspection.workOrder.supervisor.internal,
			},
			company: inspection.workOrder.company
				? {
						name: inspection.workOrder.company.name,
					}
				: undefined,
		}

		const recipients: {
			name: string
			email: string
			isInternal: boolean
			role: "responsible" | "supervisor" | "safety"
		}[] = [
			{
				email: workOrderData.responsible.email,
				name: workOrderData.responsible.name,
				isInternal: workOrderData.responsible.internal,
				role: "responsible" as const,
			},
			{
				email: workOrderData.supervisor.email,
				name: workOrderData.supervisor.name,
				isInternal: workOrderData.supervisor.internal,
				role: "supervisor" as const,
			},
		]

		const hasSafetyIssues =
			(inspection.safetyObservations && inspection.safetyObservations.trim().length > 0) ||
			(inspection.nonConformities && inspection.nonConformities.trim().length > 0)

		if (hasSafetyIssues) {
			const safetyEmails = [
				"katherine.burgos@oleotrasandino.cl",
				"cristian.pavez@oleotrasandino.cl",
			]

			for (const email of safetyEmails) {
				if (email.trim()) {
					recipients.push({
						email: email.trim(),
						name: "Equipo de Seguridad",
						isInternal: true,
						role: "safety" as const,
					})
				}
			}
		}

		// Send emails to all recipients
		const emailPromises = recipients.map(async (recipient, i) => {
			const subject = hasSafetyIssues
				? `🚨 URGENTE: Inspección OTC con No Conformidades - OT ${workOrderData.otNumber}`
				: `📋 Nueva Inspección OTC Realizada - OT ${workOrderData.otNumber}`

			return resend.emails.send({
				from: "anghelo.alva@ingenieriasimple.cl",
				to: recipient.email,
				cc: i === 0 ? "soporte@ingenieriasimple.cl" : [],
				subject,
				react: await OtcInspectionNotificationEmail({
					inspection: inspectionData,
					workOrder: workOrderData,
					recipient,
				}),
				tags: [
					{
						name: "type",
						value: "otc-inspection-notification",
					},
					{
						name: "work-order",
						value: workOrderData.otNumber,
					},
					{
						name: "recipient-role",
						value: recipient.role,
					},
					{
						name: "has-safety-issues",
						value: (hasSafetyIssues || false).toString(),
					},
				],
			})
		})

		const results = await Promise.allSettled(emailPromises)

		// Log results
		const successful = results.filter((r) => r.status === "fulfilled").length
		const failed = results.filter((r) => r.status === "rejected").length

		console.log(`[OTC_INSPECTION_NOTIFICATION] Sent ${successful} emails, ${failed} failed`)

		// Log any failures
		results.forEach((result, index) => {
			if (result.status === "rejected") {
				console.error(
					`[OTC_INSPECTION_NOTIFICATION] Failed to send to ${recipients[index].email}:`,
					result.reason
				)
			}
		})

		return {
			ok: true,
			message: `Notificaciones enviadas: ${successful} exitosas, ${failed} fallidas`,
			sent: successful,
			failed: failed,
		}
	} catch (error) {
		console.error("[SEND_OTC_INSPECTION_NOTIFICATION]", error)
		return {
			ok: false,
			message: "Error al enviar notificaciones de inspección",
			error: error instanceof Error ? error.message : "Error desconocido",
		}
	}
}
