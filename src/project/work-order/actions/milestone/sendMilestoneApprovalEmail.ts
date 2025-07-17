"use server"

import { resend } from "@/lib/resend"

import { MilestoneApprovalEmail } from "@/project/work-order/components/emails/MilestoneApprovalEmail"

interface SendMilestoneApprovalEmailProps {
	email: string
	workOrderId: string
	companyName: string
	workOrderName: string
	responsibleName: string
	workOrderNumber: string
	approved: boolean
	rejectionReason?: string
	approvalDate?: Date
}

export const sendMilestoneApprovalEmail = async ({
	email,
	workOrderId,
	companyName,
	workOrderName,
	responsibleName,
	workOrderNumber,
	approved,
	rejectionReason,
	approvalDate,
}: SendMilestoneApprovalEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [email],
			subject: `${approved ? "Hitos Aprobados" : "Hitos Requieren Revisión"} - Libro de Obras ${workOrderName}`,
			react: await MilestoneApprovalEmail({
				companyName,
				workOrderId,
				workOrderName,
				responsibleName,
				workOrderNumber,
				approved,
				rejectionReason,
				approvalDate,
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
