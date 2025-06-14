"use client"

import { useForm } from "react-hook-form"
import { Send } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { zodResolver } from "@hookform/resolvers/zod"
import { queryClient } from "@/lib/queryClient"
import {
	submitReviewRequestSchema,
	type SubmitReviewRequestSchema,
} from "@/features/startup-folder/schemas/submit-review-request.schema"

import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import {
	Dialog,
	DialogClose,
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

interface SubmitReviewRequestDialogProps {
	userId: string
	folderId: string
	companyId: string
	disabled: boolean
	folderName: string
	folderType: "WORKER" | "VEHICLE" | "ENVIRONMENTAL" | "SAFETY_AND_HEALTH"
}

export function SubmitReviewRequestDialog({
	userId,
	folderId,
	disabled,
	companyId,
	folderName,
	folderType,
}: SubmitReviewRequestDialogProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [emailError, setEmailError] = useState<string | null>(null)

	const form = useForm<SubmitReviewRequestSchema>({
		resolver: zodResolver(submitReviewRequestSchema),
		defaultValues: {
			folderId: folderId,
			notificationEmails: "",
		},
	})

	const isValidEmail = (email: string): boolean => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
	}

	const parseAndValidateEmails = (
		emailString: string
	): { emails: string[]; isValid: boolean; error?: string } => {
		if (!emailString.trim()) return { emails: [], isValid: true }

		const emails = emailString
			.split(/[,\n]/) // Split by comma or newline
			.map((email) => email.trim())
			.filter((email) => email !== "")

		// Validate each email
		const invalidEmails = emails.filter((email) => !isValidEmail(email))

		if (invalidEmails.length > 0) {
			return {
				emails: [],
				isValid: false,
				error: `Correos electrónicos inválidos: ${invalidEmails.join(", ")}`,
			}
		}

		return {
			emails,
			isValid: true,
		}
	}

	const onSubmit = async (data: SubmitReviewRequestSchema) => {
		setEmailError(null)

		const { emails, isValid, error } = parseAndValidateEmails(data.notificationEmails || "")

		if (!isValid) {
			setEmailError(error || "Por favor, verifica el formato de los correos electrónicos.")
			return
		}

		setIsSubmitting(true)

		try {
			let result: { ok: boolean; message?: string }

			if (folderType === "WORKER") {
				const { submitWorkerDocumentForReview } = await import(
					"@/features/startup-folder/actions/documents/worker"
				)
				result = await submitWorkerDocumentForReview({
					emails,
					userId,
					folderId,
					companyId,
				})
			} else if (folderType === "VEHICLE") {
				const { submitVehicleDocumentForReview } = await import(
					"@/features/startup-folder/actions/documents/vehicle"
				)
				result = await submitVehicleDocumentForReview({
					emails,
					userId,
					folderId,
					companyId,
				})
			} else if (folderType === "ENVIRONMENTAL") {
				const { submitEnvironmentalDocumentForReview } = await import(
					"@/features/startup-folder/actions/documents/environmental"
				)
				result = await submitEnvironmentalDocumentForReview({
					emails,
					userId,
					folderId,
				})
			} else if (folderType === "SAFETY_AND_HEALTH") {
				const { submitSafetyAndHealthDocumentForReview } = await import(
					"@/features/startup-folder/actions/documents/safety-and-health"
				)
				result = await submitSafetyAndHealthDocumentForReview({
					emails,
					userId,
					folderId,
				})
			} else {
				result = {
					ok: false,
					message: "Error al enviar la solicitud.",
				}
			}

			if (result.ok) {
				toast.success(result.message || "Solicitud de revisión enviada con éxito.")
				queryClient.invalidateQueries({
					queryKey: ["startupFolder", { companyId }],
				})
				setIsOpen(false)
				form.reset({ folderId: folderId, notificationEmails: "" })
			} else {
				toast.error(result.message || "Error al enviar la solicitud.")
			}
		} catch (error) {
			console.error("Error submitting review request:", error)
			toast.error("Ocurrió un error inesperado al procesar la solicitud.")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button disabled={disabled} className="py-9">
					<Send />
					<span className="hidden">Enviar a Revisión</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Confirmar Envío a Revisión</DialogTitle>
					<DialogDescription>
						Vas a enviar la carpeta <strong>{folderName}</strong> para su revisión por OTC. Una vez
						enviada, no podrás realizar cambios en los documentos hasta que la revisión haya sido
						completada.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-5">
						<TextAreaFormField<SubmitReviewRequestSchema>
							optional
							itemClassName="mb-2"
							control={form.control}
							name="notificationEmails"
							label="Correos electrónicos adicionales"
							placeholder="email1@ejemplo.com, email2@ejemplo.com"
						/>
						{emailError && <p className="text-destructive text-sm font-medium">{emailError}</p>}
						<p className="text-muted-foreground text-xs">
							Ingresa correos electrónicos adicionales separados por comas o saltos de línea. Estos
							correos recibirán notificaciones sobre el estado de la revisión.
						</p>

						<DialogFooter className="gap-2">
							<DialogClose asChild>
								<Button type="button" variant="outline" onClick={() => form.reset()}>
									Cancelar
								</Button>
							</DialogClose>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="hover:bg-primary/80 hover:text-white"
							>
								{isSubmitting ? "Enviando..." : "Confirmar y Enviar"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
