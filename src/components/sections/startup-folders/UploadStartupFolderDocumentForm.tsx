"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Upload } from "lucide-react"
import { addYears } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

import { uploadFilesToCloud } from "@/lib/upload-files"
import {
	uploadStartupFolderDocumentSchema,
	type UploadStartupFolderDocumentSchema,
} from "@/lib/form-schemas/startup-folder/new-file.schema"

import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import UploadFilesFormField from "@/components/forms/shared/UploadFilesFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Form } from "@/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

import type {
	DocumentCategory,
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	SafetyAndHealthDocumentType,
} from "@prisma/client"
import { queryClient } from "@/lib/queryClient"

interface UploadStartupFolderDocumentFormProps {
	userId: string
	folderId: string
	documentName: string
	type:
		| WorkerDocumentType
		| VehicleDocumentType
		| EnvironmentalDocType
		| SafetyAndHealthDocumentType
	isUpdate: boolean
	documentId: string
	currentUrl?: string
	category: DocumentCategory
	workerId?: string
	companyId: string
	vehicleId?: string
}

export function UploadStartupFolderDocumentForm({
	type,
	userId,
	workerId,
	folderId,
	isUpdate,
	category,
	vehicleId,
	companyId,
	documentId,
	currentUrl,
	documentName,
}: UploadStartupFolderDocumentFormProps) {
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [isUploading, setIsUploading] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<UploadStartupFolderDocumentSchema>({
		resolver: zodResolver(uploadStartupFolderDocumentSchema),
		defaultValues: {
			type,
			folderId,
			documentId,
			name: documentName,
			expirationDate: addYears(new Date(), 1),
			files: isUpdate
				? [
						{
							url: currentUrl,
							file: undefined,
							title: documentName,
							preview: currentUrl,
						},
					]
				: [],
		},
	})

	async function onSubmit(values: UploadStartupFolderDocumentSchema) {
		const file = form.getValues("files")[0]

		if (!file) {
			toast.error("Por favor selecciona un archivo")
			return
		}

		setIsUploading(true)

		try {
			const uploadResults = await uploadFilesToCloud({
				files: [file],
				randomString: folderId,
				containerType: "startup",
				secondaryName: documentName,
			})

			if (!uploadResults || uploadResults.length === 0) {
				throw new Error("Error al subir el archivo")
			}

			const uploadedFile = uploadResults[0]

			let result: { ok: boolean; message?: string }

			switch (category) {
				case "SAFETY_AND_HEALTH":
					if (isUpdate && documentId) {
						const { updateSafetyAndHealthDocument } = await import(
							"@/actions/startup-folders/documents/safety-and-health"
						)
						result = await updateSafetyAndHealthDocument({
							data: { documentId, file: [], expirationDate: values.expirationDate },
							uploadedFile,
							userId,
						})
					} else {
						const { createSafetyAndHealthDocument } = await import(
							"@/actions/startup-folders/documents/safety-and-health"
						)
						result = await createSafetyAndHealthDocument({
							data: {
								type,
								folderId,
								files: [],
								documentId,
								name: values.name || documentName,
								expirationDate: values.expirationDate,
							},
							uploadedFile,
							userId,
						})
					}
					break

				case "PERSONNEL":
					if (isUpdate && documentId) {
						const { updateWorkerDocument } = await import(
							"@/actions/startup-folders/documents/worker"
						)
						if (!workerId) throw new Error("Worker ID is required for updating worker document.")
						result = await updateWorkerDocument({
							data: { documentId, expirationDate: values.expirationDate, file: [] },
							file: uploadedFile,
							userId,
						})
					} else {
						const { createWorkerDocument } = await import(
							"@/actions/startup-folders/documents/worker"
						)
						if (!workerId) throw new Error("Worker ID is required for creating worker document.")
						result = await createWorkerDocument({
							data: {
								folderId,
								workerId,
								documentId,
								files: values.files,
								type: type as WorkerDocumentType,
								name: values.name || documentName,
								expirationDate: values.expirationDate,
							},
							file: uploadedFile,
							userId,
						})
					}
					break

				case "VEHICLES":
					if (isUpdate && documentId) {
						const { updateVehicleDocument } = await import(
							"@/actions/startup-folders/documents/vehicle"
						)
						result = await updateVehicleDocument({
							data: { documentId, file: [], expirationDate: values.expirationDate },
							uploadedFile,
							userId,
						})
					} else {
						const { createVehicleDocument } = await import(
							"@/actions/startup-folders/documents/vehicle"
						)
						result = await createVehicleDocument({
							data: {
								type,
								folderId,
								files: [],
								vehicleId,
								documentId,
								name: values.name || documentName,
								expirationDate: values.expirationDate,
							},
							uploadedFile,
							userId,
						})
					}
					break

				case "ENVIRONMENTAL":
					if (isUpdate && documentId) {
						const { updateEnvironmentalDocument } = await import(
							"@/actions/startup-folders/documents/environmental"
						)
						result = await updateEnvironmentalDocument({
							data: { documentId, file: [], expirationDate: values.expirationDate },
							uploadedFile,
							userId,
						})
					} else {
						const { createEnvironmentalDocument } = await import(
							"@/actions/startup-folders/documents/environmental"
						)
						result = await createEnvironmentalDocument({
							data: {
								type,
								folderId,
								files: [],
								documentId,
								name: values.name || documentName,
								expirationDate: values.expirationDate,
							},
							uploadedFile,
							userId,
						})
					}
					break

				default:
					throw new Error("Tipo de documento no soportado")
			}

			if (!result.ok) {
				throw new Error(
					result.message || `Error al ${isUpdate ? "actualizar" : "guardar"} el documento`
				)
			}

			// 3. Mostrar mensaje de éxito
			toast.success(`Documento ${isUpdate ? "actualizado" : "subido"} correctamente`)

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
					size="sm"
					variant={isUpdate ? "outline" : "default"}
					className={`${!isUpdate && "bg-primary/80 hover:bg-primary hover:text-white"}`}
				>
					<Upload className="mr-1 h-4 w-4" />
					{isUpdate ? "Actualizar" : "Subir"}
				</Button>
			</SheetTrigger>

			<SheetContent className="overflow-y-scroll pb-14">
				<SheetHeader className="shadow">
					<SheetTitle>{isUpdate ? "Actualizar documento" : "Subir documento"}</SheetTitle>
					<SheetDescription>
						{isUpdate
							? "Sube una nueva versión del documento"
							: "Sube el documento requerido para la carpeta de arranque"}
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-x-3 gap-y-6 px-4">
						<InputFormField<UploadStartupFolderDocumentSchema>
							name="name"
							control={form.control}
							label="Nombre del documento"
						/>

						<DatePickerFormField<UploadStartupFolderDocumentSchema>
							name="expirationDate"
							control={form.control}
							label="Fecha de vencimiento"
							disabledCondition={(date) => date < new Date()}
						/>

						<div className="space-y-2">
							<Label htmlFor="document-file">Archivo</Label>
							<UploadFilesFormField
								name="files"
								maxFileSize={200}
								isMultiple={false}
								control={form.control}
								className="hidden lg:grid"
								containerClassName="w-full"
								selectedFileIndex={selectedFileIndex}
								setSelectedFileIndex={setSelectedFileIndex}
							/>
						</div>

						{isUpdate && currentUrl && (
							<div className="bg-muted rounded-md p-3">
								<p className="text-sm font-medium">Documento actual:</p>
								<a
									href={currentUrl}
									target="_blank"
									rel="noreferrer"
									className="text-sm break-all text-blue-600 hover:underline"
								>
									Ver documento
								</a>
							</div>
						)}

						<div className="flex flex-col justify-end space-x-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={isUploading}
							>
								Cancelar
							</Button>

							<SubmitButton label="Subir documento" isSubmitting={isUploading} />
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
