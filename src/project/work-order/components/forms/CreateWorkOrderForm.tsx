"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircleIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { addDays } from "date-fns"
import { toast } from "sonner"

import { createWorkOrder } from "@/project/work-order/actions/createWorkOrder"
import { WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { useEquipments } from "@/project/equipment/hooks/use-equipments"
import { WorkOrderCAPEXOptions } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { useCompanies } from "@/project/company/hooks/use-companies"
import { OPERATOR_LIST } from "@/lib/consts/operator-list"
import { useUsers } from "@/project/user/hooks/use-users"
import { uploadFilesToCloud } from "@/lib/upload-files"
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
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
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
	className?: string
	equipmentId?: string
	workRequestId?: string
	equipmentName?: string
	maintenancePlanTaskId?: string
}

export default function CreateWorkOrderForm({
	className,
	equipmentId,
	workRequestId,
	equipmentName,
	maintenancePlanTaskId,
}: CreateWorkOrderFormProps): React.ReactElement {
	const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [open, setOpen] = useState(false)

	const { data: companiesData } = useCompanies({ limit: 1000, orderBy: "name", order: "desc" })
	const { data: responsibleUsersData } = useUsers({ limit: 1000, search: "" })
	const { data: equipmentsData } = useEquipments({ limit: 1000 })

	const router = useRouter()

	const form = useForm<WorkOrderSchema>({
		resolver: zodResolver(workOrderSchema),
		defaultValues: {
			companyId: "",
			workRequest: "",
			type: undefined,
			supervisorId: "",
			capex: undefined,
			responsibleId: "",
			estimatedDays: "",
			estimatedHours: "",
			workDescription: "",
			priority: undefined,
			programDate: new Date(),
			estimatedEndDate: new Date(),
			solicitationDate: new Date(),
			equipment: equipmentId ? [equipmentId] : [],
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
			router.refresh()
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

	const isInternalResponsible = form.watch("isInternalResponsible")

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className={cn(
					"flex h-10 items-center justify-center gap-1.5 rounded-md bg-white px-3 text-sm font-medium text-orange-700 transition-all hover:scale-105",
					className,
					{
						"flex h-7 cursor-pointer items-center justify-center gap-1 rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold tracking-wide text-white transition-all hover:scale-105":
							equipmentId && maintenancePlanTaskId,
					}
				)}
				onClick={() => setOpen(true)}
			>
				<PlusCircleIcon className="h-4 w-4" />
				<span className="hidden sm:inline">Nueva OT</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-2xl">
				<SheetHeader className="shadow">
					<SheetTitle>{equipmentName ? "Nueva OT" : "Nueva Orden de Trabajo"}</SheetTitle>
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

						<SwitchFormField<WorkOrderSchema>
							control={form.control}
							label="Responsable Interno"
							name="isInternalResponsible"
							itemClassName="sm:col-span-2"
							onCheckedChange={(checked) => {
								form.setValue("isInternalResponsible", checked)
								form.setValue("companyId", "")
								form.setValue("supervisorId", "")
								setSelectedCompany(undefined)
							}}
						/>

						{!isInternalResponsible ? (
							<>
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
										setSelectedCompany(
											companiesData?.companies.find((company) => company.id === value)
										)
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
							</>
						) : (
							<SelectWithSearchFormField<WorkOrderSchema>
								name="supervisorId"
								control={form.control}
								options={OPERATOR_LIST.map((operator) => ({
									value: operator,
									label: operator,
								}))}
								label="Responsable Interno"
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
							className={cn("bg-orange-600 hover:bg-orange-600", {
								"bg-indigo-600 hover:bg-indigo-600": equipmentId && maintenancePlanTaskId,
							})}
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
