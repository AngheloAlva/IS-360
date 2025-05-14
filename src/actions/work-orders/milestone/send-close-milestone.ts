"use server"

import { Resend } from "resend"

import { RequestCloseMilestoneEmailTemplate } from "@/components/emails/work-book/RequestCloseMilestoneEmailTemplate"
import { ApproveMilestoneEmailTemplate } from "@/components/emails/work-book/ApproveMilestoneEmailTemplate"
import { RejectMilestoneEmailTemplate } from "@/components/emails/work-book/RejectMilestoneEmailTemplate"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendRequestCloseMilestoneEmailProps {
	responsibleEmail: string
	milestone: {
		name: string
		weight: number
		description: string | null
		workOrderId: string
		workOrder: {
			otNumber: string
			workName: string | null
			workDescription: string | null
		}
	}
}

export const sendRequestCloseMilestoneEmail = async ({
	milestone,
	responsibleEmail,
}: SendRequestCloseMilestoneEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [responsibleEmail],
			subject: `Solicitud de cierre de hito ${milestone.workOrder.otNumber}`,
			react: await RequestCloseMilestoneEmailTemplate({
				milestone,
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

interface SendApproveMilestoneEmailProps {
	comment?: string
	otNumber: string
	supervisorEmail: string
	milestoneName: string
}
export const sendApproveMilestoneEmail = async ({
	comment,
	otNumber,
	milestoneName,
	supervisorEmail,
}: SendApproveMilestoneEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [supervisorEmail],
			subject: `Hito ${otNumber} aprobado`,
			react: await ApproveMilestoneEmailTemplate({
				comment,
				otNumber,
				milestoneName,
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

interface SendRejectMilestoneEmailProps {
	comment?: string
	otNumber: string
	supervisorEmail: string
	milestoneName: string
}

export const sendRejectMilestoneEmail = async ({
	comment,
	otNumber,
	milestoneName,
	supervisorEmail,
}: SendRejectMilestoneEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [supervisorEmail],
			subject: `Hito ${otNumber} rechazado`,
			react: await RejectMilestoneEmailTemplate({
				comment,
				otNumber,
				milestoneName,
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
