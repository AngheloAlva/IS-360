"use client"

import { CalendarIcon, UploadCloud, X } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { otcInspectionsSchema } from "@/lib/form-schemas/work-book/otc-inspections.schema"
import { createOtcInspections } from "@/actions/work-book-entries/createOtcInspections"
import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
} from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"

export default function OtcInspectorForm({
	userId,
	workOrderId,
}: {
	userId: string
	workOrderId: string
}): React.ReactElement {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [filePreview, setFilePreview] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<z.infer<typeof otcInspectionsSchema>>({
		resolver: zodResolver(otcInspectionsSchema),
		defaultValues: {
			workOrderId,
			nonConformities: "",
			activityEndTime: "",
			activityStartTime: "",
			safetyObservations: "",
			supervisionComments: "",
			executionDate: new Date(),
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
			setFilePreview(null)
		}
	}

	async function onSubmit(values: z.infer<typeof otcInspectionsSchema>) {
		setLoading(true)

		try {
			if (selectedFile) {
				const fileExtension = selectedFile.name.split(".").pop()
				const uniqueFilename = `${Date.now()}-${Math.random()
					.toString(36)
					.substring(2, 9)}-${workOrderId.slice(0, 4)}.${fileExtension}`

				const response = await fetch("/api/file", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						filenames: [uniqueFilename],
						containerType: "files",
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

				const { ok, message } = await createOtcInspections({
					values,
					userId,
					attachment: {
						fileUrl: blobUrl,
						fileType: selectedFile.type,
						name: "Inspeccion-" + selectedFile.name,
					},
				})

				if (!ok) throw new Error(message)
			} else {
				const { ok, message } = await createOtcInspections({
					values,
					userId,
				})

				if (!ok) throw new Error(message)
			}

			toast.success("Inspección creada correctamente")
			router.push(`/admin/dashboard/libros-de-obras/${workOrderId}`)
		} catch (error) {
			console.error(error)
			toast.error("Error al crear inspección", {
				description: error instanceof Error ? error.message : "Intente nuevamente",
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="mx-auto flex w-full max-w-screen-xl flex-col gap-5"
			>
				<Card>
					<CardContent className="grid gap-5 pb-10 md:grid-cols-2">
						<FormField
							control={form.control}
							name="executionDate"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Fecha de Ejecución</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={"outline"}
													className={cn(
														"w-full rounded-md border-gray-200 bg-white pl-3 text-left text-sm font-normal text-gray-700",
														!field.value && "text-muted-foreground"
													)}
												>
													{field.value ? (
														format(field.value, "PPP", { locale: es })
													) : (
														<span>Selecciona la fecha</span>
													)}
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
												disabled={(date) => date < new Date("1900-01-01")}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid gap-3 md:grid-cols-2">
							<FormField
								control={form.control}
								name="activityStartTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-gray-700">Hora de Inicio</FormLabel>
										<FormControl>
											<Input
												className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
												placeholder="Hora de Inicio"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="activityEndTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-gray-700">Hora de Fin</FormLabel>
										<FormControl>
											<Input
												className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
												placeholder="Hora de Fin"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="nonConformities"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-gray-700">No Conformidades</FormLabel>
									<FormControl>
										<Textarea
											className="min-h-32 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
											placeholder="No Conformidades"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="supervisionComments"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-gray-700">Comentarios de Supervisión</FormLabel>
									<FormControl>
										<Textarea
											className="min-h-32 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
											placeholder="Comentarios"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="safetyObservations"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-gray-700">Observaciones de Seguridad</FormLabel>
									<FormControl>
										<Textarea
											className="min-h-32 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
											placeholder="Observaciones"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid gap-4 md:col-span-2 md:grid-cols-2">
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
					</CardContent>
				</Card>

				<Button className="mt-4 md:col-span-2" type="submit" size={"lg"} disabled={loading}>
					{loading ? (
						<div role="status" className="flex items-center justify-center">
							<svg
								aria-hidden="true"
								className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
								viewBox="0 0 100 101"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
									fill="currentColor"
								/>
								<path
									d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
									fill="currentFill"
								/>
							</svg>
							<span className="sr-only">Cargando...</span>
						</div>
					) : (
						"Crear registro"
					)}
				</Button>
			</form>
		</Form>
	)
}
