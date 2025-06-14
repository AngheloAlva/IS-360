"use client"

import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UploadCloud, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { createSafetyTalk } from "@/features/safety-talk/actions/create-safety-talks"
import { generateSlug } from "@/lib/generateSlug"
import { cn } from "@/lib/utils"
import {
	safetyTalkSchema,
	type SafetyTalkSchema,
} from "@/features/safety-talk/schemas/safety-talk.schema"

import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import QuestionsSection from "./QuestionsSection"

export default function CreateSafetyTalkForm(): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const [currentPreview, setCurrentPreview] = useState<number>(0)

	const router = useRouter()

	const form = useForm<SafetyTalkSchema>({
		resolver: zodResolver(safetyTalkSchema),
		defaultValues: {
			title: "",
			questions: [],
			resources: [],
			timeLimit: "0",
			description: "",
			minimumScore: "70",
			isPresential: false,
			expiresAt: new Date(),
		},
	})

	const {
		fields: resourceFields,
		append: appendResource,
		remove: removeResource,
	} = useFieldArray({
		control: form.control,
		name: "resources",
	})

	const handleFileChange = async (files: FileList | null) => {
		if (!files) return

		const validTypes = /\.(pdf|docx?|pptx?)$/i
		const maxSize = 10_000_000 // 10MB

		for (const file of Array.from(files)) {
			// Validación de tamaño
			if (file.size > maxSize) {
				toast.error(`Archivo ${file.name} demasiado grande`, {
					description: "El tamaño máximo permitido es 10MB",
				})
				continue
			}

			// Validación de tipo
			if (!validTypes.test(file.name)) {
				toast.error(`Formato no soportado: ${file.name}`, {
					description: "Solo se permiten archivos PDF, Word y PowerPoint",
				})
				continue
			}

			// Determinar tipo de recurso
			let type: "DOCUMENT" | "PRESENTATION" = "DOCUMENT"
			if (file.name.endsWith(".pptx")) type = "PRESENTATION"

			// Generar preview del documento
			const preview = URL.createObjectURL(file)

			// Agregar recurso
			appendResource({
				type,
				file,
				url: "",
				preview,
				title: file.name,
				fileSize: file.size,
				mimeType: file.type,
			})
		}
	}

	async function onSubmit(values: SafetyTalkSchema) {
		setIsSubmitting(true)

		try {
			const slug = generateSlug(values.title)

			const { ok, message } = await createSafetyTalk({ data: values, slug })

			if (ok) {
				toast("Charla de seguridad creada exitosamente", {
					description: "La charla de seguridad ha sido creada exitosamente",
					duration: 3000,
				})

				router.push("/admin/dashboard/charlas-de-seguridad")
			} else {
				toast("Error al crear la charla de seguridad", {
					description: message,
					duration: 5000,
				})
			}
		} catch (error) {
			console.log(error)
			toast("Error al crear la charla de seguridad", {
				description: "Ocurrió un error al intentar crear la charla de seguridad",
				duration: 5000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full max-w-screen-lg gap-y-4">
				<Card className="w-full">
					<CardContent className="grid w-full gap-x-3 gap-y-5 md:grid-cols-2">
						<InputFormField<SafetyTalkSchema> name="title" label="Título" control={form.control} />

						<div className="grid w-full gap-x-3 gap-y-5 md:grid-cols-2">
							<div className="flex items-center gap-x-0.5">
								<InputFormField<SafetyTalkSchema>
									type="number"
									name="timeLimit"
									label="Tiempo Límite"
									control={form.control}
									className="rounded-r-none"
								/>

								<Button
									disabled
									size={"icon"}
									type="button"
									variant={"outline"}
									className="mt-5.5 rounded-l-none disabled:bg-transparent disabled:opacity-100"
								>
									min
								</Button>
							</div>

							<div className="flex items-center gap-x-0.5">
								<InputFormField<SafetyTalkSchema>
									type="number"
									name="minimumScore"
									control={form.control}
									label="Porcentaje Mínimo"
									className="rounded-r-none"
								/>
								<Button
									disabled
									size={"icon"}
									type="button"
									variant={"outline"}
									className="mt-5.5 rounded-l-none disabled:bg-transparent disabled:opacity-100"
								>
									%
								</Button>
							</div>
						</div>

						<TextAreaFormField<SafetyTalkSchema>
							name="description"
							label="Descripción"
							control={form.control}
							itemClassName="md:col-span-2"
						/>

						<DatePickerFormField<SafetyTalkSchema>
							name="expiresAt"
							control={form.control}
							label="Fecha de Expiración"
						/>

						<SwitchFormField<SafetyTalkSchema>
							name="isPresential"
							label="¿Es presencial?"
							control={form.control}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="grid w-full gap-x-3 gap-y-5">
						<div className="col-span-full">
							<h3 className="text-lg font-medium">Recursos</h3>
							<p className="text-muted-foreground text-sm">
								Sube los archivos que necesites para la charla
							</p>

							<div className="mt-4 grid gap-4 md:grid-cols-2">
								<div className="flex w-full items-center justify-center">
									<label
										htmlFor="dropzone-file"
										className="dark:hover:bg-bray-800 flex h-96 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
									>
										<div className="flex flex-col items-center justify-center pt-5 pb-6">
											<UploadCloud className="mb-3 h-10 w-10 text-gray-400" />
											<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
												<span className="font-semibold">Click para subir</span> o arrastra y suelta
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												PDF, DOCX, PPTX (MAX. 10MB)
											</p>
										</div>
										<input
											id="dropzone-file"
											type="file"
											className="hidden"
											multiple
											accept=".pdf, .docx, .pptx"
											onChange={(e) => handleFileChange(e.target.files)}
										/>
									</label>
								</div>

								<div className="bg-secondary-background/40 relative h-96 w-full overflow-hidden rounded-lg border">
									{resourceFields.length > 0 && (
										<div className="h-full w-full p-4">
											<div className="h-full w-full">
												{resourceFields[currentPreview]?.preview ? (
													<DocViewer
														documents={[
															{
																uri: resourceFields[currentPreview].preview,
																fileName: resourceFields[currentPreview].title,
															},
														]}
														pluginRenderers={DocViewerRenderers}
														config={{ header: { disableHeader: true } }}
														className="[&_#pdf-controls]:h-0 [&_#pdf-controls]:w-0 [&_#pdf-controls]:overflow-hidden [&_#pdf-controls]:opacity-0"
														style={{ height: "100%" }}
													/>
												) : (
													<div className="flex h-full flex-col items-center justify-center">
														<p className="text-lg font-medium">
															{resourceFields[currentPreview].title}
														</p>
														<p className="text-muted-foreground mt-1 text-sm">
															{(resourceFields[currentPreview].fileSize / 1024).toFixed(2)} KB
														</p>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Controles de navegación */}
									<div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
										{resourceFields.map((_, index) => (
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

									{resourceFields.length > 0 && (
										<Button
											type="button"
											size={"icon"}
											variant={"ghost"}
											className="hover:bg-error/10 absolute top-2 right-2 h-10 w-10 rounded-full p-1 text-red-600 transition-colors"
											onClick={() => {
												removeResource(currentPreview)
												if (currentPreview > 0) setCurrentPreview(currentPreview - 1)
											}}
										>
											<X className="h-5 w-5" />
										</Button>
									)}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<QuestionsSection control={form.control} />

				<SubmitButton label="Crear charla" isSubmitting={isSubmitting} className="mt-4 w-full" />
			</form>
		</Form>
	)
}
