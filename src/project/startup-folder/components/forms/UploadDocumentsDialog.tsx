"use client"

import { Trash2Icon, UploadIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { type UseFormReturn } from "react-hook-form"
import { useForm } from "react-hook-form"
import { addYears } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { createStartupFolderDocument } from "../../actions/create-startup-folder-document"
import { updateStartupFolderDocument } from "../../actions/update-startup-folder-document"
import { getDocumentTypesByCategory } from "@/lib/consts/startup-folders-structure"
import { useFileManager } from "@/project/startup-folder/hooks/use-file-manager"
import { createVehicleDocument } from "../../actions/create-vehicle-document"
import { createWorkerDocument } from "../../actions/create-worker-document"
import { uploadFilesToCloud, type UploadResult } from "@/lib/upload-files"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/shared/components/ui/form"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

import type {
	DocumentCategory,
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	SafetyAndHealthDocumentType,
} from "@prisma/client"
import type { StartupFolderDocument } from "../../types"

interface UploadDocumentsDialogProps {
	userId: string
	isOpen: boolean
	workerId?: string
	vehicleId?: string
	onClose: () => void
	startupFolderId: string
	category: DocumentCategory
	onUploadComplete?: () => void
	documentToUpdate?: StartupFolderDocument | null
	documentType?: {
		type:
			| WorkerDocumentType
			| VehicleDocumentType
			| EnvironmentalDocType
			| SafetyAndHealthDocumentType
		name: string
	} | null
}

export function UploadDocumentsDialog({
	isOpen,
	userId,
	onClose,
	workerId,
	category,
	vehicleId,
	documentType,
	startupFolderId,
	documentToUpdate,
	onUploadComplete,
}: UploadDocumentsDialogProps) {
	const uploadDocumentsSchema = z.object({
		file: z.instanceof(File).optional(),
		documentType: z.string().min(1, "El tipo de documento es obligatorio"),
		documentName: z.string().min(1, "El nombre del documento es obligatorio"),
		expirationDate: z.date({
			required_error: "La fecha de vencimiento es obligatoria",
			invalid_type_error: "La fecha de vencimiento debe ser válida",
		}),
	})

	type UploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>

	const defaultExpirationDate = addYears(new Date(), 1)

	const form: UseFormReturn<UploadDocumentsFormData> = useForm<UploadDocumentsFormData>({
		resolver: zodResolver(uploadDocumentsSchema),
		defaultValues: {
			file: undefined,
			documentType: documentToUpdate?.type,
			documentName: documentToUpdate?.name,
			expirationDate: documentToUpdate?.expirationDate
				? new Date(documentToUpdate.expirationDate)
				: defaultExpirationDate,
		},
	})

	const initialFiles = documentToUpdate
		? [
				Object.assign({
					file: undefined,
					documentType: documentToUpdate.type,
					documentName: documentToUpdate.name,
					expirationDate: documentToUpdate.expirationDate
						? new Date(documentToUpdate.expirationDate)
						: defaultExpirationDate,
				}),
			]
		: []

	const { files, addFiles, removeFile } = useFileManager(
		initialFiles,
		documentType,
		(updatedFiles) => {
			updatedFiles.map((file) => {
				form.setValue("file", file)
				form.setValue("documentType", file.documentType || "")
				form.setValue("documentName", file.documentName || "")
				form.setValue("expirationDate", file.expirationDate || defaultExpirationDate)
			})
		}
	)
	const { documentTypes, title } = getDocumentTypesByCategory(category)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [dragActive, setDragActive] = useState(false)

	const handleSubmit = form.handleSubmit(async (data) => {
		try {
			setIsSubmitting(true)

			if (!documentToUpdate && data.file === undefined) {
				toast.error("No se seleccionaron archivos")
				return
			}

			const uploadResults =
				files.length > 0
					? await uploadFilesToCloud({
							files: [
								{
									file: data.file,
									url: "",
									preview: "",
									type: data.file?.type || "",
									title: data.file?.name || "",
									fileSize: data.file?.size || 0,
									mimeType: data.file?.type || "",
								},
							],
							randomString: startupFolderId || workerId || vehicleId || "",
							containerType: "startup",
							nameStrategy: "original",
						})
					: []

			if (documentToUpdate && data.file) {
				if (!data?.documentType || !data?.documentName || !data?.expirationDate) {
					throw new Error("Missing required document metadata")
				}

				const emptyUpload: UploadResult = {
					url: documentToUpdate.url || "",
					type: data.documentType,
					size: 0,
					name: data.documentName,
				}

				await updateStartupFolderDocument({
					data: {
						category,
						documentId: documentToUpdate.id,
						documentName: data.documentName,
						expirationDate: data.expirationDate,
						documentType: data.documentType as WorkerDocumentType,
					},
					userId,
					uploadedFile: uploadResults[0] || emptyUpload,
				})
			} else {
				if (files.length > 0) {
					const uploadResults = await uploadFilesToCloud({
						files: [
							{
								url: "",
								preview: "",
								file: data.file,
								type: data.file?.type || "",
								title: data.file?.name || "",
								fileSize: data.file?.size || 0,
								mimeType: data.file?.type || "",
							},
						],
						randomString: startupFolderId || workerId || vehicleId || "",
						containerType: "startup",
						nameStrategy: "original",
					})

					console.log(uploadResults)

					const promises = files.map((file, index) => {
						const { documentType, documentName, expirationDate } = file
						const uploadResult = uploadResults[index]

						// Validate required fields
						if (!documentType || !documentName || !expirationDate) {
							throw new Error("Document type, name and expiration date are required")
						}

						switch (category) {
							case "PERSONNEL": {
								if (!workerId) throw new Error("Worker ID is required for personnel documents")
								return createWorkerDocument({
									workerId,
									documentType,
									documentName,
									expirationDate,
									url: uploadResult.url,
									userId,
								})
							}
							case "VEHICLES": {
								if (!vehicleId) throw new Error("Vehicle ID is required for vehicle documents")
								return createVehicleDocument({
									vehicleId,
									documentType,
									documentName,
									expirationDate,
									url: uploadResult.url,
									userId,
								})
							}
							default: {
								if (!startupFolderId) throw new Error("Startup folder ID is required")
								return createStartupFolderDocument({
									startupFolderId,
									documentType,
									documentName,
									category,
									expirationDate,
									url: uploadResult.url,
									userId,
								})
							}
						}
					})

					await Promise.all(promises)
				}
			}

			toast.success(
				documentToUpdate ? "Documento actualizado exitosamente" : "Documentos subidos exitosamente"
			)
			queryClient.invalidateQueries({
				queryKey: ["startupFolderDocuments", { startupFolderId, category }],
			})

			onClose()
			onUploadComplete?.()
		} catch (error) {
			console.error(error)
			toast.error("Error al subir los documentos")
		} finally {
			setIsSubmitting(false)
		}
	})

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(true)
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(false)
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(false)

		if (documentToUpdate) return

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			addFiles(e.dataTransfer.files)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="w-full max-w-full sm:max-w-fit">
				<DialogHeader>
					<DialogTitle>Subir documento</DialogTitle>
					<DialogDescription>
						Sube el documento {documentType?.name} para la carpeta{" "}
						<span className="font-semibold">{title}</span>.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={handleSubmit} className="space-y-6">
						<FormField
							name="files"
							render={() => (
								<FormItem>
									<FormLabel>Archivos</FormLabel>
									<FormControl>
										<div
											className={cn(
												"border-muted-foreground/25 hover:bg-accent flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center transition-colors",
												{
													"border-primary bg-primary/5": dragActive,
													"cursor-not-allowed opacity-50 hover:bg-transparent":
														documentToUpdate || files.length > 0,
												}
											)}
											onDragEnter={handleDragEnter}
											onDragLeave={handleDragLeave}
											onDragOver={handleDragEnter}
											onDrop={handleDrop}
										>
											<input
												type="file"
												id="file-upload"
												multiple={false}
												className="hidden"
												onChange={(e) => addFiles(e.target.files)}
												disabled={documentToUpdate ? true : false || files.length > 0}
											/>

											<label
												htmlFor="file-upload"
												className={cn("flex cursor-pointer flex-col items-center gap-2", {
													"cursor-not-allowed": documentToUpdate || files.length > 0,
												})}
											>
												<UploadIcon className="text-muted-foreground h-8 w-8" />
												<div className="space-y-1">
													<p className="text-lg font-medium">
														{dragActive
															? "Arrastra los archivos aquí"
															: "Arrastra y suelta los archivos o haz clic para subir"}
													</p>
													<p className="text-muted-foreground text-sm">
														{documentToUpdate
															? "Puedes remplazar el archivo actual eliminando el archivo actual y subiendo el nuevo"
															: "Sube múltiples archivos a la vez"}
													</p>
												</div>
											</label>
										</div>
									</FormControl>
								</FormItem>
							)}
						/>

						{files.length > 0 && (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Nombre del archivo</TableHead>
										<TableHead>Tamaño</TableHead>
										<TableHead>Tipo</TableHead>
										<TableHead>Vencimiento</TableHead>
										<TableHead>Acciones</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{files.map((file, index) => (
										<TableRow key={index}>
											<TableCell>{file.documentName || file.name}</TableCell>
											<TableCell>{Math.round((file as File).size / 1024)} KB</TableCell>
											<TableCell>
												{documentTypes.find((dt) => dt.type === file.documentType)?.name}
											</TableCell>
											<TableCell>
												<DatePickerFormField
													showLabel={false}
													name="expirationDate"
													control={form.control}
													label="Fecha de vencimiento"
													disabledCondition={(date: Date) => date < new Date()}
												/>
											</TableCell>
											<TableCell>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => removeFile(index)}
													className="text-red-500 hover:bg-red-500 hover:text-white"
												>
													<Trash2Icon />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}

						<div className="flex justify-end gap-2">
							<Button variant="outline" type="button" onClick={onClose}>
								Cancelar
							</Button>

							<Button
								type="submit"
								className="bg-cyan-600 hover:bg-cyan-700 hover:text-white"
								disabled={(files.length === 0 && !documentToUpdate) || isSubmitting}
							>
								{isSubmitting ? <Spinner /> : documentToUpdate ? "Actualizar" : "Subir"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
