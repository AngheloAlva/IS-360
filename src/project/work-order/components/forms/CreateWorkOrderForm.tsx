"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircleIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { addDays, differenceInDays } from "date-fns"
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
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

import type { Company } from "@/project/company/hooks/use-companies"

interface CreateWorkOrderFormProps {
	equipmentId?: string
	workRequestId?: string
	equipmentName?: string
	maintenancePlanTaskId?: string
	initialData?: {
		programDate: Date
		workRequest: string
		description: string
		responsibleId: string
	}
}

export default function CreateWorkOrderForm({
	initialData,
	equipmentId,
	workRequestId,
	equipmentName,
	maintenancePlanTaskId,
}: CreateWorkOrderFormProps): React.ReactElement {
	const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [open, setOpen] = useState(false)

	const { data: companiesData } = useCompanies({ limit: 1000, orderBy: "name", order: "desc" })
	const { data: responsibleUsersData } = useUsers({ limit: 1000, search: "oleotrasandino" })
	const { data: equipmentsData } = useEquipments({ limit: 1000, order: "asc", orderBy: "name" })

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
			equipment: equipmentId ? [equipmentId] : [],
			workRequest: initialData?.workRequest ?? "",
			responsibleId: initialData?.responsibleId ?? "",
			workDescription: initialData?.description ?? "",
			programDate: initialData?.programDate ?? new Date(),
			solicitationTime: new Date().toTimeString().split(" ")[0],
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
			setOpen(false)
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
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className={cn(
					"flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-white px-3 text-sm font-medium text-orange-700 transition-all hover:scale-105",
					{
						"hover:bg-accent text-text hover:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:hover:bg-destructive/10 dark:data-[variant=destructive]:hover:bg-destructive/40 data-[variant=destructive]:hover:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex h-fit w-full cursor-default items-center justify-start gap-2 rounded-sm bg-transparent px-2 py-1.5 text-sm outline-hidden select-none hover:scale-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4":
							(equipmentId && maintenancePlanTaskId) || workRequestId,
					}
				)}
				onClick={() => setOpen(true)}
			>
				<PlusCircleIcon className="h-4 w-4" />
				<span className="hidden lg:inline">
					{equipmentName ? "Nueva OT" : "Nueva Orden de Trabajo"}
				</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-2xl">
				<SheetHeader className="shadow">
					<SheetTitle>Nueva Orden de Trabajo</SheetTitle>
					<SheetDescription>
						Complete la información en el formulario para crear una nueva Orden de Trabajo.
					</SheetDescription>
				</SheetHeader>

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
							label="Responsable OTC"
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
							label="CAPEX"
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
									selectedCompany?.users
										.filter((user) => user.isSupervisor)
										.map((user) => ({
											value: user.id,
											label: user.name,
										})) ?? []
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
							variant={"outline"}
							disabled={isSubmitting}
							onClick={() => setOpen(false)}
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
			</SheetContent>
		</Sheet>
	)
}
