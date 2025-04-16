"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UploadCloud } from "lucide-react"
import { toast } from "sonner"

import { CodeOptions, CodesValues } from "@/lib/consts/codes"
import { Areas } from "@/lib/consts/areas"
import {
	fileFormSchema,
	type FileFormSchema,
	type FileSchema,
} from "@/lib/form-schemas/document-management/file.schema"

import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Form } from "@/components/ui/form"
import { cn } from "@/lib/utils"

interface NewFileFormProps {
	area: string
	userId: string
	backPath?: string
	folderSlug?: string
}

export function NewFileForm({ userId, folderSlug, area, backPath }: NewFileFormProps) {
	// const [currentPreview, setCurrentPreview] = useState<number>(0)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isOneFile, setIsOneFile] = useState(true)

	const router = useRouter()

	const form = useForm<FileFormSchema>({
		resolver: zodResolver(fileFormSchema),
		defaultValues: {
			userId,
			name: "",
			files: [],
			folderSlug,
			description: "",
			expirationDate: undefined,
			registrationDate: new Date(),
			area: Areas[area as keyof typeof Areas].value,
		},
	})

	const { fields, append } = useFieldArray({
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
						"Solo se permiten archivos PDF, Word, Excel, PowerPoint, Texto, Imágenes, Archivos comprimidos",
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
			const formData = new FormData()

			// Agregar los archivos al FormData
			fields.forEach((fileData) => {
				formData.append("files", fileData.file)
			})

			// Agregar el resto de los datos como JSON
			formData.append(
				"data",
				JSON.stringify({
					...values,
					files: undefined, // Excluir los archivos del JSON
				})
			)

			const result = await fetch("/api/documents/upload-multiple-files", {
				method: "POST",
				body: formData,
			})

			if (!result.ok) {
				throw new Error((await result.json()).error)
			}

			toast.success("Archivos subidos correctamente")
			router.push(backPath || `/dashboard/documentacion/${area}`)
		} catch (error) {
			console.error(error)
			toast.error("Error al subir los archivos")
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
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto w-full max-w-screen-md">
				<Card className="w-full">
					<CardContent className="grid gap-5">
						<InputFormField<FileFormSchema>
							name="name"
							disabled={!isOneFile}
							control={form.control}
							label="Nombre del documento"
							placeholder="Ej: Informe Técnico 2023"
						/>

						<TextAreaFormField<FileFormSchema>
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
							<div className="col-span-full">
								<h3 className="text-lg font-medium">Archivos</h3>
								<p className="text-muted-foreground text-sm">
									Puedes subir uno o más archivos, en el caso de subir más de uno, se aplicara el
									codigo de ISO y fechas a todos los archivos.{" "}
									<strong>Podrás editarlos una vez subidos.</strong>
								</p>

								<div className="mt-4 grid gap-4">
									<div className="flex w-full items-center justify-center">
										<label
											htmlFor="dropzone-file"
											className={cn(
												"dark:hover:bg-bray-800 flex h-96 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600",
												{
													"border-feature bg-feature/10": fields.length > 0,
												}
											)}
										>
											<div className="flex flex-col items-center justify-center pt-5 pb-6">
												<UploadCloud className="mb-3 h-10 w-10 text-gray-400" />

												{fields.length > 0 ? (
													<p className="text-muted-foreground flex flex-col text-center text-lg">
														{fields.length} archivos subidos
														<span className="text-sm">
															Pronto habilitaremos la previsualización de archivos.
														</span>
													</p>
												) : (
													<>
														<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
															<span className="font-semibold">Click para subir</span> o arrastra y
															suelta
														</p>
														<p className="text-xs text-gray-500 dark:text-gray-400">
															PDF, DOCX, PPTX, XLSX, etc.
														</p>
													</>
												)}
											</div>
											<input
												multiple
												type="file"
												className="hidden"
												id="dropzone-file"
												onChange={(e) => handleFileChange(e.target.files)}
											/>
										</label>
									</div>

									{/* <div className="relative h-96 w-full overflow-hidden rounded-lg border bg-white">
										{fields.length > 0 && (
											<div className="h-full w-full p-4">
												<div className="h-full w-full">
													{fields[currentPreview] && fields[currentPreview].preview ? (
														<DocViewer
															documents={[
																{
																	uri: fields[currentPreview].preview,
																	fileName: fields[currentPreview].title,
																},
															]}
															pluginRenderers={DocViewerRenderers}
															config={{ header: { disableHeader: true } }}
															className="[&_#pdf-controls]:h-0 [&_#pdf-controls]:w-0 [&_#pdf-controls]:overflow-hidden [&_#pdf-controls]:opacity-0"
															style={{ height: "100%" }}
														/>
													) : (
														<div className="flex h-full flex-col items-center justify-center">
															<p className="text-lg font-medium">{fields[currentPreview].title}</p>
															<p className="text-muted-foreground mt-1 text-sm">
																{(fields[currentPreview].fileSize / 1024).toFixed(2)} KB
															</p>
														</div>
													)}
												</div>
											</div>
										)}

										<div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
											{fields.map((_, index) => (
												<button
													key={index}
													type="button"
													className={cn(
														"h-2 w-2 rounded-full bg-gray-300 transition-all",
														currentPreview === index && "bg-gray-800"
													)}
													onClick={() => setCurrentPreview(index)}
												/>
											))}
										</div>

										{fields.length > 0 && (
											<Button
												type="button"
												size={"icon"}
												variant={"ghost"}
												className="hover:bg-error/10 absolute top-2 right-2 h-10 w-10 rounded-full p-1 text-red-600 transition-colors"
												onClick={() => {
													remove(currentPreview)
													if (currentPreview > 0) setCurrentPreview(currentPreview - 1)
												}}
											>
												<X className="h-5 w-5" />
											</Button>
										)}
									</div> */}
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
					label="Subir Documento"
					isSubmitting={isSubmitting}
					disabled={fields.length === 0}
				/>
			</form>
		</Form>
	)
}
