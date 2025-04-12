"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { UploadCloud, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { createOtcInspections } from "@/actions/work-book-entries/createOtcInspections"
import { cn } from "@/lib/utils"
import {
	OtcInspectionSchema,
	otcInspectionsSchema,
} from "@/lib/form-schemas/work-book/otc-inspections.schema"

import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormLabel } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
						<DatePickerFormField<OtcInspectionSchema>
							name="executionDate"
							control={form.control}
							label="Fecha de Ejecución"
						/>

						<div className="grid gap-3 md:grid-cols-2">
							<InputFormField<OtcInspectionSchema>
								name="activityStartTime"
								control={form.control}
								label="Hora de Inicio"
							/>

							<InputFormField<OtcInspectionSchema>
								name="activityEndTime"
								control={form.control}
								label="Hora de Fin"
							/>
						</div>

						<TextAreaFormField<OtcInspectionSchema>
							name="nonConformities"
							control={form.control}
							label="No Conformidades"
						/>

						<TextAreaFormField<OtcInspectionSchema>
							control={form.control}
							name="supervisionComments"
							label="Comentarios de Supervisión"
						/>

						<TextAreaFormField<OtcInspectionSchema>
							control={form.control}
							name="safetyObservations"
							label="Observaciones de Seguridad"
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

				<SubmitButton isSubmitting={loading} label="Crear Inspección" />
			</form>
		</Form>
	)
}
