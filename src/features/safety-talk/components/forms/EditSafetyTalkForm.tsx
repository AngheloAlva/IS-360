"use client"

import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UploadCloud, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { updateSafetyTalk } from "@/features/safety-talk/actions/update-safety-talk"
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

import type { QUESTION_TYPE, RESOURCE_TYPE } from "@prisma/client"

interface EditSafetyTalkFormProps {
	safetyTalk: {
		id: string
		title: string
		slug: string
		description: string | null
		isPresential: boolean
		expiresAt: Date
		timeLimit: number | null
		minimumScore: number
		questions: Array<{
			id: string
			type: string
			question: string
			imageUrl: string | null
			description: string | null
			options: Array<{
				id: string
				text: string
				isCorrect: boolean
				zoneLabel: string | null
				zoneId: string | null
				order: number
			}>
		}>
		resources: Array<{
			id: string
			title: string
			type: string
			url: string
			fileSize: number
			mimeType: string
		}>
	}
}

export default function EditSafetyTalkForm({
	safetyTalk,
}: EditSafetyTalkFormProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const [currentPreview, setCurrentPreview] = useState<number>(0)

	const router = useRouter()

	// Preparar los datos iniciales para el formulario
	const defaultValues: SafetyTalkSchema = {
		title: safetyTalk.title,
		description: safetyTalk.description || "",
		isPresential: safetyTalk.isPresential,
		timeLimit: safetyTalk.timeLimit?.toString() || "",
		minimumScore: safetyTalk.minimumScore.toString(),
		expiresAt: new Date(safetyTalk.expiresAt),
		questions: safetyTalk.questions.map((q) => ({
			id: q.id,
			type: q.type as QUESTION_TYPE,
			question: q.question,
			imageUrl: q.imageUrl || undefined,
			description: q.description || undefined,
			options: q.options.map((o) => ({
				id: o.id,
				text: o.text,
				isCorrect: o.isCorrect,
				zoneLabel: o.zoneLabel || undefined,
				zoneId: o.zoneId || undefined,
				order: o.order.toString(),
			})),
		})),
		resources: safetyTalk.resources.map((r) => ({
			title: r.title,
			type: r.type as RESOURCE_TYPE,
			url: r.url,
			fileSize: r.fileSize,
			mimeType: r.mimeType,
			preview: r.url,
		})),
	}

	const form = useForm<SafetyTalkSchema>({
		resolver: zodResolver(safetyTalkSchema),
		defaultValues,
	})

	const {
		fields: resourceFields,
		append: appendResource,
		remove: removeResource,
	} = useFieldArray({
		control: form.control,
		name: "resources",
	})

	// Ajustar el índice de previsualización si se eliminan recursos
	useEffect(() => {
		if (currentPreview >= resourceFields.length && resourceFields.length > 0) {
			setCurrentPreview(resourceFields.length - 1)
		}
	}, [resourceFields.length, currentPreview])

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

			const { ok, message } = await updateSafetyTalk({
				id: safetyTalk.id,
				data: values,
				slug,
			})

			if (ok) {
				toast("Charla de seguridad actualizada exitosamente", {
					description: "La charla de seguridad ha sido actualizada exitosamente",
					duration: 3000,
				})

				router.push("/admin/dashboard/charlas-de-seguridad")
			} else {
				toast("Error al actualizar la charla de seguridad", {
					description: message,
					duration: 5000,
				})
			}
		} catch (error) {
			console.error(error)
			toast("Error al actualizar la charla de seguridad", {
				description: "Ocurrió un error al intentar actualizar la charla de seguridad",
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

						<div className="flex flex-col gap-y-2">
							<SwitchFormField<SafetyTalkSchema>
								name="isPresential"
								label="¿Es presencial?"
								description="Marca esta opción si la charla debe realizarse presencialmente"
								control={form.control}
							/>
						</div>

						<InputFormField<SafetyTalkSchema>
							name="timeLimit"
							label="Tiempo límite (minutos)"
							description="Tiempo máximo para completar la charla (0 = sin límite)"
							control={form.control}
						/>

						<InputFormField<SafetyTalkSchema>
							name="minimumScore"
							label="Puntaje mínimo (%)"
							description="Puntaje mínimo para aprobar la charla"
							control={form.control}
						/>

						<DatePickerFormField<SafetyTalkSchema>
							name="expiresAt"
							label="Fecha de expiración"
							description="Fecha en que expira la validez de la charla"
							control={form.control}
						/>

						<TextAreaFormField<SafetyTalkSchema>
							name="description"
							label="Descripción"
							description="Describe brevemente el contenido de la charla"
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

				<SubmitButton
					label="Actualizar charla"
					isSubmitting={isSubmitting}
					className="mt-4 w-full"
				/>
			</form>
		</Form>
	)
}
