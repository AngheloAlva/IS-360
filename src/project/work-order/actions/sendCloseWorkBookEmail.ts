"use server"

import { resend } from "@/lib/resend"

import { CloseWorkOrderEmail } from "@/project/work-order/components/emails/CloseWorkOrderEmail"

interface SendCloseWorkBookEmailProps {
	email: string
	otNumber: string
	companyName: string
	workOrderName: string
	closureReason: string
	supervisorName: string
	workOrderNumber: string
}

export const sendCloseWorkBookEmail = async ({
	email,
	otNumber,
	companyName,
	closureReason,
	workOrderName,
	supervisorName,
	workOrderNumber,
}: SendCloseWorkBookEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [email],
			subject: `Cierre - Libro de Obras ${workOrderName}`,
			react: await CloseWorkOrderEmail({
				otNumber,
				companyName,
				closureReason,
				workOrderName,
				supervisorName,
				workOrderNumber,
				closureDate: new Date(),
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
