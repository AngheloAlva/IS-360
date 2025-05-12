"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { sendSupportMessage } from "@/actions/contact/sendContactMessage"
import { uploadFilesToCloud, UploadResult } from "@/lib/upload-files"

import { USER_ROLE } from "@prisma/client"
import {
	supportFormSchema,
	type SupportFormSchema,
} from "@/lib/form-schemas/contact/support.schema"

import UploadFilesFormField from "@/components/forms/shared/UploadFilesFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"

import type { Session } from "@/lib/auth"

interface SupportFormProps {
	user: Session["user"]
}

export default function SupportForm({ user }: SupportFormProps) {
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const router = useRouter()

	const form = useForm<SupportFormSchema>({
		resolver: zodResolver(supportFormSchema),
		defaultValues: {
			message: "",
			files: [],
		},
	})

	const onSubmit = async (data: SupportFormSchema) => {
		setIsSubmitting(true)

		try {
			let uploadResults: UploadResult[] = []
			const files = form.getValues("files") || []

			if (files.length > 0) {
				uploadResults = await uploadFilesToCloud({
					files: files,
					containerType: "documents",
					randomString: user.id,
					secondaryName: user.name,
				})
			}

			const { ok, message } = await sendSupportMessage({
				values: {
					...data,
					files: undefined,
				},
				uploadResult: uploadResults,
			})

			if (!ok) {
				toast.error(message)
			}

			toast.success("Mensaje enviado correctamente")
			if (user.role === USER_ROLE.ADMIN || user.role === USER_ROLE.USER) {
				router.push("/admin/dashboard/inicio")
			} else {
				router.push("/dashboard/inicio")
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al enviar el mensaje")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card className="mt-4">
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
						<TextAreaFormField<SupportFormSchema>
							name="message"
							label="Mensaje"
							className="min-h-32"
							control={form.control}
						/>

						<UploadFilesFormField
							name="files"
							isMultiple={true}
							maxFileSize={500}
							canPreview={false}
							control={form.control}
							containerClassName="w-full"
							selectedFileIndex={selectedFileIndex}
							setSelectedFileIndex={setSelectedFileIndex}
						/>

						<SubmitButton label="Enviar mensaje" isSubmitting={isSubmitting} />
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
