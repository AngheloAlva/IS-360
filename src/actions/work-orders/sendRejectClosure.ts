"use server"

import { resend } from "@/lib/resend"

import { RejectClousureEmailTemplate } from "@/components/emails/RejectClousureEmailTemplate"

interface SendRejectClosureEmailProps {
	email: string
	companyName: string
	workOrderName: string
	supervisorName: string
	workOrderNumber: string
	rejectionReason?: string
}

export const sendRejectClosureEmail = async ({
	email,
	companyName,
	workOrderName,
	supervisorName,
	rejectionReason,
	workOrderNumber,
}: SendRejectClosureEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [email],
			subject: `Rechazo de Cierre - Libro de Obras ${workOrderName}`,
			react: await RejectClousureEmailTemplate({
				workOrderName,
				workOrderNumber,
				companyName,
				supervisorName,
				rejectionReason,
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
