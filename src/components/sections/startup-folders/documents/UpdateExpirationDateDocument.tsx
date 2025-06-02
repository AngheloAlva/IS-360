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
} from "@/lib/form-schemas/startup-folder/update-expiration-date"

import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

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
						const { updateExpirationDateSafetyAndHealthDocument } = await import(
							"@/actions/startup-folders/documents/safety-and-health"
						)
						result = await updateExpirationDateSafetyAndHealthDocument({
							data: { documentId, expirationDate: values.expirationDate, folderId },
						})
					}
					break

				case "PERSONNEL":
					if (documentId) {
						const { updateExpirationDateWorkerDocument } = await import(
							"@/actions/startup-folders/documents/worker"
						)
						result = await updateExpirationDateWorkerDocument({
							data: { documentId, expirationDate: values.expirationDate, folderId },
						})
					}
					break

				case "VEHICLES":
					if (documentId) {
						const { updateExpirationDateVehicleDocument } = await import(
							"@/actions/startup-folders/documents/vehicle"
						)
						result = await updateExpirationDateVehicleDocument({
							data: { documentId, expirationDate: values.expirationDate, folderId },
						})
					}
					break

				case "ENVIRONMENTAL":
					if (documentId) {
						const { updateExpirationDateEnvironmentalDocument } = await import(
							"@/actions/startup-folders/documents/environmental"
						)
						result = await updateExpirationDateEnvironmentalDocument({
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
