"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2Icon, Upload } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { addYears } from "date-fns"
import { z } from "zod"

import { useFileManager, type ManagedFile } from "@/project/startup-folder/hooks/use-file-manager"
import { createStartupFolderDocument } from "../../actions/create-startup-folder-document"
import { updateStartupFolderDocument } from "../../actions/update-startup-folder-document"
import { createWorkerDocument } from "../../actions/create-worker-document"
import { createVehicleDocument } from "../../actions/create-vehicle-document"
import { getDocumentTypesByCategory } from "@/lib/consts/startup-folders-structure"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { DocumentCategory } from "@prisma/client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { type StartupFolderDocument } from "../../types"

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/shared/components/ui/form"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger,
} from "@/shared/components/ui/select"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

interface UploadDocumentsDialogProps {
	category: DocumentCategory
	onClose: () => void
	isOpen: boolean
	startupFolderId?: string
	userId: string
	onUploadComplete?: () => void
	workerId?: string
	vehicleId?: string
	documentToUpdate?: StartupFolderDocument | null
}

export function UploadDocumentsDialog({
	category,
	startupFolderId,
	userId,
	isOpen,
	onClose,
	onUploadComplete,
	workerId,
	vehicleId,
	documentToUpdate,
}: UploadDocumentsDialogProps): React.ReactElement {
	const uploadDocumentsSchema = z.object({
		files: z.array(
			z.object({
				file: z.instanceof(File),
				documentType: z.string(),
				documentName: z.string(),
				expirationDate: z.date(),
			})
		),
	})

	type UploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>

	const form = useForm<UploadDocumentsFormData>({
		resolver: zodResolver(uploadDocumentsSchema),
		defaultValues: {
			files: [],
		},
	})

	const defaultExpirationDate = addYears(new Date(), 1)

	const { files, addFiles, removeFile, setFileType } = useFileManager()
	const { documentTypes, title } = getDocumentTypesByCategory(category)
	const [dragActive, setDragActive] = useState(false)

	const handleSubmit = form.handleSubmit(async (data) => {
		if (files.length === 0) return

		try {
			const filesToUpload = files.map((file: ManagedFile, index) => ({
				file,
				documentType: file.documentType || "",
				documentName: file.documentName || file.name,
				expirationDate: data.files[index].expirationDate,
			}))

			// Upload files to cloud storage
			const uploadResults = await uploadFilesToCloud({
				files: filesToUpload.map(({ file }) => ({
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

			// Create or update document records in the database
			const documentPromises = uploadResults.map((uploadResult, index) => {
				const { documentType, documentName, expirationDate } = filesToUpload[index]

				if (documentToUpdate) {
					return updateStartupFolderDocument({
						data: {
							documentId: documentToUpdate.id,
							category,
							expirationDate,
						},
						uploadedFile: uploadResult,
						userId,
					})
				}

				if (category === "PERSONNEL" && workerId) {
					if (startupFolderId) {
						return createStartupFolderDocument({
							userId,
							startupFolderId,
							documentType,
							documentName,
							url: uploadResult.url,
							category,
							workerId,
							expirationDate,
						})
					}

					return createWorkerDocument({
						userId,
						workerId,
						documentType,
						documentName,
						url: uploadResult.url,
						expirationDate,
					})
				}

				if (category === "VEHICLES" && vehicleId) {
					if (startupFolderId) {
						return createStartupFolderDocument({
							userId,
							startupFolderId,
							documentType,
							documentName,
							url: uploadResult.url,
							category,
							vehicleId,
							expirationDate,
						})
					}

					return createVehicleDocument({
						userId,
						vehicleId,
						documentType,
						documentName,
						url: uploadResult.url,
						expirationDate,
					})
				}

				if (!startupFolderId) {
					throw new Error("startupFolderId is required for this document category")
				}

				return createStartupFolderDocument({
					userId,
					startupFolderId,
					documentType,
					documentName,
					url: uploadResult.url,
					category,
					expirationDate,
				})
			})

			await Promise.all(documentPromises)

			onClose()
			onUploadComplete?.()
		} catch (error) {
			console.error("Error uploading files:", error)
			toast.error("Error uploading files")
		}
	})

	const handleFileTypeChange = (index: number, type: string) => {
		const docType = documentTypes.find((t) => t.type === type)
		if (!docType) return

		// Count current occurrences of this type in files
		const currentTypeCount = files.reduce(
			(count, file) => (file.documentType === type ? count + 1 : count),
			0
		)

		const suffix = currentTypeCount > 0 ? ` (${currentTypeCount + 1})` : ""

		setFileType(index, {
			type,
			name: `${docType.name}${suffix}`,
			expirationDate: defaultExpirationDate,
		})
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

		if (e.dataTransfer.files) {
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
												"flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center transition-colors",
												dragActive
													? "border-primary bg-primary/5"
													: "border-muted-foreground/25 hover:bg-accent"
											)}
											onDragEnter={handleDragEnter}
											onDragLeave={handleDragLeave}
											onDragOver={handleDragEnter}
											onDrop={handleDrop}
										>
											<input
												multiple
												type="file"
												id="file-upload"
												className="hidden"
												onChange={(e) => addFiles(e.target.files)}
											/>
											<label
												htmlFor="file-upload"
												className="flex cursor-pointer flex-col items-center gap-2"
											>
												<Upload className="text-muted-foreground h-8 w-8" />
												<div className="space-y-1">
													<p className="text-lg font-medium">
														{dragActive
															? "Arrastra los archivos aquí"
															: "Arrastra y suelta los archivos o haz clic para subir"}
													</p>
													<p className="text-muted-foreground text-sm">
														Sube múltiples archivos a la vez
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
									{files.map((file: ManagedFile, index: number) => (
										<TableRow key={index}>
											<TableCell>{file.documentName || file.name}</TableCell>
											<TableCell>{Math.round(file.size / 1024)} KB</TableCell>
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
													name={`files.${index}.expirationDate`}
													control={form.control}
													label="Fecha de vencimiento"
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
								disabled={files.length === 0}
							>
								Subir
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
