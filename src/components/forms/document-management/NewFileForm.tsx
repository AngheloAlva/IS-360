"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { UploadCloud, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { uploadFile } from "@/actions/document-management/uploadFile"
import { CodeOptions, CodesValues } from "@/lib/consts/codes"
import { Areas } from "@/lib/consts/areas"
import { cn } from "@/lib/utils"
import {
	fileFormSchema,
	type FileFormSchema,
} from "@/lib/form-schemas/document-management/file.schema"

import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormLabel } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NewFileFormProps {
	area: string
	userId: string
	backPath?: string
	folderSlug?: string
}

export function NewFileForm({ userId, folderSlug, area, backPath }: NewFileFormProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [filePreview, setFilePreview] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const router = useRouter()

	const form = useForm<FileFormSchema>({
		resolver: zodResolver(fileFormSchema),
		defaultValues: {
			userId,
			name: "",
			folderSlug,
			description: "",
			expirationDate: undefined,
			registrationDate: new Date(),
			area: Areas[area as keyof typeof Areas].value,
		},
	})

	const handleFileChange = (file: File | null) => {
		if (!file) return

		const validTypes = /\.(pdf|docx?|xlsx?|pptx?|txt|jpe?g|png|webp|avif|zip|rar|7z)$/i
		if (!validTypes.test(file.name)) {
			toast.error("Formato no soportado")
			return
		}

		setSelectedFile(file)

		if (file.type.startsWith("image/")) {
			const reader = new FileReader()
			reader.onload = (e) => setFilePreview(e.target?.result as string)
			reader.readAsDataURL(file)
		} else {
			setFilePreview(null)
		}
	}

	const onSubmit = async (values: FileFormSchema) => {
		if (!selectedFile) return

		setIsSubmitting(true)

		try {
			const fileExtension = selectedFile.name.split(".").pop()
			const uniqueFilename = `${Date.now()}-${Math.random()
				.toString(36)
				.substring(2, 9)}-${userId.slice(0, 4)}.${fileExtension}`

			// Obtener URL de subida para el contenedor de documentación
			const response = await fetch("/api/file", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					filenames: [uniqueFilename],
					containerType: "documents", // Especificar que es para documentos
				}),
			})

			if (!response.ok) throw new Error("Error al obtener URL de subida")

			const data = await response.json()
			if (!data.urls?.[0]) throw new Error("Respuesta inválida del servidor")

			// Subir archivo a Azure Blob Storage
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

			// Obtener la URL base del blob (sin los parámetros SAS)
			const blobUrl = data.urls[0].split("?")[0]

			// Guardar metadatos en la base de datos
			console.log("Guardando metadatos...")
			console.log(values, blobUrl, selectedFile.size, selectedFile.type)
			const saveResult = await uploadFile(values, blobUrl, selectedFile.size, selectedFile.type)

			if (!saveResult.ok) throw new Error(saveResult.error || "Error al guardar metadatos")

			toast.success("Documento subido correctamente")
			form.reset()
			setSelectedFile(null)
			setFilePreview(null)
			router.push(backPath || `/dashboard/documentacion/${area}`)
		} catch (error) {
			console.error(error)
			toast.error("Error al subir documento", {
				description: error instanceof Error ? error.message : "Intente nuevamente",
			})
		} finally {
			setIsSubmitting(false)
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
							label="Nombre del documento"
							placeholder="Ej: Informe Técnico 2023"
						/>

						<TextAreaFormField<FileFormSchema>
							name="description"
							label="Descripción"
							control={form.control}
							placeholder="Agregue detalles adicionales..."
						/>

						<SelectFormField<FileFormSchema>
							name="code"
							options={CodeOptions}
							control={form.control}
							label="Código de clasificación"
							placeholder="Seleccione un código"
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
									{selectedFile ? (
										<div className="flex h-full flex-col items-center justify-center">
											{filePreview ? (
												<>
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img
														src={filePreview}
														alt="Previsualización"
														className="mb-4 max-h-40 object-contain"
													/>
													<p className="max-w-full truncate text-sm font-medium">
														{selectedFile.name}
													</p>
												</>
											) : (
												<>
													<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
														<span className="text-3xl">📄</span>
													</div>
													<p className="max-w-full truncate text-sm font-medium">
														{selectedFile.name}
													</p>
													<p className="mt-1 text-xs text-gray-500">
														{(selectedFile.size / 1024).toFixed(2)} KB
													</p>
												</>
											)}
											<Button
												type="button"
												variant={"ghost"}
												onClick={() => {
													setSelectedFile(null)
													setFilePreview(null)
												}}
												className="mt-4 flex items-center gap-1 text-red-600 hover:bg-red-100 hover:text-red-700"
											>
												<X className="h-4 w-4" />
												<span className="text-sm">Eliminar</span>
											</Button>
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

				<SubmitButton
					isSubmitting={isSubmitting}
					disabled={!selectedFile}
					label="Subir Documento"
				/>
			</form>
		</Form>
	)
}
