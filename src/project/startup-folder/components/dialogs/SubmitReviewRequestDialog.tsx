"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form"
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogFooter,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

import type { DocumentCategory } from "@prisma/client"

interface SubmitReviewRequestDialogProps {
	userId: string
	isOpen: boolean
	folderId: string
	workerId?: string
	vehicleId?: string
	companyId: string
	onClose: () => void
	onSuccess: () => void
	category: DocumentCategory
}

const submitReviewRequestSchema = z.object({
	folderId: z.string(),
	notificationEmails: z.string(),
})

type SubmitReviewRequestSchema = z.infer<typeof submitReviewRequestSchema>

export function SubmitReviewRequestDialog({
	userId,
	isOpen,
	onClose,
	category,
	folderId,
	workerId,
	vehicleId,
	companyId,
	onSuccess,
}: SubmitReviewRequestDialogProps) {
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

			if (category === "PERSONNEL") {
				if (!workerId) {
					return { ok: false, message: "ID de trabajador es requerido" }
				}

				const { submitWorkerFolderForReview } = await import(
					"@/project/startup-folder/actions/worker/submit-worker-folder-for-review"
				)
				result = await submitWorkerFolderForReview({
					emails,
					userId,
					folderId,
					workerId,
					companyId,
				})
			} else if (category === "VEHICLES") {
				if (!vehicleId) {
					return { ok: false, message: "ID de vehículo es requerido" }
				}
				const { submitVehicleFolderForReview } = await import(
					"@/project/startup-folder/actions/vehicle/submit-vehicle-folder-for-review"
				)
				result = await submitVehicleFolderForReview({
					emails,
					userId,
					folderId,
					vehicleId,
					companyId,
				})
			} else if (category === "ENVIRONMENTAL") {
				const { submitEnvironmentalFolderForReview } = await import(
					"@/project/startup-folder/actions/environmental/submit-environmental-folder-for-review"
				)
				result = await submitEnvironmentalFolderForReview({
					emails,
					userId,
					folderId,
				})
			} else if (category === "ENVIRONMENT") {
				const { submitEnvironmentFolderForReview } = await import(
					"@/project/startup-folder/actions/environment/submit-environment-folder-for-review"
				)
				result = await submitEnvironmentFolderForReview({
					emails,
					userId,
					folderId,
				})
			} else if (category === "SAFETY_AND_HEALTH") {
				const { submitSafetyAndHealthFolderForReview } = await import(
					"@/project/startup-folder/actions/safety-and-health/submit-safety-folder-for-review"
				)
				result = await submitSafetyAndHealthFolderForReview({
					emails,
					userId,
					folderId,
				})
			} else if (category === "TECHNICAL_SPECS") {
				const { submitTechSpecsDocumentForReview } = await import(
					"@/project/startup-folder/actions/technical-specs/submit-technical-folder-for-review"
				)
				result = await submitTechSpecsDocumentForReview({
					emails,
					userId,
					folderId,
				})
			} else if (category === "BASIC") {
				if (!workerId) {
					return { ok: false, message: "ID de trabajador es requerido" }
				}

				const { submitBasicFolderForReview } = await import(
					"@/project/startup-folder/actions/basic/submit-basic-folder-for-review"
				)
				result = await submitBasicFolderForReview({
					emails,
					userId,
					folderId,
					workerId,
				})
			} else {
				result = {
					ok: false,
					message: "Error al enviar la solicitud.",
				}
			}

			if (result.ok) {
				onSuccess()
			} else {
				toast.error(result.message || "Error al enviar la solicitud.")
			}
		} catch (error) {
			console.error("Error submitting review request:", error)
			toast.error("Error al enviar la solicitud.")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Enviar documentos a revisión</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que deseas enviar estos documentos a revisión? Los documentos no podrán
						ser modificados hasta que sean aprobados o rechazados.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="notificationEmails"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Ingresa correos electrónicos adicionales para notificar (opcional). Sepáralos por comas o nuevas líneas."
											rows={3}
										/>
									</FormControl>
									{emailError && <FormMessage>{emailError}</FormMessage>}
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
								Cancelar
							</Button>
							<Button
								className="bg-emerald-600 transition-all hover:scale-105 hover:bg-emerald-700 hover:text-white"
								type="submit"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Enviando..." : "Enviar"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
