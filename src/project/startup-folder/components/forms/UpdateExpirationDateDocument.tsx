"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarSyncIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { addYears } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

import { queryClient } from "@/lib/queryClient"
import {
	updateExpirationDateDocumentSchema,
	type UpdateExpirationDateSchema,
} from "@/project/startup-folder/schemas/update-expiration-date"

import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

import type { DocumentCategory } from "@prisma/client"

interface UpdateExpirationDateDocumentProps {
	folderId: string
	companyId: string
	documentId: string
	category: DocumentCategory
}

export function UpdateExpirationDateDocument({
	folderId,
	category,
	documentId,
	companyId,
}: UpdateExpirationDateDocumentProps) {
	const [isUploading, setIsUploading] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<UpdateExpirationDateSchema>({
		resolver: zodResolver(updateExpirationDateDocumentSchema),
		defaultValues: {
			folderId,
			documentId,
			expirationDate: addYears(new Date(), 1),
		},
	})

	async function onSubmit(values: UpdateExpirationDateSchema) {
		setIsUploading(true)

		try {
			let result: { ok: boolean; message?: string } = {
				ok: false,
				message: "No se realizó ninguna acción",
			}

			switch (category) {
				case "SAFETY_AND_HEALTH":
					if (documentId) {
						const { updateSafetyDocumentExpirationDate } = await import(
							"@/project/startup-folder/actions/safety-and-health/update-safety-document-expiration-date"
						)
						result = await updateSafetyDocumentExpirationDate({
							data: { documentId, expirationDate: values.expirationDate, folderId },
						})
					}
					break

				case "PERSONNEL":
					if (documentId) {
						const { updateWorkerDocumentExpirationDate } = await import(
							"@/project/startup-folder/actions/worker/update-worker-document-expiration-date"
						)
						result = await updateWorkerDocumentExpirationDate({
							data: { documentId, expirationDate: values.expirationDate, folderId },
						})
					}
					break

				case "VEHICLES":
					if (documentId) {
						const { updateExpirationDateVehicleDocument } = await import(
							"@/project/startup-folder/actions/vehicle/update-vehicle-document-expiration-date"
						)
						result = await updateExpirationDateVehicleDocument({
							data: { documentId, expirationDate: values.expirationDate, folderId },
						})
					}
					break

				case "ENVIRONMENTAL":
					if (documentId) {
						const { updateEnvironmentalDocumentExpirationDate } = await import(
							"@/project/startup-folder/actions/environmental/update-environmental-document-expiration-date"
						)
						result = await updateEnvironmentalDocumentExpirationDate({
							data: { documentId, expirationDate: values.expirationDate, folderId },
						})
					}
					break

				case "ENVIRONMENT":
					if (documentId) {
						const { updateEnvironmentDocumentExpirationDate } = await import(
							"@/project/startup-folder/actions/environment/update-environment-document-expiration-date"
						)
						result = await updateEnvironmentDocumentExpirationDate({
							data: { documentId, expirationDate: values.expirationDate, folderId },
						})
					}
					break

				case "BASIC":
					if (documentId) {
						const { updateBasicDocumentExpirationDate } = await import(
							"@/project/startup-folder/actions/basic/update-basic-document-expiration-date"
						)
						result = await updateBasicDocumentExpirationDate({
							data: { documentId, expirationDate: values.expirationDate, folderId },
						})
					}
					break

				default:
					throw new Error("Tipo de documento no soportado")
			}

			if (!result.ok) {
				throw new Error(result.message || "Error al actualizar el documento")
			}

			toast.success("Documento actualizado correctamente")

			queryClient.invalidateQueries({
				queryKey: ["startupFolder", { companyId }],
			})

			setOpen(false)
		} catch (error) {
			console.error(error)
			toast.error("Ocurrió un error al procesar el documento")
		} finally {
			setIsUploading(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					size="icon"
					variant="default"
					className="border border-purple-500 bg-purple-500/20 text-purple-500 hover:bg-purple-500/50 hover:text-purple-500"
				>
					<CalendarSyncIcon className="h-4 w-4" />
				</Button>
			</SheetTrigger>

			<SheetContent className="overflow-y-scroll pb-14">
				<SheetHeader className="shadow">
					<SheetTitle>Actualizar fecha de vencimiento</SheetTitle>
					<SheetDescription>Actualizar la fecha de vencimiento del documento</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-x-3 gap-y-6 px-4">
						<DatePickerFormField<UpdateExpirationDateSchema>
							name="expirationDate"
							control={form.control}
							label="Fecha de vencimiento"
							disabledCondition={(date) => date < new Date()}
						/>

						<div className="flex flex-col justify-end space-x-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={isUploading}
							>
								Cancelar
							</Button>

							<SubmitButton label="Actualizar fecha de vencimiento" isSubmitting={isUploading} />
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
