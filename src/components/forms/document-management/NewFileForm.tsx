"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UploadCloud, X } from "lucide-react"
import { toast } from "sonner"

import { uploadMultipleFiles } from "@/actions/document-management/uploadMultipleFiles"
import { CodeOptions, CodesValues } from "@/lib/consts/codes"
import { Areas } from "@/lib/consts/areas"
import {
	fileFormSchema,
	type FileSchema,
	type FileFormSchema,
} from "@/lib/form-schemas/document-management/file.schema"

import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { FilePreview } from "@/components/ui/file-preview"
import { Card, CardContent } from "@/components/ui/card"
import { FileCard } from "@/components/ui/file-card"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

interface NewFileFormProps {
	area: string
	userId: string
	backPath?: string
	folderSlug?: string
}

export function NewFileForm({ userId, folderSlug, area, backPath }: NewFileFormProps) {
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isOneFile, setIsOneFile] = useState(true)

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

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "files",
	})

	const handleFileChange = async (files: FileList | null) => {
		if (!files) return

		const validTypes = /\.(pdf|docx?|xlsx?|pptx?|txt|jpe?g|png|webp|avif|zip|rar|7z)$/i

		// Si hay más de un archivo, desactivar campos de archivo único
		if (files.length > 1 || fields.length > 0) {
			setIsOneFile(false)
		} else {
			setIsOneFile(true)
		}

		for (const file of Array.from(files)) {
			if (!validTypes.test(file.name)) {
				toast.error(`Formato no soportado: ${file.name}`, {
					description:
						"Solo se permiten archivos PDF, Word, Excel, PowerPoint, Texto, Imágenes y Archivos comprimidos",
				})
				continue
			}

			const preview = URL.createObjectURL(file)

			append({
				file,
				url: "",
				preview,
				type: file.type,
				title: file.name,
				fileSize: file.size,
				mimeType: file.type,
			} as FileSchema)
		}
	}

	const onSubmit = async (values: FileFormSchema) => {
		if (fields.length === 0) {
			toast.error("Por favor, sube al menos un archivo")
			return
		}

		setIsSubmitting(true)

		try {
			// Obtener el SAS token y la información del contenedor
			const sasResponse = await fetch("/api/file", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					filenames: fields.map((field) => {
						const fileExtension = field.file.name.split(".").pop()
						return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${userId.slice(0, 4)}.${fileExtension}`
					}),
					containerType: "documents",
				}),
			})

			if (!sasResponse.ok) {
				throw new Error("Error al obtener URLs de subida")
			}

			const { urls } = await sasResponse.json()
			if (!urls || urls.length !== fields.length) {
				throw new Error("Error con las URLs de subida")
			}

			// Subir archivos a Azure Blob Storage
			const uploadPromises = fields.map(async (fileData, index) => {
				const uploadUrl = urls[index]
				const blobUrl = uploadUrl.split("?")[0] // URL base sin SAS token

				const uploadResponse = await fetch(uploadUrl, {
					method: "PUT",
					body: fileData.file,
					headers: {
						"Content-Type": fileData.file.type,
						"x-ms-blob-type": "BlockBlob",
					},
				})

				if (!uploadResponse.ok) {
					throw new Error(`Error al subir archivo: ${fileData.file.name}`)
				}

				return {
					url: blobUrl,
					size: fileData.file.size,
					type: fileData.file.type,
					name: values.name || fileData.file.name,
				}
			})

			const uploadResults = await Promise.all(uploadPromises)

			// Crear registros en la base de datos usando el server action
			const dbResponse = await uploadMultipleFiles({
				values: {
					...values,
					files: undefined,
				},
				files: uploadResults,
			})

			if (!dbResponse.ok) {
				throw new Error(dbResponse.error || "Error al guardar en la base de datos")
			}

			toast.success("Archivos subidos correctamente")
			router.push(backPath || `/dashboard/documentacion/${area}`)
		} catch (error) {
			console.error(error)
			toast.error(error instanceof Error ? error.message : "Error al subir los archivos")
		} finally {
			setIsSubmitting(false)
		}
	}

	useEffect(() => {
		if (form.getValues("files").length > 1) {
			form.setValue("name", "")
			form.setValue("description", "")
			setIsOneFile(false)
		} else {
			setIsOneFile(true)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("files")])

	const codeIsOther = form.watch("code") === CodesValues.OTRO

	return (
		<div className="flex w-full flex-col gap-4 lg:flex-row xl:gap-6">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex w-full flex-col gap-4 xl:gap-6"
				>
					<Card className="w-full">
						<CardContent className="grid gap-5">
							<div className="grid gap-4">
								<div className="col-span-full">
									<h3 className="text-lg font-semibold">Archivos</h3>
									<p className="text-muted-foreground text-sm">
										Puedes subir uno o más archivos, en el caso de subir más de uno, se aplicara el
										codigo de ISO y fechas a todos los archivos.
									</p>

									<div className="mt-4 grid gap-4">
										<div className="flex w-full items-center justify-center">
											<label
												htmlFor="dropzone-file"
												className="dark:hover:bg-bray-800 flex h-96 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
											>
												<div className="flex flex-col items-center justify-center pt-5 pb-6">
													<UploadCloud className="mb-3 h-10 w-10 text-gray-400" />
													<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
														<span className="font-semibold">Click para subir</span> o arrastra y
														suelta
													</p>
													<p className="text-xs text-gray-500 dark:text-gray-400">
														PDF, DOCX, PPTX (MAX. 10MB)
													</p>
												</div>
												<input
													multiple
													type="file"
													className="hidden"
													id="dropzone-file"
													onChange={(e) => handleFileChange(e.target.files)}
													accept=".pdf, .docx, .pptx, .zip, .rar, .7z, .png, .jpg, .jpeg, .gif, .webp, .avif"
												/>
											</label>
										</div>

										{fields.length > 0 && (
											<h3 className="mt-4 text-lg font-semibold">Archivos Seleccionados</h3>
										)}
										<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
											{fields.map((field, index) => (
												<div key={field.id} className="group relative">
													<FileCard
														file={field}
														isSelected={selectedFileIndex === index}
														onClick={() => setSelectedFileIndex(index)}
													/>
													<Button
														size="icon"
														type="button"
														className="invisible absolute top-3 right-3 h-7 w-7 rounded-full bg-red-500/10 text-red-600 transition-colors group-hover:visible hover:bg-red-500/50"
														onClick={() => {
															remove(index)
															if (selectedFileIndex === index) {
																setSelectedFileIndex(index > 0 ? index - 1 : null)
															}
														}}
													>
														<X className="h-4 w-4" />
													</Button>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="grid gap-6">
							<h3 className="text-lg font-semibold">Información del o los Documentos</h3>

							<InputFormField<FileFormSchema>
								optional
								name="name"
								disabled={!isOneFile}
								control={form.control}
								label="Nombre del documento"
								placeholder="Ej: Informe Técnico 2023"
								description="Puedes dejarlo en blanco y el nombre del archivo será el nombre del documento."
							/>

							<TextAreaFormField<FileFormSchema>
								optional
								name="description"
								label="Descripción"
								disabled={!isOneFile}
								control={form.control}
								placeholder="Agregue detalles adicionales..."
							/>

							<SelectFormField<FileFormSchema>
								name="code"
								options={CodeOptions}
								control={form.control}
								label="Código de ISO"
								placeholder="Seleccione un código"
							/>

							{codeIsOther && (
								<InputFormField<FileFormSchema>
									name="otherCode"
									control={form.control}
									placeholder="Ej: OTRO"
									label="Otro código de ISO"
								/>
							)}

							<div className="grid gap-4 md:grid-cols-2">
								<DatePickerFormField<FileFormSchema>
									control={form.control}
									name="registrationDate"
									label="Fecha de Registro"
									description="Fecha en la que se registro el documento originalmente. NO es la fecha de registro en este sistema."
								/>

								<DatePickerFormField<FileFormSchema>
									name="expirationDate"
									control={form.control}
									label="Fecha de Expiración"
									itemClassName="h-full flex flex-col items-start"
								/>
							</div>
						</CardContent>
					</Card>

					<SubmitButton
						label="Subir Documento"
						isSubmitting={isSubmitting}
						disabled={fields.length === 0}
					/>
				</form>
			</Form>

			<FilePreview file={selectedFileIndex !== null ? fields[selectedFileIndex] : null} />
		</div>
	)
}
