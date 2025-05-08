"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { useQueryClient } from "@tanstack/react-query"
import type {
	CompanyDocumentType,
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
} from "@prisma/client"

interface UploadStartupFolderDocumentFormProps {
	type: "company" | "worker" | "vehicle" | "procedure" | "environmental"
	folderId: string
	documentName: string
	documentType:
		| CompanyDocumentType
		| WorkerDocumentType
		| VehicleDocumentType
		| EnvironmentalDocType
		| string
	documentId?: string
	currentUrl?: string
	isUpdate: boolean
}

export function UploadStartupFolderDocumentForm({
	type,
	folderId,
	documentName,
	documentType,
	documentId,
	currentUrl,
	isUpdate,
}: UploadStartupFolderDocumentFormProps) {
	const [open, setOpen] = useState(false)
	const [file, setFile] = useState<File | null>(null)
	const [isUploading, setIsUploading] = useState(false)
	const queryClient = useQueryClient()

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!file) {
			toast.error("Por favor selecciona un archivo")
			return
		}

		setIsUploading(true)

		try {
			// 1. Subir el archivo a Azure con el contenedor 'startup'
			const uploadResults = await uploadFilesToCloud({
				randomString: folderId,
				containerType: "startup",
				secondaryName: documentName,
				files: [{
					file,
					url: '',
					preview: '',
					type: file.type,
					title: file.name,
					fileSize: file.size,
					mimeType: file.type
				}]
			})
			
			if (!uploadResults || uploadResults.length === 0) {
				throw new Error("Error al subir el archivo")
			}
			
			const uploadedFile = uploadResults[0]

			// 2. Guardar el documento en la base de datos
			const endpoint = `/api/startup-folders/documents/${type}`
			const method = isUpdate ? "PUT" : "POST"
			const body = isUpdate
				? {
						documentId,
						url: uploadedFile.url,
					}
				: {
						folderId,
						name: documentName,
						type: documentType,
						url: uploadedFile.url,
					}

			const response = await fetch(endpoint, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			})

			if (!response.ok) {
				throw new Error(`Error al ${isUpdate ? "actualizar" : "guardar"} el documento`)
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
			setFile(null)
		} catch (error) {
			console.error(error)
			toast.error("Ocurrió un error al procesar el documento")
		} finally {
			setIsUploading(false)
		}
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.files && e.target.files.length > 0) {
			setFile(e.target.files[0])
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button size="sm" variant={isUpdate ? "outline" : "default"}>
					<Upload className="mr-1 h-4 w-4" />
					{isUpdate ? "Actualizar" : "Subir"}
				</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>{isUpdate ? "Actualizar documento" : "Subir documento"}</SheetTitle>
					<SheetDescription>
						{isUpdate
							? "Sube una nueva versión del documento"
							: "Sube el documento requerido para la carpeta de arranque"}
					</SheetDescription>
				</SheetHeader>
				<form onSubmit={onSubmit} className="space-y-4 pt-4">
					<div className="space-y-2">
						<Label htmlFor="document-name">Nombre del documento</Label>
						<Input id="document-name" value={documentName} disabled />
					</div>

					<div className="space-y-2">
						<Label htmlFor="document-file">Archivo</Label>
						<Input
							id="document-file"
							type="file"
							onChange={handleFileChange}
							accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
						/>
						<p className="text-muted-foreground text-xs">
							Formatos aceptados: PDF, Word, Excel, JPG, PNG
						</p>
					</div>

					{file && (
						<div className="bg-muted rounded-md p-3">
							<p className="text-sm font-medium">Archivo seleccionado:</p>
							<p className="text-sm">{file.name}</p>
							<p className="text-muted-foreground text-xs">
								{(file.size / 1024 / 1024).toFixed(2)} MB
							</p>
						</div>
					)}

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

					<div className="flex justify-end space-x-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isUploading}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={!file || isUploading}>
							{isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isUploading ? "Subiendo..." : isUpdate ? "Actualizar" : "Subir"}
						</Button>
					</div>
				</form>
			</SheetContent>
		</Sheet>
	)
}
