"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircleIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createMaintenancePlanTask } from "@/project/maintenance-plan/actions/createMaintenancePlanTask"
import { uploadFilesToCloud, type UploadResult } from "@/lib/upload-files"
import { useEquipments } from "@/project/equipment/hooks/use-equipments"
import { TaskFrequencyOptions } from "@/lib/consts/task-frequency"
import { queryClient } from "@/lib/queryClient"
import {
	maintenancePlanTaskSchema,
	type MaintenancePlanTaskSchema,
} from "@/project/maintenance-plan/schemas/maintenance-plan-task.schema"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import UploadFilesFormField from "@/shared/components/forms/UploadFilesFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Form, FormLabel } from "@/shared/components/ui/form"
import { Button } from "@/shared/components/ui/button"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

interface MaintenancePlanTaskFormProps {
	userId: string
	equipmentId: string
	maintenancePlanSlug: string
}

export default function MaintenancePlanTaskForm({
	userId,
	equipmentId,
	maintenancePlanSlug,
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

	const { data: equipmentsData } = useEquipments({ limit: 1000, parentId: equipmentId })

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
				<Button
					size={"lg"}
					className="gap-1.5 bg-white text-indigo-600 transition-all hover:scale-105 hover:bg-white hover:text-indigo-600"
				>
					<PlusCircleIcon className="size-4" />
					Tarea de Mantenimiento
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
