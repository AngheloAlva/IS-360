"use server"

import { resend } from "@/lib/resend"

import { ApproveClousureEmail } from "@/project/work-order/components/emails/ApproveClousureEmail"

interface SendApproveClosureEmailProps {
	workOrderName: string
	workOrderNumber: string
	companyName: string
	supervisorName: string
	email: string
}

export const sendApproveClosureEmail = async ({
	email,
	workOrderName,
	workOrderNumber,
	companyName,
	supervisorName,
}: SendApproveClosureEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [email],
			subject: `Aprobación de Cierre - Libro de Obras ${workOrderName}`,
			react: await ApproveClousureEmail({
				workOrderName,
				workOrderNumber,
				companyName,
				supervisorName,
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
