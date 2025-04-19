"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { UploadCloud, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { updateFile } from "@/actions/document-management/updateFile"
import { CodeOptions, CodesValues } from "@/lib/consts/codes"
import { cn } from "@/lib/utils"
import {
	fileFormSchema,
	type FileFormSchema,
} from "@/lib/form-schemas/document-management/file.schema"

import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import type { File as PrismaFile } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormLabel } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SubmitButton from "../shared/SubmitButton"

interface UpdateFileFormProps {
	fileId: string
	userId: string
	lastPath?: string
	initialData: PrismaFile
}

export function UpdateFileForm({ fileId, initialData, userId, lastPath }: UpdateFileFormProps) {
	const [filePreview, setFilePreview] = useState<string>(initialData.url)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [uploading, setUploading] = useState(false)

	const router = useRouter()

	const form = useForm<FileFormSchema>({
		resolver: zodResolver(fileFormSchema),
		defaultValues: {
			userId,
			name: initialData.name,
			code: initialData.code ?? undefined,
			description: initialData.description || "",
			registrationDate: initialData.registrationDate,
			expirationDate: initialData.expirationDate || undefined,
		},
	})

	const handleFileChange = (file: File | null) => {
		if (!file) return

		// Validación de tamaño (10MB)
		if (file.size > 10_000_000) {
			toast.error("Archivo demasiado grande", {
				description: "El tamaño máximo permitido es 10MB",
			})
			return
		}

		// Validación de tipo
		const validTypes = /\.(pdf|docx?|xlsx?|pptx?|txt|jpe?g|png|webp|avif)$/i
		if (!validTypes.test(file.name)) {
			toast.error("Formato no soportado")
			return
		}

		setSelectedFile(file)

		// Generar preview para imágenes
		if (file.type.startsWith("image/")) {
			const reader = new FileReader()
			reader.onload = (e) => setFilePreview(e.target?.result as string)
			reader.readAsDataURL(file)
		} else {
			setFilePreview(initialData.url)
		}
	}

	const onSubmit = async (values: FileFormSchema) => {
		setUploading(true)

		try {
			const fileExtension = selectedFile
				? selectedFile.name.split(".").pop()
				: values.name?.split(".").pop()
			const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

			if (selectedFile) {
				const response = await fetch("/api/file", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						filenames: [uniqueFilename],
						containerType: "documents",
					}),
				})
				if (!response.ok) throw new Error("Error al obtener URL de subida")

				const data = await response.json()
				if (!data.urls?.[0]) throw new Error("Respuesta inválida del servidor")

				const uploadResponse = await fetch(data.urls[0], {
					method: "PUT",
					body: selectedFile,
					headers: {
						"Content-Type": selectedFile.type,
						"x-ms-blob-type": "BlockBlob",
						"x-ms-version": "2020-04-08",
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "PUT",
						"Access-Control-Allow-Headers": "*",
					},
					mode: "cors",
					credentials: "omit",
				})

				if (!uploadResponse.ok) throw new Error("Error al subir el archivo")

				const blobUrl = data.urls[0].split("?")[0]

				const saveResult = await updateFile({
					...values,
					fileId,
					url: blobUrl,
					size: selectedFile.size,
					type: selectedFile.type,
					previousUrl: initialData.url,
					previousName: initialData.name,
				})

				if (!saveResult.ok) throw new Error(saveResult.error || "Error al guardar metadatos")

				toast.success("Documento subido correctamente")
				form.reset()
				setSelectedFile(null)
				setFilePreview(initialData.url)
				router.push(lastPath || `/dashboard/documentacion/`)
			} else {
				const saveResult = await updateFile({
					...values,
					fileId,
					url: initialData.url,
					size: initialData.size,
					type: initialData.type,
					previousUrl: initialData.url,
					previousName: initialData.name,
				})
				if (!saveResult.ok) {
					throw new Error("Error al guardar el documento en la base de datos")
				}

				toast.success("Documento actualizado correctamente", {
					duration: 3000,
				})
				router.push(lastPath || `/dashboard/documentacion/`)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al subir el documento", {
				description: "Ha ocurrido un error al subir el documento",
				duration: 5000,
			})
		} finally {
			setUploading(false)
		}
	}

	const codeIsOther = form.watch("code") === CodesValues.OTRO

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto w-full max-w-screen-md">
				<Card className="w-full">
					<CardContent className="grid gap-5">
						<InputFormField<FileFormSchema>
							name="name"
							control={form.control}
							label="Nombre del archivo"
							placeholder="Nombre del archivo"
						/>

						<TextAreaFormField<FileFormSchema>
							name="description"
							label="Descripción"
							control={form.control}
							placeholder="Descripción"
						/>

						<SelectFormField<FileFormSchema>
							name="code"
							label="Código"
							placeholder="Código"
							options={CodeOptions}
							control={form.control}
						/>

						{codeIsOther && (
							<InputFormField<FileFormSchema>
								name="otherCode"
								control={form.control}
								placeholder="Ej: OTRO"
								label="Otro código de clasificación"
							/>
						)}

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-4">
								<FormLabel>Subir documento</FormLabel>
								<div
									className={cn(
										"group relative h-full cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
										!selectedFile
											? "border-blue-200 bg-blue-50 hover:border-blue-300"
											: "border-green-200 bg-green-50"
									)}
									onDrop={(e) => {
										e.preventDefault()
										handleFileChange(e.dataTransfer.files?.[0] ?? null)
									}}
									onDragOver={(e) => e.preventDefault()}
								>
									<Input
										type="file"
										className="absolute inset-0 h-full w-full opacity-0"
										onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
										accept=".pdf, image/*, .doc, .docx, .xls, .xlsx"
									/>
									<div className="flex flex-col items-center gap-4">
										<UploadCloud className="h-12 w-12 text-gray-400" />
										<div>
											<p className="font-medium text-gray-700">
												{selectedFile ? "¡Archivo listo!" : "Arrastra tu archivo aquí"}
											</p>
											<p className="mt-2 text-sm text-gray-500">
												Formatos soportados: PDF, DOC, XLS, JPG, PNG
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<FormLabel>Previsualización</FormLabel>
								<div className="h-full rounded-lg border-2 border-dashed border-gray-200 p-4">
									{selectedFile || filePreview ? (
										<div className="flex h-full flex-col items-center justify-center">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={filePreview}
												alt="Previsualización"
												className="mb-4 max-h-40 object-contain"
											/>
											<p className="max-w-full truncate text-sm font-medium">
												{selectedFile?.name || initialData.name}
											</p>

											{selectedFile && (
												<Button
													type="button"
													variant="ghost"
													onClick={() => {
														setSelectedFile(null)
														setFilePreview(initialData.url)
													}}
													className="mt-4 flex items-center gap-1 text-red-600 hover:bg-red-100 hover:text-red-700"
												>
													<X className="h-4 w-4" />
													<span className="text-sm">Eliminar</span>
												</Button>
											)}
										</div>
									) : (
										<div className="flex h-full items-center justify-center text-gray-400">
											<p>Previsualización del documento</p>
										</div>
									)}
								</div>
							</div>
						</div>

						<Separator className="mt-8" />

						<div className="grid gap-4 md:grid-cols-2">
							<DatePickerFormField<FileFormSchema>
								name="registrationDate"
								label="Fecha de Registro"
								control={form.control}
							/>

							<DatePickerFormField<FileFormSchema>
								name="expirationDate"
								control={form.control}
								label="Fecha de Expiración"
							/>
						</div>
					</CardContent>
				</Card>

				<SubmitButton isSubmitting={uploading} label="Actualizar Documento" />
			</form>
		</Form>
	)
}
