"use client"

import { PenBoxIcon, PlusCircleIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { createMaintenancePlanTask } from "@/project/maintenance-plan/actions/createMaintenancePlanTask"
import { updateMaintenancePlanTask } from "@/project/maintenance-plan/actions/updateMaintenancePlanTask"
import { Company, useCompanies } from "@/project/company/hooks/use-companies"
import { useUsers } from "@/project/user/hooks/use-users"
import { WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { uploadFilesToCloud, type UploadResult } from "@/lib/upload-files"
import { useEquipments } from "@/project/equipment/hooks/use-equipments"
import { WorkOrderCAPEXOptions } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { TaskSpecialtyOptions } from "@/lib/consts/task-specialty"
import { TaskFrequencyOptions } from "@/lib/consts/task-frequency"
import { TaskTypeOptions } from "@/lib/consts/task-type"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"
import {
	maintenancePlanTaskSchema,
	type MaintenancePlanTaskSchema,
} from "@/project/maintenance-plan/schemas/maintenance-plan-task.schema"

import { MultiSelectFormField } from "@/shared/components/forms/MultiSelectFormField"
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

import type {
	TASK_SPECIALTY,
	TASK_TYPE,
	WORK_ORDER_CAPEX,
	WORK_ORDER_PRIORITY,
	WORK_ORDER_TYPE,
} from "@/generated/prisma/enums"

interface MaintenancePlanTaskFormProps {
	userId: string
	className?: string
	triggerLabel?: string
	compactTrigger?: boolean
	maintenancePlanSlug: string
	initialData?: {
		id: string
		name: string
		description?: string
		frequency: string
		nextDate: Date
		equipmentId?: string
		equipmentIds?: string[]
		specialty?: TASK_SPECIALTY
		taskType?: TASK_TYPE
		isAutomated?: boolean
		automatedCompanyId?: string
		automatedResponsibleId?: string
		automatedSupervisorId?: string
		automatedWorkOrderType?: WORK_ORDER_TYPE
		automatedPriority?: WORK_ORDER_PRIORITY
		automatedCapex?: WORK_ORDER_CAPEX
		automatedEstimatedDays?: number
		automatedEstimatedDaysByMonth?: boolean
		automatedEstimatedHours?: number
		automatedDaysInAdvance?: number
		automatedWorkDescription?: string
		blockIfPreviousNotCompleted?: boolean
		emailsForCopy?: string[]
	}
}

export default function MaintenancePlanTaskForm({
	userId,
	className,
	triggerLabel,
	compactTrigger = false,
	initialData,
	maintenancePlanSlug,
}: MaintenancePlanTaskFormProps): React.ReactElement {
	const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined)
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
			equipmentId: initialData?.equipmentId ?? initialData?.equipmentIds?.[0] ?? undefined,
			equipmentIds:
				initialData?.equipmentIds ?? (initialData?.equipmentId ? [initialData.equipmentId] : []),
			specialty: initialData?.specialty ?? undefined,
			taskType: initialData?.taskType ?? undefined,			// Campos de automatización
			automatedCompanyId: initialData?.automatedCompanyId ?? undefined,
			automatedResponsibleId: initialData?.automatedResponsibleId ?? "",
			isAutomated: initialData?.isAutomated ?? false,
			automatedSupervisorId: initialData?.automatedSupervisorId ?? "",
			automatedWorkOrderType: initialData?.automatedWorkOrderType ?? undefined,
			automatedPriority: initialData?.automatedPriority ?? undefined,
			automatedCapex: initialData?.automatedCapex ?? undefined,
			automatedEstimatedDays: `${initialData?.automatedEstimatedDays ?? "1"}`,
			automatedEstimatedDaysByMonth: initialData?.automatedEstimatedDaysByMonth ?? false,
			automatedEstimatedHours: `${initialData?.automatedEstimatedHours ?? "8"}`,
			automatedDaysInAdvance: `${initialData?.automatedDaysInAdvance ?? "0"}`,
			automatedWorkDescription: initialData?.automatedWorkDescription ?? "",
			blockIfPreviousNotCompleted: initialData?.blockIfPreviousNotCompleted ?? true,
			emailsForCopy: initialData?.emailsForCopy ?? [],
		},
	})

	const { data: equipmentsData } = useEquipments({
		limit: 1000,
		order: "asc",
		showAll: true,
		orderBy: "name",
	})

	const { data: companiesData } = useCompanies({ limit: 1000, orderBy: "name", order: "desc" })

	const { data: adminUsersData } = useUsers({ limit: 1000, orderBy: "name", order: "asc" })

	useEffect(() => {
		if (!initialData?.automatedCompanyId || !companiesData?.companies) return
		setSelectedCompany(
			companiesData.companies.find((company) => company.id === initialData.automatedCompanyId)
		)
	}, [companiesData?.companies, initialData?.automatedCompanyId])

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
			const normalizedValues: MaintenancePlanTaskSchema = {
				...values,
				equipmentId: values.equipmentIds?.[0] ?? values.equipmentId,
			}

			let response
			if (initialData?.id) {
				response = await updateMaintenancePlanTask({
					values: {
						...normalizedValues,
						attachments: [],
					},
					attachments: uploadResults,
					taskId: initialData.id,
				})
			} else {
				response = await createMaintenancePlanTask({
					values: {
						...normalizedValues,
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
    void queryClient.invalidateQueries({
					queryKey: ["maintenance-plans-tasks"],
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
					size={compactTrigger ? "sm" : initialData ? "icon" : "lg"}
					className={cn(
						"bg-white text-indigo-600 transition-all hover:scale-105 hover:bg-white hover:text-indigo-600",
						{
							"size-7 bg-fuchsia-600 text-white hover:bg-fuchsia-600 hover:text-white":
								initialData && !compactTrigger,
						},
						className
					)}
				>
					{initialData ? (
						<>
							<PenBoxIcon className="size-4" />
							{triggerLabel ?? "Editar"}
						</>
					) : (
						<>
							<PlusCircleIcon className="size-4" />
							{triggerLabel ?? "Tarea de Mantenimiento"}
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

						<MultiSelectFormField<MaintenancePlanTaskSchema>
							optional
							label="Equipos"
							name="equipmentIds"
							control={form.control}
							options={
								equipmentsData?.equipments?.map((equipment) => ({
									value: equipment.id,
									label: equipment.name + "* " + (equipment.location?.path ?? ""),
								})) || []
							}
							itemClassName="sm:col-span-2"
							description="Equipos hijos a los que se asigna la tarea. Si no seleccionas ninguno, se usa el equipo padre del plan."
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

						<SelectFormField<MaintenancePlanTaskSchema>
							optional
							name="specialty"
							label="Especialidad"
							control={form.control}
							options={TaskSpecialtyOptions}
							placeholder="Selecciona la especialidad"
						/>

						<SelectFormField<MaintenancePlanTaskSchema>
							optional
							name="taskType"
							label="Tipo de Tarea"
							control={form.control}
							options={TaskTypeOptions}
							placeholder="Selecciona el tipo"
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
							<h3 className="text-lg font-semibold">Información para Órdenes de Trabajo</h3>
							<p className="text-sm">
								Información que se utilizará para crear las órdenes de trabajo. Tambien la
								posibilidad de automatizar la creación de órdenes de trabajo.
							</p>
						</div>

						<SelectWithSearchFormField
							name="automatedResponsibleId"
							control={form.control}
							options={
								adminUsersData?.users?.map((user) => ({
									value: user.id,
									label: user.name,
								})) ?? []
							}
							label="Responsable Interno"
							placeholder="Seleccionar responsable"
							itemClassName="sm:col-span-2"
						/>

						<SelectWithSearchFormField
							name="automatedCompanyId"
							control={form.control}
							options={
								companiesData?.companies?.map((company) => ({
									value: company.id,
									label: company.name,
								})) ?? []
							}
							onChange={(value) => {
								setSelectedCompany(companiesData?.companies.find((company) => company.id === value))
							}}
							label="Empresa Automática"
							placeholder="Seleccionar empresa"
						/>

						<SelectWithSearchFormField
							name="automatedSupervisorId"
							disabled={!selectedCompany}
							control={form.control}
							options={
								selectedCompany?.rut === "96.655.490-8"
									? [
											...selectedCompany.users.map((user) => ({
												value: user.id,
												label: user.name,
											})),
											{ value: "w1pvjvijUfBTqWFaCaPsHUmTLrRCs583", label: "Cristian Pavez" },
										]
									: (selectedCompany?.users
											.filter((user) => user.isSupervisor)
											.map((user) => ({
												value: user.id,
												label: user.name,
											})) ?? [])
							}
							placeholder="Seleccionar supervisor"
							label="Supervisor Automático (Operadores)"
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
							disabled={form.watch("automatedEstimatedDaysByMonth")}
						/>

						<InputFormField
							type="number"
							name="automatedEstimatedHours"
							control={form.control}
							label="Horas Estimadas"
							placeholder="8"
						/>

						<SwitchFormField
							name="automatedEstimatedDaysByMonth"
							control={form.control}
							label="Días estimados según mes"
							itemClassName="sm:col-span-2"
							description="Los días estimados de la OT se calcularán automáticamente según la cantidad de días del mes en que se crea."
						/>

						<InputFormField
							type="number"
							placeholder="0"
							control={form.control}
							label="Días de antelación"
							name="automatedDaysInAdvance"
							description="Días antes de la fecha programada para crear la OT"
						/>

						<Separator className="sm:col-span-2" />

						<SwitchFormField
							name="isAutomated"
							control={form.control}
							label="¿Automatizar creación de OTs?"
							itemClassName="sm:col-span-2"
							description="Las órdenes de trabajo se crearán automáticamente según la frecuencia de la tarea."
						/>

						<SwitchFormField
							name="blockIfPreviousNotCompleted"
							control={form.control}
							label="Crear solo si la OT anterior está completada"
							itemClassName="sm:col-span-2"
							description="Si está activo, no se generará una nueva OT automática mientras la anterior siga abierta. Si está desactivado, se creará la OT igual aunque la anterior no esté cerrada."
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
