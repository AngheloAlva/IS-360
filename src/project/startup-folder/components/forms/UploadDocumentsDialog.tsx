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
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/shared/components/ui/select"

import type { ManagedFile } from "@/project/startup-folder/hooks/use-file-manager"
import type { StartupFolderDocument } from "../../types"
import type { DocumentCategory, WorkerDocumentType } from "@prisma/client"

interface UploadDocumentsDialogProps {
	userId: string
	isOpen: boolean
	workerId?: string
	vehicleId?: string
	multiple?: boolean
	onClose: () => void
	startupFolderId: string
	category: DocumentCategory
	onUploadComplete?: () => void
	documentToUpdate?: StartupFolderDocument | null
}

export function UploadDocumentsDialog({
	isOpen,
	userId,
	onClose,
	workerId,
	category,
	vehicleId,
	startupFolderId,
	multiple = true,
	documentToUpdate,
	onUploadComplete,
}: UploadDocumentsDialogProps) {
	const uploadDocumentsSchema = z.object({
		files: z.array(
			z.object({
				file: z.instanceof(File).optional(),
				documentType: z.string().optional(),
				documentName: z.string().optional(),
				expirationDate: z.date().optional(),
			})
		),
	})

	type UploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>

	const defaultExpirationDate = addYears(new Date(), 1)
	console.log(documentToUpdate)

	const form: UseFormReturn<UploadDocumentsFormData> = useForm<UploadDocumentsFormData>({
		resolver: zodResolver(uploadDocumentsSchema),
		defaultValues: {
			files: documentToUpdate
				? [
						{
							file: undefined,
							documentType: documentToUpdate.type,
							documentName: documentToUpdate.name,
							expirationDate: documentToUpdate.expirationDate
								? new Date(documentToUpdate.expirationDate)
								: defaultExpirationDate,
						},
					]
				: [],
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

	const { files, addFiles, removeFile, setFileType } = useFileManager(initialFiles)
	const { documentTypes, title } = getDocumentTypesByCategory(category)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [dragActive, setDragActive] = useState(false)

	const handleSubmit = form.handleSubmit(async (data) => {
		try {
			setIsSubmitting(true)

			const files = data.files
				.filter((file): file is typeof file & { file: File } => {
					return (
						file.file instanceof File &&
						typeof file.documentType === "string" &&
						typeof file.documentName === "string" &&
						file.expirationDate instanceof Date
					)
				})
				.map((file) => ({
					file: file.file,
					documentType: file.documentType,
					documentName: file.documentName,
					expirationDate: file.expirationDate,
				}))

			const uploadResults =
				files.length > 0
					? await uploadFilesToCloud({
							files: files.map(({ file }) => ({
								file,
								type: file.type,
								url: "",
								preview: "",
								title: file.name,
								fileSize: file.size,
								mimeType: file.type,
							})),
							randomString: startupFolderId || workerId || vehicleId || "",
							containerType: "startup",
							nameStrategy: "original",
						})
					: []

			if (documentToUpdate && data.files[0]) {
				const fileData = data.files[0]

				if (!fileData?.documentType || !fileData?.documentName || !fileData?.expirationDate) {
					throw new Error("Missing required document metadata")
				}

				const emptyUpload: UploadResult = {
					url: documentToUpdate.url || "",
					type: fileData.documentType,
					size: 0,
					name: fileData.documentName,
				}

				await updateStartupFolderDocument({
					data: {
						category,
						documentId: documentToUpdate.id,
						documentName: fileData.documentName,
						expirationDate: fileData.expirationDate,
						documentType: fileData.documentType as WorkerDocumentType,
					},
					userId,
					uploadedFile: uploadResults[0] || emptyUpload,
				})
			} else {
				// Handle new document upload
				if (files.length > 0) {
					const filesToUpload = files.map((file) => ({
						file: file.file,
						type: file.file.type,
						url: "",
						preview: "",
						title: file.file.name,
						fileSize: file.file.size,
						mimeType: file.file.type,
					}))

					const uploadResults = await uploadFilesToCloud({
						files: filesToUpload,
						randomString: startupFolderId || workerId || vehicleId || "",
						containerType: "startup",
						nameStrategy: "original",
					})

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
				queryKey: ["startupFolderDocuments", { startupFolderId, category, workerId, vehicleId }],
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

	const handleFileTypeChange = (index: number, type: string) => {
		const documentTypes = getDocumentTypesByCategory(category).documentTypes
		const docType = documentTypes.find((docType) => docType.type === type)

		if (!docType) return

		const currentTypeCount = files.reduce(
			(count: number, file: ManagedFile) => (file.documentType === type ? count + 1 : count),
			0
		)

		const suffix = currentTypeCount > 0 ? ` (${currentTypeCount + 1})` : ""

		setFileType(index, { type, name: docType.name + suffix, expirationDate: defaultExpirationDate })
		form.setValue(`files.${index}.documentType`, type)
		form.setValue(`files.${index}.documentName`, docType.name + suffix)
	}

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
					<DialogTitle>Subir documentos</DialogTitle>
					<DialogDescription>
						Sube documentos para la carpeta <span className="font-semibold">{title}</span>.
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
													"cursor-not-allowed opacity-50 hover:bg-transparent": documentToUpdate,
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
												className="hidden"
												multiple={multiple}
												disabled={documentToUpdate ? true : false}
												onChange={(e) => addFiles(e.target.files)}
											/>

											<label
												htmlFor="file-upload"
												className={cn("flex cursor-pointer flex-col items-center gap-2", {
													"cursor-not-allowed": documentToUpdate,
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
												<Select
													value={file.documentType}
													onValueChange={(value) => handleFileTypeChange(index, value)}
												>
													<SelectTrigger>
														<SelectValue placeholder="Tipo de documento" />
													</SelectTrigger>
													<SelectContent>
														{documentTypes.map((docType) => (
															<SelectItem key={docType.type} value={docType.type}>
																{docType.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</TableCell>
											<TableCell>
												<DatePickerFormField
													showLabel={false}
													control={form.control}
													label="Fecha de vencimiento"
													name={`files.${index}.expirationDate`}
													disabledCondition={(date) => date < new Date()}
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
