"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, UploadCloud, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { createActivity } from "@/actions/work-book-entries/createActivity"
import { getUsersByWorkOrderId } from "@/actions/users/getUsers"
import { cn } from "@/lib/utils"
import {
	type DailyActivitySchema,
	dailyActivitySchema,
} from "@/lib/form-schemas/work-book/daily-activity.schema"

import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormLabel } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import type { ENTRY_TYPE, User } from "@prisma/client"

export default function ActivityForm({
	workOrderId,
	entryType,
	userId,
}: {
	entryType: ENTRY_TYPE
	workOrderId: string
	userId: string
}): React.ReactElement {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [filePreview, setFilePreview] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const [loadingUsers, setLoadingUsers] = useState(false)
	const [users, setUsers] = useState<User[]>([])

	const router = useRouter()

	const form = useForm<DailyActivitySchema>({
		resolver: zodResolver(dailyActivitySchema),
		defaultValues: {
			comments: "",
			progress: "",
			activityName: "",
			activityEndTime: "",
			activityStartTime: "",
			executionDate: new Date(),
			personnel: [
				{
					userId: "",
				},
				{
					userId: "",
				},
			],
			workOrderId,
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

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "personnel",
	})

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoadingUsers(true)

				const { data, ok } = await getUsersByWorkOrderId(workOrderId)

				if (!ok || !data) {
					throw new Error("Error al cargar los usuarios")
				}

				setUsers(data)
			} catch (error) {
				console.error(error)
				toast.error("Error al cargar los usuarios", {
					description: "Ocurrió un error al intentar cargar los usuarios",
					duration: 5000,
				})
			} finally {
				setLoadingUsers(false)
			}
		}

		void fetchUsers()
	}, [workOrderId])

	async function onSubmit(values: DailyActivitySchema) {
		setLoading(true)

		if (!values.personnel.length) {
			toast.error("Debe haber al menos un personal")
			return
		}

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

				const { ok, message } = await createActivity({
					values,
					userId,
					entryType,
					attachment: {
						fileUrl: blobUrl,
						fileType: selectedFile.type,
						name: values.activityName + "-" + selectedFile.name,
					},
				})

				if (!ok) throw new Error(message)
			} else {
				const { ok, message } = await createActivity({
					values,
					userId,
					entryType,
				})

				if (!ok) throw new Error(message)
			}

			toast.success("Actividad creada correctamente")
			router.push(`/admin/dashboard/libros-de-obras/${workOrderId}`)
		} catch (error) {
			console.error(error)
			toast.error("Error al crear actividad", {
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
				className="flex w-full max-w-screen-xl flex-col gap-4"
			>
				<Card className="w-full">
					<CardContent className="grid gap-4 pb-10 md:grid-cols-2">
						<InputFormField<DailyActivitySchema>
							name="activityName"
							control={form.control}
							label="Nombre de la Actividad"
							placeholder="Nombre de la Actividad"
						/>

						<div className="flex gap-2">
							<DatePickerFormField<DailyActivitySchema>
								name="executionDate"
								control={form.control}
								label="Fecha de Ejecución"
							/>

							<InputFormField<DailyActivitySchema>
								control={form.control}
								label="Hora de Inicio"
								name="activityStartTime"
							/>

							<InputFormField<DailyActivitySchema>
								name="activityEndTime"
								control={form.control}
								label="Hora de Fin"
							/>

							<InputFormField<DailyActivitySchema>
								name="progress"
								control={form.control}
								label="Progreso"
								type="number"
							/>
						</div>

						<TextAreaFormField<DailyActivitySchema>
							name="comments"
							className="h-32"
							label="Comentarios"
							control={form.control}
							itemClassName="md:col-span-2"
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

				<Card className="w-full">
					<CardContent className="grid gap-4 md:grid-cols-2">
						<div className="flex items-center justify-between gap-2 md:col-span-2">
							<h2 className="text-lg font-bold">Personal que participa en la actividad</h2>

							<Button
								type="button"
								onClick={() => append({ userId: "" })}
								className="border-primary hover:bg-primary text-primary mt-4 border bg-white hover:text-white md:col-span-2"
							>
								<Plus className="mr-1" />
								Añadir Personal
							</Button>
						</div>

						{fields.map((field, index) => (
							<div key={field.id} className="grid gap-2">
								<div className="flex items-center justify-between gap-2">
									<FormLabel className="text-base">Personal #{index + 1}</FormLabel>

									<Button
										type="button"
										size={"sm"}
										onClick={() => remove(index)}
										className="mt-2 border-red-500 bg-white text-red-500 hover:bg-red-500 hover:text-white md:col-span-2"
										variant="outline"
									>
										Eliminar #{index + 1}
									</Button>
								</div>

								{loadingUsers ? (
									<Skeleton className="h-9 w-full rounded-md" />
								) : (
									<SelectFormField<DailyActivitySchema>
										options={users.map((user) => ({
											value: user.id,
											label: user.name,
										}))}
										control={form.control}
										name={`personnel.${index}.userId`}
										placeholder="Seleccione al personal"
									/>
								)}
							</div>
						))}
					</CardContent>
				</Card>

				<SubmitButton
					isSubmitting={loading}
					className="hover:bg-primary/80"
					label="Crear actividad"
				/>
			</form>
		</Form>
	)
}
