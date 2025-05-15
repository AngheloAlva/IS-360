"use client"

import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Upload } from "lucide-react"
import { toast } from "sonner"

import { uploadFilesToCloud } from "@/lib/upload-files"
import {
	uploadStartupFolderDocumentSchema,
	type UploadStartupFolderDocumentSchema,
} from "@/lib/form-schemas/startup-folder/new-file.schema"

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
	CompanyDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
} from "@prisma/client"

interface UploadStartupFolderDocumentFormProps {
	folderId: string
	documentName: string
	type: CompanyDocumentType | WorkerDocumentType | VehicleDocumentType | EnvironmentalDocType
	isUpdate: boolean
	documentId?: string
	currentUrl?: string
	category: DocumentCategory
}

export function UploadStartupFolderDocumentForm({
	type,
	folderId,
	isUpdate,
	category,
	documentId,
	currentUrl,
	documentName,
}: UploadStartupFolderDocumentFormProps) {
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [isUploading, setIsUploading] = useState(false)
	const [open, setOpen] = useState(false)

	const queryClient = useQueryClient()

	const form = useForm<UploadStartupFolderDocumentSchema>({
		resolver: zodResolver(uploadStartupFolderDocumentSchema),
		defaultValues: {
			folderId,
			name: documentName,
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
			type,
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
							data: { documentId, file: [] },
							uploadedFile,
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
								name: values.name || documentName,
							},
							uploadedFile,
						})
					}
					break

				case "PERSONNEL":
					// Importa e invoca la server action para documentos de trabajadores
					if (isUpdate && documentId) {
						const { updateWorkerDocument } = await import(
							"@/actions/startup-folders/documents/worker"
						)
						result = await updateWorkerDocument({
							data: { documentId, file: [] },
							file: uploadedFile,
						})
					} else {
						const { createWorkerDocument } = await import(
							"@/actions/startup-folders/documents/worker"
						)
						result = await createWorkerDocument({
							data: {
								type,
								folderId,
								files: [],
								name: values.name || documentName,
							},
							file: uploadedFile,
						})
					}
					break

				case "VEHICLES":
					// Importa e invoca la server action para documentos de vehículos
					if (isUpdate && documentId) {
						const { updateVehicleDocument } = await import(
							"@/actions/startup-folders/documents/vehicle"
						)
						result = await updateVehicleDocument({
							data: { documentId, file: [] },
							uploadedFile,
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
								name: values.name || documentName,
							},
							uploadedFile,
						})
					}
					break

				case "ENVIRONMENTAL":
					if (isUpdate && documentId) {
						const { updateEnvironmentalDocument } = await import(
							"@/actions/startup-folders/documents/environmental"
						)
						result = await updateEnvironmentalDocument({
							data: { documentId, file: [] },
							uploadedFile,
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
								name: values.name || documentName,
							},
							uploadedFile,
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

			// 4. Refrescar los datos
			queryClient.invalidateQueries({
				queryKey: ["generalStartupFolder", folderId],
			})
			queryClient.invalidateQueries({
				queryKey: ["workOrderStartupFolder", folderId],
			})

			setOpen(false)
		} catch (error) {
			console.error(error)
			toast.error("Ocurrió un error al procesar el documento")
		} finally {
			setIsUploading(false)
		}
	}

	useEffect(() => {
		console.log(form.formState.errors)
	}, [form.formState.errors])

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
