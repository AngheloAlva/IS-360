"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { createMaintenancePlanTask } from "@/actions/maintenance-plan-task/createMaintenancePlanTask"
import { uploadFilesToCloud, type UploadResult } from "@/lib/upload-files"
import { TaskFrequencyOptions } from "@/lib/consts/task-frequency"
import { useEquipments } from "@/hooks/use-equipments"
import { queryClient } from "@/lib/queryClient"
import {
	maintenancePlanTaskSchema,
	type MaintenancePlanTaskSchema,
} from "@/lib/form-schemas/maintenance-plan/maintenance-plan-task.schema"

import { SelectWithSearchFormField } from "../shared/SelectWithSearchFormField"
import { DatePickerFormField } from "../shared/DatePickerFormField"
import UploadFilesFormField from "../shared/UploadFilesFormField"
import { TextAreaFormField } from "../shared/TextAreaFormField"
import { SelectFormField } from "../shared/SelectFormField"
import { InputFormField } from "../shared/InputFormField"
import { Form, FormLabel } from "@/components/ui/form"
import SubmitButton from "../shared/SubmitButton"
import { Button } from "@/components/ui/button"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

interface MaintenancePlanTaskFormProps {
	maintenancePlanSlug: string
	userId: string
}

export default function MaintenancePlanTaskForm({
	maintenancePlanSlug,
	userId,
}: MaintenancePlanTaskFormProps): React.ReactElement {
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<MaintenancePlanTaskSchema>({
		resolver: zodResolver(maintenancePlanTaskSchema),
		defaultValues: {
			name: "",
			attachments: [],
			description: "",
			createdById: userId,
			maintenancePlanSlug,
			nextDate: undefined,
			frequency: undefined,
			equipmentId: undefined,
		},
	})

	const { data: equipmentsData } = useEquipments({ limit: 1000 })

	const onSubmit = async (values: MaintenancePlanTaskSchema) => {
		setIsSubmitting(true)

		let uploadResults: UploadResult[] = []

		if (values.attachments.length > 0) {
			uploadResults = await uploadFilesToCloud({
				randomString: userId,
				containerType: "files",
				files: values.attachments,
				secondaryName: values.name,
			})
		}

		try {
			const { ok, message } = await createMaintenancePlanTask({
				values: {
					...values,
					attachments: [],
				},
				attachments: uploadResults,
			})

			if (ok) {
				toast.success("Tarea de mantenimiento creada exitosamente", {
					description: "La tarea de mantenimiento ha sido creada exitosamente",
					duration: 3000,
				})
				setOpen(false)
				queryClient.invalidateQueries({
					queryKey: ["maintenance-plans-tasks", { planSlug: maintenancePlanSlug }],
				})
				form.reset()
			} else {
				toast.error("Error al crear la tarea de mantenimiento", {
					description: message,
					duration: 5000,
				})
			}
		} catch (error) {
			console.log(error)
			toast.error("Error al crear la tarea de mantenimiento", {
				description: "Ocurrió un error al intentar crear la tarea de mantenimiento",
				duration: 5000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button size={"lg"} className="bg-primary hover:bg-primary/80 text-white">
					<Plus />
					Tarea
					<span className="hidden sm:inline"> de Mantenimiento</span>
				</Button>
			</SheetTrigger>

			<SheetContent className="w-full gap-0 sm:max-w-2xl">
				<SheetHeader className="shadow">
					<SheetTitle>Crear Tarea de Mantenimiento</SheetTitle>
					<SheetDescription>
						Complete el formulario para crear una nueva tarea de mantenimiento.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-x-2 gap-y-5 overflow-y-scroll px-4 pt-4 pb-14 sm:grid-cols-2"
					>
						<div className="flex flex-col sm:col-span-2">
							<h2 className="text-text w-fit text-xl font-bold sm:col-span-2">
								Información General
							</h2>
							<p className="text-muted-foreground w-fit">
								Información general de la tarea de mantenimiento
							</p>
						</div>

						<InputFormField<MaintenancePlanTaskSchema>
							name="name"
							label="Nombre"
							control={form.control}
							placeholder="Nombre de la tarea"
							className="sm:col-span-2"
						/>

						<SelectWithSearchFormField<MaintenancePlanTaskSchema>
							name="equipmentId"
							label="Equipo"
							control={form.control}
							options={
								equipmentsData?.equipments?.map((equipment) => ({
									value: equipment.id,
									label: equipment.name,
								})) || []
							}
						/>

						<SelectFormField<MaintenancePlanTaskSchema>
							name="frequency"
							label="Frecuencia"
							control={form.control}
							options={TaskFrequencyOptions}
							placeholder="Selecciona la frecuencia"
						/>

						<DatePickerFormField<MaintenancePlanTaskSchema>
							name="nextDate"
							label="Próxima fecha"
							control={form.control}
						/>

						<TextAreaFormField<MaintenancePlanTaskSchema>
							name="description"
							label="Descripción"
							control={form.control}
							itemClassName="sm:col-span-2"
							placeholder="Descripción de la tarea"
						/>

						<FormLabel>Archivos adjuntos</FormLabel>
						<UploadFilesFormField<MaintenancePlanTaskSchema>
							name="attachments"
							control={form.control}
							containerClassName="sm:col-span-2"
							selectedFileIndex={selectedFileIndex}
							setSelectedFileIndex={setSelectedFileIndex}
						/>

						<SubmitButton
							label="Crear tarea"
							isSubmitting={isSubmitting}
							className="hover:bg-primary/80 sm:col-span-2"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
