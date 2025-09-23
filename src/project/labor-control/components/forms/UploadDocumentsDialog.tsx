"use client"

import { type UseFormReturn, useForm } from "react-hook-form"
import { Trash2Icon, UploadIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { type UploadDocumentsFormData, uploadDocumentsSchema } from "../../schemas/document.schema"
import { updateStartupFolderDocument } from "../../actions/update-labor-control-document"
import { ManagedFile, useFileManager } from "../../hooks/use-file-manager"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"

import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
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

import type { LaborControlDocument, WorkerLaborControlDocument } from "../../types"
import type { UploadResult } from "@/lib/upload-files"
import type {
	LABOR_CONTROL_DOCUMENT_TYPE,
	WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
} from "@prisma/client"
import { createWorkerDocument } from "../../actions/worker/create-worker-document"
import { LABOR_CONTROL_STRUCTURE } from "@/lib/consts/labor-control-folders-structure"
import { createLaborControlDocument } from "../../actions/create-labor-control-document"

interface UploadDocumentsDialogProps {
	userId: string
	isOpen: boolean
	onClose: () => void
	onUploadComplete: () => void
	folderId: string
	workerId?: string
	documentType?: {
		type: LABOR_CONTROL_DOCUMENT_TYPE | WORKER_LABOR_CONTROL_DOCUMENT_TYPE
		name: string
	} | null
	documentToUpdate?: LaborControlDocument | WorkerLaborControlDocument | null
	userCompanyId?: string | null
}

export function UploadDocumentsDialog({
	isOpen,
	userId,
	onClose,
	workerId,
	folderId,
	documentType,
	documentToUpdate,
	onUploadComplete,
	userCompanyId,
}: UploadDocumentsDialogProps) {
	const form: UseFormReturn<UploadDocumentsFormData> = useForm<UploadDocumentsFormData>({
		resolver: zodResolver(uploadDocumentsSchema),
		defaultValues: {
			file: undefined,
			documentType: documentToUpdate?.type || documentType?.type || "",
			documentName: documentToUpdate?.name || documentType?.name || "",
		},
	})

	const initialFile: ManagedFile | null = documentToUpdate
		? Object.assign({
				file: undefined,
				documentType: documentToUpdate.type,
				documentName: documentToUpdate.name,
			})
		: null

	const { file, addFiles, removeFile } = useFileManager(
		initialFile,
		documentType,
		(updatedFiles) => {
			if (updatedFiles) {
				form.setValue("documentType", documentType?.type || updatedFiles.documentType || "")
				form.setValue("documentName", documentType?.name || updatedFiles.documentName || "")
			}
		}
	)

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [dragActive, setDragActive] = useState(false)

	const onSubmit = async (data: z.infer<typeof uploadDocumentsSchema>) => {
		try {
			setIsSubmitting(true)

			if (!documentToUpdate && !file) {
				toast.error("No se seleccionaron archivos")
				return
			}

			let uploadResult: UploadResult | undefined

			if (file?.file) {
				const results = await uploadFilesToCloud({
					files: [
						{
							url: "",
							preview: "",
							file: file.file,
							type: data.documentType,
							title: data.documentName,
							fileSize: file.file.size || 0,
							mimeType: file.file.type || "",
						},
					],
					randomString: folderId || workerId || "",
					containerType: "startup",
					companyId: userCompanyId || undefined,
					nameStrategy: "original",
				})
				uploadResult = results[0]
			}

			if (documentToUpdate) {
				const result = await updateStartupFolderDocument({
					data: {
						documentId: documentToUpdate.id,
						documentName: data.documentName,
						documentType: data.documentType as
							| LABOR_CONTROL_DOCUMENT_TYPE
							| WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
					},
					uploadedFile: uploadResult || {
						url: documentToUpdate.url || "",
						type: data.documentType,
						size: file?.file?.size || 0,
						name: data.documentName,
					},
					userId,
				})

				if (!result.ok) {
					toast.error(result.message)
					return
				}
			} else if (file && uploadResult) {
				const docType = documentType?.type || file.documentType
				const docName = documentType?.name || file.documentName

				if (!docType || !docName) {
					throw new Error("Document type and name are required")
				}

				if (workerId) {
					const {} = await createWorkerDocument({
						userId,
						workerId,
						folderId,
						documentName: docName,
						documentType: docType,
						url: uploadResult.url,
					})
				} else {
					await createLaborControlDocument({
						userId,
						folderId,
						url: uploadResult.url,
						documentType: docType,
						documentName: docName,
					})
				}
			}

			toast.success(
				documentToUpdate ? "Documento actualizado exitosamente" : "Documentos subidos exitosamente"
			)
			queryClient.invalidateQueries({
				queryKey: ["laborControlFolderDocuments", { folderId }],
			})

			onClose()
			onUploadComplete?.()
		} catch (error) {
			console.error(error)
			toast.error("Error al subir los documentos")
		} finally {
			setIsSubmitting(false)
		}
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

		if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return

		addFiles(e.dataTransfer.files[0])
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="w-full max-w-full sm:max-w-fit">
				<DialogHeader>
					<DialogTitle>Subir documento</DialogTitle>
					<DialogDescription>
						Sube el documento {documentType?.name} para la carpeta{" "}
						<span className="font-semibold">{folderId}</span>.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div
							className={cn(
								"border-muted-foreground/25 hover:bg-accent flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center transition-colors",
								{
									"border-primary bg-primary/5": dragActive,
									"cursor-not-allowed opacity-50 hover:bg-transparent": false,
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
								onChange={(e) => addFiles(e.target.files?.[0] || null)}
								disabled={false}
							/>

							<label
								htmlFor="file-upload"
								className={cn("flex cursor-pointer flex-col items-center gap-2", {
									"cursor-not-allowed": false,
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
											: "Sube un archivo"}
									</p>
								</div>
							</label>
						</div>

						{file && (
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
									{file && (
										<TableRow key={file.file?.name}>
											<TableCell>{file.documentName || file.file?.name}</TableCell>
											<TableCell>{Math.round((file.file?.size || 0) / 1024)} KB</TableCell>
											<TableCell>
												{LABOR_CONTROL_STRUCTURE.find((dt) => dt.type === file.documentType)?.name}
											</TableCell>
											<TableCell>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => removeFile()}
													className="text-red-500 hover:bg-red-500 hover:text-white"
												>
													<Trash2Icon />
												</Button>
											</TableCell>
										</TableRow>
									)}
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
								disabled={(file === null && !documentToUpdate) || isSubmitting}
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
