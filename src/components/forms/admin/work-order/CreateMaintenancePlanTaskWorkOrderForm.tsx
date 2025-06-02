"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { createWorkOrderByTask } from "@/actions/maintenance-plan-task/createWorkOrderByTask"
import { WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { WorkOrderCAPEXOptions } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { useCompanies } from "@/hooks/companies/use-companies"
import { getOtcUsers } from "@/actions/users/getUsers"
import { queryClient } from "@/lib/queryClient"
import {
	workOrderSchemaByTask,
	type WorkOrderSchemaByTask,
} from "@/lib/form-schemas/maintenance-plan/work-order-by-task.schema"

import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import { SelectWithSearchFormField } from "../../shared/SelectWithSearchFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import { Form, FormItem, FormLabel } from "@/components/ui/form"
import { SelectFormField } from "../../shared/SelectFormField"
import { SwitchFormField } from "../../shared/SwitchFormField"
import { Separator } from "@/components/ui/separator"
import SubmitButton from "../../shared/SubmitButton"
import SafetyTalksInfo from "./SafetyTalksInfo"
import { Input } from "@/components/ui/input"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

import type { PLAN_LOCATION_VALUES } from "@/lib/consts/plan-location"
import type { Company } from "@/hooks/companies/use-companies"
import type { User } from "@prisma/client"
import { OPERATOR_LIST } from "@/lib/consts/operator-list"

interface CreateMaintenancePlanTaskWorkOrderFormProps {
	equipmentId: string
	equipmentName: string
	maintenancePlanTaskId: string
	location: keyof typeof PLAN_LOCATION_VALUES
}

export default function CreateMaintenancePlanTaskWorkOrderForm({
	location,
	equipmentId,
	equipmentName,
	maintenancePlanTaskId,
}: CreateMaintenancePlanTaskWorkOrderFormProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined)
	const [otcUsers, setOtcUsers] = useState<User[]>([])
	const [open, setOpen] = useState(false)

	const { data: companiesData } = useCompanies({ limit: 100 })

	const form = useForm<WorkOrderSchemaByTask>({
		resolver: zodResolver(workOrderSchemaByTask),
		defaultValues: {
			companyId: "",
			breakDays: "0",
			type: undefined,
			workRequest: "",
			supervisorId: "",
			capex: undefined,
			responsibleId: "",
			location: location,
			estimatedDays: "0",
			estimatedHours: "0",
			workDescription: "",
			priority: undefined,
			requiresBreak: false,
			programDate: new Date(),
			estimatedEndDate: new Date(),
			solicitationDate: new Date(),
			isInternalResponsible: false,
			solicitationTime: new Date().toTimeString().split(" ")[0],
		},
	})

	useEffect(() => {
		const fetchInternalUsers = async () => {
			const { data, ok } = await getOtcUsers(100, 1)
			console.log(data)

			if (!ok || !data) {
				toast("Error al cargar los usuarios internos", {
					description: "Error al cargar los usuarios internos",
					duration: 5000,
				})
				return
			}

			setOtcUsers(data)
		}

		void fetchInternalUsers()
	}, [])

	useEffect(() => {
		const estimatedHours = Number(form.watch("estimatedHours"))
		const estimatedDays = Math.ceil(estimatedHours / 8)

		form.setValue("estimatedDays", estimatedDays.toString())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("estimatedHours")])

	async function onSubmit(values: WorkOrderSchemaByTask) {
		setIsSubmitting(true)

		try {
			const { ok, message } = await createWorkOrderByTask({
				values,
				equipmentId,
				maintenancePlanTaskId,
			})

			if (!ok) throw new Error(message)

			toast.success("Solicitud creada exitosamente")
			setOpen(false)
			queryClient.invalidateQueries({
				queryKey: ["work-orders", equipmentId],
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

	const isInternalResponsible = form.watch("isInternalResponsible")

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className="bg-primary hover:bg-primary/80 flex items-center justify-center gap-1 rounded-md px-3 py-1 text-sm text-white"
				onClick={() => setOpen(true)}
			>
				<PlusIcon className="h-4 w-4" />
				<span className="hidden sm:inline">Nueva OT</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-xl">
				<SheetHeader className="shadow">
					<SheetTitle>Nueva Orden de Trabajo</SheetTitle>
					<SheetDescription>
						Complete la información en el formulario para crear una nueva OT.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid w-full gap-x-3 gap-y-5 overflow-y-scroll px-4 pt-4 pb-16 sm:grid-cols-2"
					>
						<div className="sm:col-span-2">
							<h2 className="text-xl font-bold">Información General</h2>
							<span className="text-muted-foreground text-sm">
								Información útil para crear la Orden de Trabajo.
							</span>
						</div>

						<SelectWithSearchFormField<WorkOrderSchemaByTask>
							name="responsibleId"
							control={form.control}
							options={otcUsers.map((user) => ({
								value: user.id,
								label: user.name,
							}))}
							label="Responsable de OTC"
						/>

						<SelectFormField<WorkOrderSchemaByTask>
							name="type"
							control={form.control}
							label="Tipo de Trabajo"
							options={WorkOrderTypeOptions}
							placeholder="Seleccione el tipo de trabajo"
						/>

						<InputFormField<WorkOrderSchemaByTask>
							name="workRequest"
							control={form.control}
							label="Trabajo Solicitado"
							placeholder="Ingrese el trabajo solicitado"
						/>

						<SelectFormField<WorkOrderSchemaByTask>
							name="priority"
							label="Prioridad"
							control={form.control}
							options={WorkOrderPriorityOptions}
							placeholder="Seleccione una prioridad"
						/>

						<SelectFormField<WorkOrderSchemaByTask>
							name="capex"
							label="CAPEX"
							control={form.control}
							options={WorkOrderCAPEXOptions}
							placeholder="Seleccione un indicador"
						/>

						<FormItem>
							<FormLabel>Ubicación (No editable)</FormLabel>
							<Input readOnly name="location" value={location} />
						</FormItem>

						<FormItem className="sm:col-span-2">
							<FormLabel>Equipo (No editable)</FormLabel>
							<Input readOnly name="equipment" value={equipmentName} />
						</FormItem>

						<TextAreaFormField<WorkOrderSchemaByTask>
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

						<SwitchFormField<WorkOrderSchemaByTask>
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
								<SelectWithSearchFormField<WorkOrderSchemaByTask>
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
									<SelectWithSearchFormField<WorkOrderSchemaByTask>
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

								{selectedCompany && <SafetyTalksInfo users={selectedCompany.users} />}
							</>
						) : (
							<SelectWithSearchFormField<WorkOrderSchemaByTask>
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

						<DatePickerFormField<WorkOrderSchemaByTask>
							name="programDate"
							label="Fecha Programada"
							control={form.control}
						/>

						<InputFormField<WorkOrderSchemaByTask>
							type="number"
							name="estimatedHours"
							control={form.control}
							label="Horas Estimadas"
						/>

						<InputFormField<WorkOrderSchemaByTask>
							type="number"
							name="estimatedDays"
							control={form.control}
							label="Días Estimados"
						/>

						<SubmitButton
							label="Crear Nueva OT"
							className="sm:col-span-2"
							isSubmitting={isSubmitting}
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
