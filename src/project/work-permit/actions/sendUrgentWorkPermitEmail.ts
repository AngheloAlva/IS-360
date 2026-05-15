"use server"

import { UrgentWorkPermitEmail } from "@/project/work-permit/components/email/UrgentWorkPermit"
import { resend } from "@/lib/resend"

interface SendUrgentWorkPermitEmailProps {
	applicantName: string
	companyName: string
	exactPlace: string
	workWillBe: string
	activityDetails: string[]
	startDate: Date
	endDate: Date
	participants: string[]
	otNumber?: string
	additionalObservations?: string
}

export const sendUrgentWorkPermitEmail = async (props: SendUrgentWorkPermitEmailProps) => {
	try {
		const gerencyEmails =
			process.env.NEXT_PUBLIC_GERENCY_EMAILS?.split(",").map((email) => email.trim()) || []

		if (gerencyEmails.length === 0) {
			console.log("[SEND_URGENT_WORK_PERMIT_EMAIL] No gerency emails configured")
			return {
				ok: false,
				error: "No hay emails de gerencia configurados",
			}
		}

		const { data, error } = await resend.emails.send({
			from: "sistema@is360.cl",
			// to: gerencyEmails,
			to: "sistema@is360.cl",
			subject: `🚨 URGENTE: Nuevo Permiso de Trabajo`,
			react: await UrgentWorkPermitEmail(props),
		})

		if (error) {
			console.error("[SEND_URGENT_WORK_PERMIT_EMAIL]", error)
			return {
				ok: false,
				error,
			}
		}

		console.log("[SEND_URGENT_WORK_PERMIT_EMAIL] Email sent successfully to:", gerencyEmails)
		return {
			ok: true,
			data,
		}
	} catch (error) {
		console.error("[SEND_URGENT_WORK_PERMIT_EMAIL]", error)
		return {
			ok: false,
			error,
		}
	}
}
