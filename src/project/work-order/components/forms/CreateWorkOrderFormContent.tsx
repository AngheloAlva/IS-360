"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, differenceInDays } from "date-fns"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createWorkOrder } from "@/project/work-order/actions/createWorkOrder"
import { WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { useEquipments } from "@/project/equipment/hooks/use-equipments"
import { WorkOrderCAPEXOptions } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { useCompanies } from "@/project/company/hooks/use-companies"
import { useUsers } from "@/project/user/hooks/use-users"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"
import {
	workOrderSchema,
	type WorkOrderSchema,
} from "@/project/work-order/schemas/workOrder.schema"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
import { MultiSelectFormField } from "@/shared/components/forms/MultiSelectFormField"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import { Form, FormItem, FormLabel } from "@/shared/components/ui/form"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Separator } from "@/shared/components/ui/separator"
import FileTable from "@/shared/components/forms/FileTable"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"

import type { Company } from "@/project/company/hooks/use-companies"

interface CreateWorkOrderFormContentProps {
	workRequestId?: string
	equipmentId?: string[]
	equipmentName?: string[]
	maintenancePlanTaskId?: string[]
	initialData?: {
		programDate: Date
		workRequest?: string
		description?: string
		responsibleId: string
	}
	onClose: () => void
}

export default function CreateWorkOrderFormContent({
	initialData,
	equipmentId,
	workRequestId,
	equipmentName,
	maintenancePlanTaskId,
	onClose,
}: CreateWorkOrderFormContentProps): React.ReactElement {
	const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const { data: equipmentsData } = useEquipments({ limit: 1000, order: "asc", orderBy: "name" })
	const { data: companiesData } = useCompanies({ limit: 1000, orderBy: "name", order: "desc" })
	const { data: responsibleUsersData } = useUsers({ limit: 1000 })

	const form = useForm<WorkOrderSchema>({
		resolver: zodResolver(workOrderSchema),
		defaultValues: {
			companyId: "",
			type: undefined,
			supervisorId: "",
			capex: undefined,
			estimatedDays: "1",
			estimatedHours: "8",
			priority: undefined,
			estimatedEndDate: new Date(),
			solicitationDate: new Date(),
			equipment: equipmentId ? equipmentId : [],
			workRequest: initialData?.workRequest ?? "",
			responsibleId: initialData?.responsibleId ?? "",
			workDescription: initialData?.description ?? "",
			solicitationTime: new Date().toTimeString().split(" ")[0],
			programDate: new Date(initialData?.programDate || new Date()),
		},
	})

	useEffect(() => {
		const estimatedDays = Number(form.watch("estimatedDays"))
		const estimatedHours = estimatedDays * 8
		const estimatedEndDate = addDays(new Date(form.watch("programDate")), estimatedDays)

		form.setValue("estimatedHours", estimatedHours.toString())
		form.setValue("estimatedEndDate", estimatedEndDate)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("estimatedDays")])

	useEffect(() => {
		const programDate = new Date(form.watch("programDate"))
		const estimatedEndDate = new Date(form.watch("estimatedEndDate") ?? new Date())
		const diffInDays = differenceInDays(estimatedEndDate, programDate)

		form.setValue("estimatedDays", diffInDays.toString())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("estimatedEndDate")])

	useEffect(() => {
		const errors = form.formState.errors
		if (Object.keys(errors).length > 0) {
			console.log("Errores de validación:", errors)
		}
	}, [form.formState.errors])

	async function onSubmit(values: WorkOrderSchema) {
		const initReportFile = form.getValues("file")?.[0]

		setIsSubmitting(true)

		try {
			if (initReportFile && initReportFile.file) {
				const fileExtension = initReportFile.file.name.split(".").pop()
				const uniqueFilename = `${Date.now()}-${Math.random()
					.toString(36)
					.substring(2, 9)}-${values.companyId?.slice(0, 4)}.${fileExtension}`

				const uploadResult = await uploadFilesToCloud({
					randomString: uniqueFilename,
					containerType: "files",
					secondaryName: values.workRequest + "-" + initReportFile.title,
					files: [initReportFile],
				})

				const { ok, message } = await createWorkOrder({
					values: {
						...values,
						file: undefined,
					},
					initReportFile: uploadResult[0],
					equipmentId,
					workRequestId,
					maintenancePlanTaskId,
				})

				if (!ok) throw new Error(message)
			} else {
				const { ok, message } = await createWorkOrder({
					values,
					equipmentId,
					workRequestId,
					maintenancePlanTaskId,
				})

				if (!ok) throw new Error(message)
			}

			toast.success("Solicitud creada exitosamente")
			onClose()
			queryClient.invalidateQueries({
				queryKey: [
					"workOrders",
					{
						companyId: null,
					},
				],
			})
			form.reset()
		} catch (error) {
			console.error(error)
			toast.error("Error al crear la solicitud", {
				description: error instanceof Error ? error.message : "Intente nuevamente",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="grid w-full gap-x-3 gap-y-5 overflow-y-auto px-4 pt-4 pb-16 sm:grid-cols-2"
			>
				<div className="sm:col-span-2">
					<h2 className="text-xl font-bold">Información General</h2>
					<span className="text-muted-foreground text-sm">
						Información útil para crear la Orden de Trabajo.
					</span>
				</div>

				<SelectWithSearchFormField<WorkOrderSchema>
					name="responsibleId"
					label="Responsable IS 360"
					control={form.control}
					placeholder="Selecciona un responsable"
					description="Persona que se encargara de la OT"
					options={
						responsibleUsersData?.users.map((user) => ({
							value: user.id,
							label: user.name,
						})) ?? []
					}
				/>

				<SelectFormField<WorkOrderSchema>
					name="type"
					control={form.control}
					label="Tipo de Trabajo"
					options={WorkOrderTypeOptions}
					itemClassName="h-full content-start"
					placeholder="Seleccione el tipo de trabajo"
				/>

				<InputFormField<WorkOrderSchema>
					name="workRequest"
					control={form.control}
					label="Trabajo Solicitado"
					placeholder="Ingrese el trabajo solicitado"
				/>

				<SelectFormField<WorkOrderSchema>
					name="priority"
					label="Prioridad"
					control={form.control}
					options={WorkOrderPriorityOptions}
					placeholder="Seleccione una prioridad"
				/>

				<SelectFormField<WorkOrderSchema>
					name="capex"
					label="CapEx"
					control={form.control}
					options={WorkOrderCAPEXOptions}
					placeholder="Seleccione un indicador"
				/>

				{equipmentId && equipmentName ? (
					<FormItem className="sm:col-span-2">
						<FormLabel>Equipo (No editable)</FormLabel>
						<Input readOnly name="equipment" value={equipmentName} />
					</FormItem>
				) : (
					<MultiSelectFormField<WorkOrderSchema>
						name="equipment"
						options={
							equipmentsData?.equipments.map((equipment) => ({
								value: equipment.id,
								label: equipment.name + "* (" + equipment.location + ")",
							})) ?? []
						}
						control={form.control}
						itemClassName="sm:col-span-2"
						label="Equipo(s) / Ubicación(es)"
						placeholder="Seleccione uno o más equipos"
					/>
				)}

				<TextAreaFormField<WorkOrderSchema>
					optional
					className="min-h-32"
					name="workDescription"
					control={form.control}
					itemClassName="sm:col-span-2"
					label="Descripción del Trabajo"
					placeholder="Ingrese la descripción del trabajo"
				/>

				<Separator className="my-2 sm:col-span-2" />

				<div className="sm:col-span-2">
					<h2 className="text-xl font-bold">Empresa Colaboradora | Responsable</h2>
					<span className="text-muted-foreground text-sm">
						Sólo se muestran las empresas que tengan uno o más supervisores asignados.
					</span>
				</div>

				<SelectWithSearchFormField<WorkOrderSchema>
					name="companyId"
					control={form.control}
					options={
						companiesData?.companies.map((company) => ({
							value: company.id,
							label: company.name,
						})) ?? []
					}
					label="Empresa Responsable"
					onChange={(value) => {
						setSelectedCompany(companiesData?.companies.find((company) => company.id === value))
					}}
				/>

				{selectedCompany && (
					<SelectWithSearchFormField<WorkOrderSchema>
						name="supervisorId"
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
						label="Supervisor"
					/>
				)}

				<Separator className="my-2 sm:col-span-2" />

				<div className="sm:col-span-2">
					<h2 className="text-xl font-bold">Fechas y Horas</h2>
					<span className="text-muted-foreground text-sm">
						Fechas y horas estimadas relacionadas con el trabajo a realizar.
					</span>
				</div>

				<DatePickerFormField<WorkOrderSchema>
					name="programDate"
					label="Fecha Programada"
					control={form.control}
				/>

				<InputFormField<WorkOrderSchema>
					type="number"
					name="estimatedDays"
					control={form.control}
					label="Días Estimados"
				/>

				<DatePickerFormField<WorkOrderSchema>
					name="estimatedEndDate"
					control={form.control}
					label="Fecha Final Estimada"
				/>

				<InputFormField<WorkOrderSchema>
					type="number"
					name="estimatedHours"
					control={form.control}
					label="Horas Estimadas"
				/>

				<Separator className="my-2 sm:col-span-2" />

				<div className="sm:col-span-2">
					<h2 className="text-xl font-bold">Reporte Inicial</h2>
					<span className="text-muted-foreground text-sm">
						Reporte inicial relacionado con el trabajo a realizar.
					</span>
				</div>

				<FileTable<WorkOrderSchema>
					name="file"
					isMultiple={false}
					control={form.control}
					className="mb-6 w-full sm:col-span-2"
				/>

				<Button
					size="lg"
					type="button"
					onClick={onClose}
					variant={"outline"}
					disabled={isSubmitting}
				>
					Cancelar
				</Button>

				<SubmitButton
					label="Crear Nueva OT"
					isSubmitting={isSubmitting}
					className={cn("bg-orange-600 hover:bg-orange-600 hover:text-white", {
						"bg-indigo-600 hover:bg-indigo-600": equipmentId && maintenancePlanTaskId,
					})}
				/>
			</form>
		</Form>
	)
}
