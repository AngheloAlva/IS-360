"use server"

import { sendContactEmail } from "./sendContactEmail"

import type { SupportFormSchema } from "@/project/contact/schemas/support.schema"
import type { UploadResult } from "@/lib/upload-files"

interface SendSupportMessageProps {
	values: SupportFormSchema
	uploadResult: UploadResult[]
}

export async function sendSupportMessage({
	values,
	uploadResult,
}: SendSupportMessageProps): Promise<{ ok: boolean; message: string }> {
	try {
		const { ok } = await sendContactEmail({
			type: "support",
			message: values.message,
			filesUrls: uploadResult.map((file) => file.url),
		})

		if (!ok) {
			return {
				ok: false,
				message: "Error al enviar el mensaje",
			}
		}

		return {
			ok: true,
			message: "Mensaje enviado correctamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al enviar el mensaje",
		}
	}
}
