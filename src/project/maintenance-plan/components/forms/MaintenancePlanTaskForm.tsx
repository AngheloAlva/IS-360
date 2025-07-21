"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PenBoxIcon, PlusCircleIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createMaintenancePlanTask } from "@/project/maintenance-plan/actions/createMaintenancePlanTask"
import { updateMaintenancePlanTask } from "@/project/maintenance-plan/actions/updateMaintenancePlanTask"
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
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
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
import { cn } from "@/lib/utils"

interface MaintenancePlanTaskFormProps {
	userId: string
	className?: string
	equipmentId: string
	maintenancePlanSlug: string
	initialData?: {
		id: string
		name: string
		description?: string
		frequency: string
		nextDate: Date
		equipmentId?: string
	}
}

export default function MaintenancePlanTaskForm({
	userId,
	className,
	equipmentId,
	initialData,
	maintenancePlanSlug,
}: MaintenancePlanTaskFormProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<MaintenancePlanTaskSchema>({
		resolver: zodResolver(maintenancePlanTaskSchema),
		defaultValues: {
			name: initialData?.name ?? "",
			attachments: [],
			description: initialData?.description ?? "",
			createdById: userId,
			maintenancePlanSlug,
			nextDate: initialData?.nextDate,
			frequency:
				(initialData?.frequency as (typeof TaskFrequencyOptions)[number]["value"]) ?? undefined,
			equipmentId: initialData?.equipmentId ?? undefined,
		},
	})

	const { data: equipmentsData } = useEquipments({
		limit: 1000,
		order: "asc",
		showAll: false,
		orderBy: "name",
		parentId: equipmentId,
	})

	const onSubmit = async (values: MaintenancePlanTaskSchema) => {
		setIsSubmitting(true)

		let uploadResults: UploadResult[] = []

		if (values.attachments.length > 0) {
			uploadResults = await uploadFilesToCloud({
				randomString: userId,
				containerType: "files",
				nameStrategy: "original",
				files: values.attachments,
			})
		}

		try {
			let response
			if (initialData?.id) {
				response = await updateMaintenancePlanTask({
					values: {
						...values,
						attachments: [],
					},
					attachments: uploadResults,
					taskId: initialData.id,
				})
			} else {
				response = await createMaintenancePlanTask({
					values: {
						...values,
						attachments: [],
					},
					attachments: uploadResults,
				})
			}

			const { ok, message } = response

			if (ok) {
				toast.success(
					initialData
						? "Tarea de mantenimiento actualizada exitosamente"
						: "Tarea de mantenimiento creada exitosamente",
					{
						description: initialData
							? "La tarea de mantenimiento ha sido actualizada exitosamente"
							: "La tarea de mantenimiento ha sido creada exitosamente",
						duration: 3000,
					}
				)
				setOpen(false)
				queryClient.invalidateQueries({
					queryKey: ["maintenance-plans-tasks", { planSlug: maintenancePlanSlug }],
				})
				form.reset()
			} else {
				toast.error(
					initialData
						? "Error al actualizar la tarea de mantenimiento"
						: "Error al crear la tarea de mantenimiento",
					{
						description: message,
						duration: 5000,
					}
				)
			}
		} catch (error) {
			console.log(error)
			toast.error(
				initialData
					? "Error al actualizar la tarea de mantenimiento"
					: "Error al crear la tarea de mantenimiento",
				{
					description:
						"Ocurrió un error al intentar " +
						(initialData ? "actualizar" : "crear") +
						" la tarea de mantenimiento",
					duration: 5000,
				}
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					size={initialData ? "icon" : "lg"}
					className={cn(
						"gap-1.5 bg-white text-indigo-600 transition-all hover:scale-105 hover:bg-white hover:text-indigo-600",
						{
							"size-7 bg-fuchsia-600 text-white hover:bg-fuchsia-600 hover:text-white": initialData,
						},
						className
					)}
				>
					{initialData ? (
						<>
							<PenBoxIcon className="size-4" />
							Editar
						</>
					) : (
						<>
							<PlusCircleIcon className="size-4" />
							Tarea de Mantenimiento
						</>
					)}
				</Button>
			</SheetTrigger>

			<SheetContent className="w-full gap-0 sm:max-w-2xl">
				<SheetHeader className="shadow">
					<SheetTitle>{initialData ? "Editar" : "Crear"} Tarea de Mantenimiento</SheetTitle>
					<SheetDescription>
						Complete el formulario para {initialData ? "editar la" : "crear una nueva"} tarea de
						mantenimiento.
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
							control={form.control}
							label="Nombre de la tarea"
							itemClassName="sm:col-span-2"
							placeholder="Nombre de la tarea"
						/>

						<SelectWithSearchFormField<MaintenancePlanTaskSchema>
							optional
							label="Equipo"
							name="equipmentId"
							control={form.control}
							options={
								equipmentsData?.equipments?.map((equipment) => ({
									value: equipment.id,
									label: equipment.name + "* (" + equipment.location + ")",
								})) || []
							}
							className=""
							itemClassName="sm:col-span-2"
							description="Equipo hijo al que se asigna la tarea. En caso de no escoger ninguno, se asigna al equipo padre."
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
							optional
							name="description"
							label="Descripción"
							control={form.control}
							itemClassName="sm:col-span-2"
							placeholder="Descripción de la tarea"
						/>

						<FileTable<MaintenancePlanTaskSchema>
							isMultiple={true}
							name="attachments"
							control={form.control}
							label="Archivos adjuntos"
							className="sm:col-span-2"
						/>

						<div className="flex gap-2 sm:col-span-2">
							<Button
								variant="outline"
								onClick={() => setOpen(false)}
								size={"lg"}
								className="w-1/2"
							>
								Cancelar
							</Button>

							<SubmitButton
								label={initialData ? "Guardar cambios" : "Crear tarea"}
								isSubmitting={isSubmitting}
								className="w-1/2 bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
							/>
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
