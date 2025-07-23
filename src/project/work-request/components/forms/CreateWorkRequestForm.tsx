"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createWorkRequest } from "@/project/work-request/actions/create-work-request"
import { useEquipments } from "@/project/equipment/hooks/use-equipments"
import { uploadFilesToCloud, UploadResult } from "@/lib/upload-files"
import {
	workRequestSchema,
	type WorkRequestSchema,
} from "@/project/work-request/schemas/work-request.schema"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Separator } from "@/shared/components/ui/separator"
import FileTable from "@/shared/components/forms/FileTable"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { useOperators } from "@/shared/hooks/use-operators"

export default function CreateWorkRequestForm({ userId }: { userId: string }): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)
	const router = useRouter()

	const form = useForm<WorkRequestSchema>({
		resolver: zodResolver(workRequestSchema),
		defaultValues: {
			equipments: "",
			isUrgent: false,
			description: "",
			attachments: [],
			observations: "",
			operatorId: undefined,
			requestDate: new Date(),
		},
	})

	const { data: equipmentsData } = useEquipments({
		limit: 10000,
		showAll: true,
		order: "asc",
		orderBy: "name",
	})

	const { data: operatorsData } = useOperators({
		limit: 100,
		page: 1,
	})

	async function onSubmit(values: WorkRequestSchema) {
		setIsSubmitting(true)

		try {
			const attachmentsFiles = form.getValues("attachments")
			let uploadResults: UploadResult[] = []

			if (attachmentsFiles && attachmentsFiles.length > 0) {
				uploadResults = await uploadFilesToCloud({
					files: attachmentsFiles,
					containerType: "files",
					randomString: values.requestDate.toISOString(),
				})
			}

			const result = await createWorkRequest({
				values: {
					...values,
					attachments: [],
				},
				userId,
				attachments: uploadResults.length > 0 ? uploadResults : undefined,
			})

			if (result.error) {
				toast.error("Error", {
					description: result.error,
				})
			} else {
				toast.success("Éxito", {
					description: "Solicitud de trabajo creada exitosamente",
				})

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
				<Button
					size={"lg"}
					className="flex gap-2 bg-white font-semibold tracking-wide text-cyan-500 transition-all hover:scale-105 hover:bg-white hover:text-cyan-600"
				>
					<PlusCircleIcon size={20} />
					<span>Nueva Solicitud</span>
				</Button>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-2xl">
				<SheetHeader className="shadow">
					<SheetTitle className="text-2xl">Nueva Solicitud de Trabajo</SheetTitle>
					<SheetDescription>
						Completa el formulario para crear una nueva solicitud de trabajo.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-x-2 gap-y-5 overflow-y-auto px-4 pt-4 pb-14 sm:grid-cols-2"
					>
						<TextAreaFormField<WorkRequestSchema>
							className="h-32"
							name="description"
							control={form.control}
							itemClassName="sm:col-span-2"
							label="Descripción del trabajo"
							placeholder="Describe el trabajo solicitado"
						/>

						<DatePickerFormField<WorkRequestSchema>
							name="requestDate"
							control={form.control}
							label="Fecha de solicitud"
							itemClassName="sm:col-span-2"
						/>

						<SelectWithSearchFormField<WorkRequestSchema>
							name="equipments"
							control={form.control}
							label="Equipo / Ubicación"
							itemClassName="sm:col-span-2"
							placeholder="Selecciona el equipo o ubicación"
							options={
								equipmentsData?.equipments.map((equipment) => ({
									value: equipment.id,
									label: equipment.name + " *(" + equipment.location + ")",
								})) || []
							}
						/>

						<TextAreaFormField<WorkRequestSchema>
							name="observations"
							control={form.control}
							label="Observaciones"
							itemClassName="sm:col-span-2"
							placeholder="Agrega observaciones adicionales"
						/>

						{userId !== process.env.NEXT_PUBLIC_OPERATOR_ACCOUNT && (
							<SelectFormField<WorkRequestSchema>
								name="operatorId"
								control={form.control}
								label="Operador que Solicita"
								itemClassName="sm:col-span-2"
								placeholder="Selecciona el operador"
								options={
									operatorsData?.operators.map((operator) => ({
										value: operator.id,
										label: operator.name,
									})) || []
								}
							/>
						)}

						<SwitchFormField<WorkRequestSchema>
							name="isUrgent"
							control={form.control}
							label="Marcar como urgente"
							itemClassName="flex-row items-center sm:col-span-2 flex"
							className="data-[state=checked]:bg-cyan-500"
						/>

						<Separator className="my-2 sm:col-span-2" />

						<div className="sm:col-span-2">
							<h2 className="text-xl font-bold">Imágenes o archivos adjuntos</h2>
							<span className="text-muted-foreground text-sm">
								Adjunta imágenes o archivos relacionados con la solicitud.
							</span>
						</div>

						<FileTable<WorkRequestSchema>
							isMultiple={true}
							name="attachments"
							control={form.control}
							label="Archivos adjuntos"
							className="mt-2 mb-10 sm:col-span-2"
						/>

						<Button
							size="lg"
							type="button"
							variant={"outline"}
							disabled={isSubmitting}
							onClick={() => setOpen(false)}
						>
							Cancelar
						</Button>

						<SubmitButton
							label="Crear Solicitud"
							isSubmitting={isSubmitting}
							className="bg-cyan-500 hover:bg-cyan-600 hover:text-white"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
