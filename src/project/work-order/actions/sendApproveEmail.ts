"use server"

import { resend } from "@/lib/resend"

import { ApproveClousureEmail } from "@/project/work-order/components/emails/ApproveClousureEmail"

interface SendApproveClosureEmailProps {
	workOrderName: string
	workOrderNumber: string
	companyName: string
	supervisorName: string
	email: string
	autoClosed?: boolean
	milestoneName?: string
	milestoneComment?: string
}

export const sendApproveClosureEmail = async ({
	email,
	workOrderName,
	workOrderNumber,
	companyName,
	supervisorName,
	autoClosed,
	milestoneName,
	milestoneComment,
}: SendApproveClosureEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "sistema.otc360@otc360.cl",
			to: [email],
			subject: autoClosed
				? `Libro de Obras ${workOrderName} cerrado automáticamente`
				: `Aprobación de Cierre - Libro de Obras ${workOrderName}`,
			react: await ApproveClousureEmail({
				workOrderName,
				workOrderNumber,
				companyName,
				supervisorName,
				autoClosed,
				milestoneName,
				milestoneComment,
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
