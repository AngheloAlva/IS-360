"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { useCreateGuideDocument, useUpdateGuideDocument } from "../../hooks/use-guide-documents"
import type { GuideDocument } from "../../hooks/use-guide-documents"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { fileSchema } from "@/shared/schemas/file.schema"

import FileTable from "@/shared/components/forms/FileTable"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormMessage,
	FormControl,
	FormDescription,
} from "@/shared/components/ui/form"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/shared/components/ui/select"

interface GuideDocumentFormProps {
	document?: GuideDocument
	onSuccess?: () => void
	onCancel?: () => void
}

const visibilityOptions = [
	{ value: "BASIC", label: "Solo Carpeta Básica" },
	{ value: "FULL", label: "Solo Carpeta Full" },
	{ value: "BOTH", label: "Ambas (Básica y Full)" },
]

// Schema with file upload
const formSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	visibility: z.enum(["BASIC", "FULL", "BOTH"]),
	order: z.coerce.number().int().min(0),
	files: z.array(fileSchema).optional(),
	url: z.string().optional(), // Optional because we might upload a file instead
})

type FormValues = z.infer<typeof formSchema>

export function GuideDocumentForm({ document, onSuccess, onCancel }: GuideDocumentFormProps) {
	const createMutation = useCreateGuideDocument()
	const updateMutation = useUpdateGuideDocument()
	const [isUploading, setIsUploading] = useState(false)

	const isEditing = !!document

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema as any),
		defaultValues: {
			name: document?.name ?? "",
			visibility: document?.visibility ?? "BOTH",
			order: document?.order ?? 0,
			files: [],
			url: document?.url ?? "",
		},
	})

	const onSubmit = async (data: FormValues) => {
		try {
			setIsUploading(true)

			let fileUrl = data.url || ""
			let fileType = "application/pdf"
			let fileSize: number | undefined

			// If there are files to upload
			if (data.files && data.files.length > 0) {
				const uploadResults = await uploadFilesToCloud({
					files: data.files,
					randomString: `guide-${Date.now()}`,
					containerType: "documents",
					nameStrategy: "secondary",
					secondaryName: data.name,
				})

				if (uploadResults.length > 0) {
					fileUrl = uploadResults[0].url
					fileType = uploadResults[0].type
					fileSize = uploadResults[0].size
				}
			}

			if (!fileUrl) {
				toast.error("Debes subir un archivo o ingresar una URL")
				setIsUploading(false)
				return
			}

			if (isEditing && document) {
				const result = await updateMutation.mutateAsync({
					id: document.id,
					name: data.name,
					url: fileUrl,
					type: fileType,
					size: fileSize,
					visibility: data.visibility,
					order: data.order,
				})

				if (result.ok) {
					toast.success(result.message)
					onSuccess?.()
				} else {
					toast.error(result.message)
				}
			} else {
				const result = await createMutation.mutateAsync({
					name: data.name,
					url: fileUrl,
					type: fileType,
					size: fileSize,
					visibility: data.visibility,
					order: data.order,
				})

				if (result.ok) {
					toast.success(result.message)
					form.reset()
					onSuccess?.()
				} else {
					toast.error(result.message)
				}
			}
		} catch (error) {
			console.error("Error submitting form:", error)
			toast.error("Error al procesar el formulario")
		} finally {
			setIsUploading(false)
		}
	}

	const isLoading = createMutation.isPending || updateMutation.isPending || isUploading

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nombre del documento</FormLabel>
							<FormControl>
								<Input placeholder="Ej: Manual de seguridad" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="space-y-3">
					<FormLabel>{isEditing ? "Subir nuevo archivo (opcional)" : "Archivo"}</FormLabel>
					{isEditing && document?.url && (
						<p className="text-muted-foreground text-xs">
							Archivo actual: {document.name}
							{document.size && ` (${(document.size / 1024).toFixed(1)} KB)`}
						</p>
					)}
					<FileTable<FormValues>
						name="files"
						control={form.control}
						isMultiple={false}
						maxFileSize={100}
						acceptedFileTypes={/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i}
					/>
					{isEditing && (
						<p className="text-muted-foreground text-xs">
							Si no seleccionas un nuevo archivo, se mantendrá el actual.
						</p>
					)}
				</div>

				<FormField
					control={form.control}
					name="visibility"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Visibilidad</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Selecciona la visibilidad" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{visibilityOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormDescription>
								Define para qué tipo de carpeta de arranque será visible este documento
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="order"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Orden de visualización</FormLabel>
							<FormControl>
								<Input
									type="number"
									min={0}
									{...field}
									onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
								/>
							</FormControl>
							<FormDescription>
								Los documentos se ordenan de menor a mayor (0 = primero)
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex gap-2 pt-4">
					{onCancel && (
						<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
							Cancelar
						</Button>
					)}
					<Button type="submit" disabled={isLoading} className="flex-1">
						{isLoading ? (
							<>
								<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
								{isUploading ? "Subiendo archivo..." : isEditing ? "Actualizando..." : "Creando..."}
							</>
						) : isEditing ? (
							"Actualizar documento"
						) : (
							"Crear documento"
						)}
					</Button>
				</div>
			</form>
		</Form>
	)
}
