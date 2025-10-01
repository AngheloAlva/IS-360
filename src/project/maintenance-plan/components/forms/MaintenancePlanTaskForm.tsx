"use client"

import { PenBoxIcon, PlusCircleIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createMaintenancePlanTask } from "@/project/maintenance-plan/actions/createMaintenancePlanTask"
import { updateMaintenancePlanTask } from "@/project/maintenance-plan/actions/updateMaintenancePlanTask"
import { WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { uploadFilesToCloud, type UploadResult } from "@/lib/upload-files"
import { useEquipments } from "@/project/equipment/hooks/use-equipments"
import { WorkOrderCAPEXOptions } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { TaskFrequencyOptions } from "@/lib/consts/task-frequency"
import { useOperators } from "@/shared/hooks/use-operators"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"
import {
	maintenancePlanTaskSchema,
	type MaintenancePlanTaskSchema,
} from "@/project/maintenance-plan/schemas/maintenance-plan-task.schema"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
import { EmailTagsInputFormField } from "@/shared/components/forms/EmailTagsInputFormField"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
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

import type { WORK_ORDER_CAPEX, WORK_ORDER_PRIORITY, WORK_ORDER_TYPE } from "@prisma/client"

interface MaintenancePlanTaskFormProps {
	userId: string
	className?: string
	maintenancePlanSlug: string
	initialData?: {
		id: string
		name: string
		description?: string
		frequency: string
		nextDate: Date
		equipmentId?: string
		isAutomated?: boolean
		automatedSupervisorId?: string
		automatedWorkOrderType?: WORK_ORDER_TYPE
		automatedPriority?: WORK_ORDER_PRIORITY
		automatedCapex?: WORK_ORDER_CAPEX
		automatedEstimatedDays?: number
		automatedEstimatedHours?: number
		automatedWorkDescription?: string
		emailsForCopy?: string[]
	}
}

export default function MaintenancePlanTaskForm({
	userId,
	className,
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
			nextDate: initialData?.nextDate ? new Date(initialData.nextDate) : undefined,
			frequency:
				(initialData?.frequency as (typeof TaskFrequencyOptions)[number]["value"]) ?? undefined,
			equipmentId: initialData?.equipmentId ?? undefined,
			// Campos de automatización
			isAutomated: initialData?.isAutomated ?? false,
			automatedSupervisorId: initialData?.automatedSupervisorId ?? "",
			automatedWorkOrderType: initialData?.automatedWorkOrderType ?? undefined,
			automatedPriority: initialData?.automatedPriority ?? undefined,
			automatedCapex: initialData?.automatedCapex ?? undefined,
			automatedEstimatedDays: `${initialData?.automatedEstimatedDays ?? "1"}`,
			automatedEstimatedHours: `${initialData?.automatedEstimatedHours ?? "8"}`,
			automatedWorkDescription: initialData?.automatedWorkDescription ?? "",
			emailsForCopy: initialData?.emailsForCopy ?? [],
		},
	})

	const { data: equipmentsData } = useEquipments({
		limit: 1000,
		order: "asc",
		showAll: true,
		orderBy: "name",
	})

	const { data: operatorsData } = useOperators({ page: 1, limit: 1000 })

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
							toYear={new Date().getFullYear() + 5}
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

						<Separator className="my-4 sm:col-span-2" />

						<div className="sm:col-span-2">
							<h3 className="text-lg font-semibold">Automatización de Órdenes de Trabajo</h3>
							<p className="text-sm">
								Configurar la creación automática de OTs para esta tarea de mantenimiento
							</p>
						</div>

						<SwitchFormField
							name="isAutomated"
							control={form.control}
							label="¿Automatizar creación de OTs?"
							itemClassName="sm:col-span-2"
							description="Las órdenes de trabajo se crearán automáticamente según la frecuencia de la tarea para la empresa IS 360"
						/>

						{form.watch("isAutomated") && (
							<>
								<SelectWithSearchFormField
									name="automatedSupervisorId"
									control={form.control}
									options={
										operatorsData?.operators?.map((operator) => ({
											value: operator.id,
											label: operator.name,
										})) ?? []
									}
									label="Supervisor Automático (Operadores)"
									placeholder="Seleccionar supervisor"
									itemClassName="sm:col-span-2"
									description="Supervisor que será asignado automáticamente a las OTs generadas"
								/>

								<SelectFormField
									name="automatedWorkOrderType"
									control={form.control}
									label="Tipo de Trabajo"
									options={WorkOrderTypeOptions}
								/>

								<SelectFormField
									name="automatedPriority"
									control={form.control}
									label="Prioridad"
									options={WorkOrderPriorityOptions}
									placeholder="Seleccione una prioridad"
								/>

								<SelectFormField
									name="automatedCapex"
									control={form.control}
									label="CapEx"
									options={WorkOrderCAPEXOptions}
									placeholder="Seleccione un indicador"
								/>

								<InputFormField
									type="number"
									name="automatedEstimatedDays"
									control={form.control}
									label="Días Estimados"
									placeholder="1"
								/>

								<InputFormField
									type="number"
									name="automatedEstimatedHours"
									control={form.control}
									label="Horas Estimadas"
									placeholder="8"
								/>

								<EmailTagsInputFormField<MaintenancePlanTaskSchema>
									optional
									name="emailsForCopy"
									label="Emails para Copia"
									control={form.control}
									itemClassName="sm:col-span-2"
									placeholder="Ingresa emails separados por comas, espacios o Enter"
									description="Emails que recibirán una copia de la orden de trabajo creada automáticamente"
								/>
							</>
						)}

						<Separator className="my-4 sm:col-span-2" />

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
