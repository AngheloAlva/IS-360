"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, UploadCloud, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

import { uploadFile } from "@/actions/document-management/uploadFile"
import { CodesValuesArray } from "@/lib/consts/codes"
import { cn } from "@/lib/utils"
import {
	fileFormSchema,
	type FileFormSchema,
} from "@/lib/form-schemas/document-management/file.schema"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormMessage,
	FormControl,
} from "@/components/ui/form"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger,
} from "@/components/ui/select"
import { Areas } from "@/lib/consts/areas"

interface NewFileFormProps {
	area: string
	userId: string
	backPath?: string
	folderSlug?: string
}

export function NewFileForm({ userId, folderSlug, area, backPath }: NewFileFormProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [filePreview, setFilePreview] = useState<string | null>(null)
	const [uploading, setUploading] = useState(false)

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

		// Validación de tamaño (10MB)
		if (file.size > 10_000_000) {
			toast.error("Archivo demasiado grande", {
				description: "El tamaño máximo permitido es 10MB",
			})
			return
		}

		// Validación de tipo
		const validTypes = /\.(pdf|docx?|xlsx?|pptx?|txt|jpe?g|png|webp|avif|zip|rar|7z)$/i
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
			setFilePreview(null)
		}
	}

	const onSubmit = async (values: FileFormSchema) => {
		if (!selectedFile) return

		setUploading(true)

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
			setUploading(false)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto w-full max-w-screen-md">
				<Card className="w-full">
					<CardContent className="grid gap-5">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nombre del documento</FormLabel>
									<FormControl>
										<Input
											placeholder="Ej: Informe Técnico 2023"
											className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Descripción
										<span className="text-muted-foreground ml-1 text-xs">(opcional)</span>
									</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Agregue detalles adicionales..."
											className="min-h-[100px] w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="code"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Código de clasificación</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger className="border-gray-200">
												<SelectValue placeholder="Seleccione un código" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{CodesValuesArray.map((code) => (
												<SelectItem key={code} value={code}>
													<span className="font-mono">{code}</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

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
							<FormField
								control={form.control}
								name="registrationDate"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Fecha de Registro</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"border-input w-full justify-start bg-white text-left font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														<CalendarIcon className="mr-2 h-4 w-4" />
														{field.value ? (
															format(field.value, "PPP", { locale: es })
														) : (
															<span>Seleccionar fecha</span>
														)}
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													initialFocus
													locale={es}
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="expirationDate"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>
											Fecha de Expiración
											<span className="text-muted-foreground ml-1 text-xs">(opcional)</span>
										</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"border-input w-full justify-start bg-white text-left font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														<CalendarIcon className="mr-2 h-4 w-4" />
														{field.value ? (
															format(field.value, "PPP", { locale: es })
														) : (
															<span>Seleccionar fecha</span>
														)}
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													initialFocus
													locale={es}
													disabled={(date) => date < (form.watch("registrationDate") || new Date())}
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
				</Card>

				<Button
					size="lg"
					type="submit"
					className="mt-4 w-full"
					disabled={uploading || !selectedFile}
				>
					{uploading ? (
						<>
							<span className="animate-pulse">Subiendo...</span>
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
						</>
					) : (
						"Subir Documento"
					)}
				</Button>
			</form>
		</Form>
	)
}
