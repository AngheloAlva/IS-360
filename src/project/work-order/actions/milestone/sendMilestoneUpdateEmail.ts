"use server"

import { resend } from "@/lib/resend"

import { MilestoneUpdateEmail } from "@/project/work-order/components/emails/MilestoneUpdateEmail"

interface SendMilestoneUpdateEmailProps {
	email: string
	updateDate?: Date
	workOrderId: string
	companyName: string
	workOrderName: string
	supervisorName: string
	workOrderNumber: string
	milestonesCount: number
}

export const sendMilestoneUpdateEmail = async ({
	email,
	updateDate,
	workOrderId,
	companyName,
	workOrderName,
	supervisorName,
	workOrderNumber,
	milestonesCount,
}: SendMilestoneUpdateEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [email],
			subject: `Actualización de Hitos - Libro de Obras ${workOrderName}`,
			react: await MilestoneUpdateEmail({
				companyName,
				workOrderId,
				workOrderName,
				supervisorName,
				workOrderNumber,
				milestonesCount,
				updateDate,
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
