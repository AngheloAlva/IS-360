"use server"

import { resend } from "@/lib/resend"

import { RequestClousureEmailTemplate } from "@/components/emails/RequestClousureEmailTemplate"

interface SendRequestClosureEmailProps {
	email: string
	workOrderId: string
	companyName: string
	workOrderName: string
	supervisorName: string
	workOrderNumber: string
}

export const sendRequestClosureEmail = async ({
	email,
	workOrderId,
	companyName,
	workOrderName,
	supervisorName,
	workOrderNumber,
}: SendRequestClosureEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [email],
			subject: `Solicitud de Cierre - Libro de Obras ${workOrderName}`,
			react: await RequestClousureEmailTemplate({
				companyName,
				workOrderId,
				workOrderName,
				supervisorName,
				workOrderNumber,
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
