"use client"

import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer"
import { CalendarIcon, UploadCloud, X } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

import { safetyTalkSchema, type SafetyTalkSchema } from "@/lib/form-schemas/safety-talk/safety-talk"
import { createSafetyTalk } from "@/actions/safety-talks/create-safety-talks"
import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
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
import { generateSlug } from "@/lib/generateSlug"

export default function CreateSafetyTalkForm(): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const [currentPreview, setCurrentPreview] = useState<number>(0)

	const router = useRouter()

	const form = useForm<SafetyTalkSchema>({
		resolver: zodResolver(safetyTalkSchema),
		defaultValues: {
			title: "",
			timeLimit: 0,
			questions: [],
			resources: [],
			description: "",
			minimumScore: 70,
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
				title: file.name,
				type,
				url: "", // Se llenará después de subir el archivo
				file,
				preview,
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
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Título</FormLabel>
									<FormControl>
										<Input className="w-full rounded-md text-sm" placeholder="Título" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid w-full gap-x-3 gap-y-5 md:grid-cols-2">
							<FormField
								control={form.control}
								name="timeLimit"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tiempo Límite</FormLabel>
										<FormControl>
											<div className="flex items-center gap-x-0.5">
												<Input
													type="number"
													className="w-full rounded-md text-sm"
													placeholder="Tiempo Límite"
													{...field}
												/>

												<Button
													disabled
													size={"icon"}
													type="button"
													variant={"outline"}
													className="disabled:bg-transparent disabled:opacity-100"
												>
													min
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="minimumScore"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Porcentaje Mínimo</FormLabel>
										<FormControl>
											<div className="flex items-center gap-x-0.5">
												<Input
													type="number"
													className="w-full rounded-md text-sm"
													placeholder="Porcentaje Mínimo"
													{...field}
												/>
												<Button
													disabled
													size={"icon"}
													type="button"
													variant={"outline"}
													className="disabled:bg-transparent disabled:opacity-100"
												>
													%
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="md:col-span-2">
									<FormLabel>Descripción</FormLabel>
									<FormControl>
										<Textarea
											className="min-h-32 w-full rounded-md text-sm"
											placeholder="Descripción"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="expiresAt"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Fecha de Expiración</FormLabel>
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
												locale={es}
												initialFocus
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isPresential"
							render={({ field }) => (
								<FormItem>
									<FormLabel>¿Es presencial?</FormLabel>
									<FormControl>
										<Switch checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
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

								<div className="relative h-96 w-full overflow-hidden rounded-lg border bg-white">
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

				<Button size={"lg"} type="submit" disabled={isSubmitting} className="mt-4 w-full">
					{isSubmitting ? (
						<div role="status" className="flex items-center justify-center">
							<svg
								aria-hidden="true"
								className="fill-primary h-8 w-8 animate-spin text-gray-200 dark:text-gray-600"
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
						"Crear charla"
					)}
				</Button>
			</form>
		</Form>
	)
}
