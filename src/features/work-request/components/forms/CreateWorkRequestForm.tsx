"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createWorkRequest } from "@/features/work-request/actions/create-work-request"
import { uploadFilesToCloud } from "@/lib/upload-files"
import {
	workRequestSchema,
	type WorkRequestSchema,
	LOCATION_VALUES_ARRAY,
} from "@/features/work-request/schemas/work-request.schema"

import { Form, FormItem, FormLabel, FormField, FormControl } from "@/shared/components/ui/form"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import UploadFilesFormField from "@/shared/components/forms/UploadFilesFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Separator } from "@/shared/components/ui/separator"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Button } from "@/shared/components/ui/button"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

export default function CreateWorkRequestForm({ userId }: { userId: string }): React.ReactElement {
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)
	const router = useRouter()

	const form = useForm<WorkRequestSchema>({
		resolver: zodResolver(workRequestSchema),
		defaultValues: {
			description: "",
			isUrgent: false,
			requestDate: new Date(),
			observations: "",
			location: undefined,
			customLocation: "",
			attachments: [],
		},
	})

	const watchLocation = form.watch("location")

	async function onSubmit(values: WorkRequestSchema) {
		setIsSubmitting(true)

		try {
			const attachmentsFiles = form.getValues("attachments")
			const attachments = []

			// Si hay archivos adjuntos, subir cada uno a la nube
			if (attachmentsFiles && attachmentsFiles.length > 0) {
				for (const attachment of attachmentsFiles) {
					if (attachment && attachment.file) {
						const fileExtension = attachment.file.name.split(".").pop()
						const uniqueFilename = `${Date.now()}-${Math.random()
							.toString(36)
							.substring(2, 9)}-request.${fileExtension}`

						// Crear un objeto File con el archivo del formulario
						const uploadResult = await uploadFilesToCloud({
							randomString: uniqueFilename,
							containerType: "files",
							files: [attachment],
						})

						if (uploadResult) {
							attachments.push(uploadResult)
						}
					}
				}
			}

			// Crear la solicitud de trabajo
			const result = await createWorkRequest({
				values,
				userId,
				attachments: attachments.length > 0 ? attachments.flat() : undefined,
			})

			if (result.error) {
				toast.error("Error", {
					description: result.error,
				})
			} else {
				toast.success("Éxito", {
					description: "Solicitud de trabajo creada exitosamente",
				})

				// Cerrar el formulario y recargar la página
				setOpen(false)
				form.reset()
				router.refresh()
			}
		} catch (error) {
			console.error("Error al crear la solicitud de trabajo:", error)
			toast.error("Error", {
				description: "Error al crear la solicitud de trabajo",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button className="flex gap-2 bg-white font-semibold tracking-wide text-cyan-500 transition-all hover:scale-105 hover:bg-white hover:text-cyan-600">
					<PlusCircleIcon size={20} />
					<span>Nueva Solicitud</span>
				</Button>
			</SheetTrigger>
			<SheetContent className="w-full overflow-y-auto sm:max-w-xl md:max-w-2xl">
				<SheetHeader className="mb-5">
					<SheetTitle className="text-2xl">Nueva Solicitud de Trabajo</SheetTitle>
					<SheetDescription>
						Completa el formulario para crear una nueva solicitud de trabajo.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<TextAreaFormField<WorkRequestSchema>
								name="description"
								control={form.control}
								label="Descripción del trabajo"
								placeholder="Describe el trabajo solicitado"
								className="sm:col-span-2"
							/>

							<DatePickerFormField<WorkRequestSchema>
								name="requestDate"
								label="Fecha de solicitud"
								control={form.control}
							/>

							<SelectFormField<WorkRequestSchema>
								name="location"
								label="Ubicación"
								control={form.control}
								placeholder="Selecciona la ubicación"
								options={LOCATION_VALUES_ARRAY.map((value) => ({
									value,
									label:
										value === "TRM"
											? "Terminal (TRM)"
											: value === "PRS"
												? "Planta (PRS)"
												: "Otra ubicación",
								}))}
							/>

							{watchLocation === "OTHER" && (
								<InputFormField<WorkRequestSchema>
									name="customLocation"
									label="Ubicación personalizada"
									control={form.control}
									placeholder="Especifica la ubicación"
								/>
							)}

							<FormField
								control={form.control}
								name="isUrgent"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center space-y-0 space-x-3 rounded-md border p-4">
										<FormControl>
											<Checkbox checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel className="cursor-pointer">Marcar como urgente</FormLabel>
										</div>
									</FormItem>
								)}
							/>

							<TextAreaFormField<WorkRequestSchema>
								name="observations"
								control={form.control}
								label="Observaciones"
								placeholder="Agrega observaciones adicionales"
								className="sm:col-span-2"
							/>

							<Separator className="my-2 sm:col-span-2" />

							<div className="sm:col-span-2">
								<h2 className="text-xl font-bold">Imágenes o archivos adjuntos</h2>
								<span className="text-muted-foreground text-sm">
									Adjunta imágenes o archivos relacionados con la solicitud.
								</span>
							</div>

							<UploadFilesFormField
								name="attachments"
								maxFileSize={200}
								isMultiple={true}
								control={form.control}
								selectedFileIndex={selectedFileIndex}
								containerClassName="w-full sm:col-span-2"
								setSelectedFileIndex={setSelectedFileIndex}
							/>

							<Button
								size="lg"
								type="button"
								variant={"outline"}
								disabled={isSubmitting}
								onClick={() => setOpen(false)}
								className="w-full cursor-pointer border-2 border-orange-800 font-bold tracking-wide text-orange-800 transition-all hover:scale-105 hover:bg-orange-800 hover:text-white"
							>
								Cancelar
							</Button>

							<SubmitButton
								label="Crear Solicitud"
								isSubmitting={isSubmitting}
								className="bg-orange-600 hover:bg-orange-700"
							/>
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
