"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { SquarePen } from "lucide-react"
import { toast } from "sonner"

import { updateWorkOrderById } from "@/actions/work-orders/updateWorkOrderById"
import { WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { WorkOrderCAPEXOptions } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { useCompanies } from "@/hooks/companies/use-companies"
import { WorkOrder } from "@/hooks/work-orders/use-work-order"
import { useEquipments } from "@/hooks/use-equipments"
import { useUsers } from "@/hooks/users/use-users"
import {
	updateWorkOrderSchema,
	type UpdateWorkOrderSchema,
} from "@/lib/form-schemas/admin/work-order/updateWorkOrder.schema"

import { SelectWithSearchFormField } from "../../shared/SelectWithSearchFormField"
import { MultiSelectFormField } from "../../shared/MultiSelectFormField"
import { DatePickerFormField } from "../../shared/DatePickerFormField"
import { TextAreaFormField } from "../../shared/TextAreaFormField"
import { SelectFormField } from "../../shared/SelectFormField"
import { InputFormField } from "../../shared/InputFormField"
import { Separator } from "@/components/ui/separator"
import SubmitButton from "../../shared/SubmitButton"
import { Skeleton } from "@/components/ui/skeleton"
import SafetyTalksInfo from "./SafetyTalksInfo"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
} from "@/components/ui/form"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/components/ui/select"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

import type { Company } from "@/hooks/companies/use-companies"
import { WorkOrderStatusOptions } from "@/lib/consts/work-order-status"

interface UpdateWorkOrderFormProps {
	workOrder: WorkOrder
}

export default function UpdateWorkOrderForm({
	workOrder,
}: UpdateWorkOrderFormProps): React.ReactElement {
	const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const { data: companiesData, isLoading: isCompaniesLoading } = useCompanies({ limit: 100 })
	const { data: equipmentsData } = useEquipments({ limit: 100 })
	const { data: usersData } = useUsers({ limit: 100 })

	const router = useRouter()

	const form = useForm<UpdateWorkOrderSchema>({
		resolver: zodResolver(updateWorkOrderSchema),
		defaultValues: {
			type: workOrder.type,
			status: workOrder.status,
			priority: workOrder.priority,
			companyId: workOrder.company?.id,
			workRequest: workOrder.workRequest,
			capex: workOrder.capex ?? undefined,
			supervisorId: workOrder.supervisor.id,
			responsibleId: workOrder.responsible.id,
			estimatedDays: `${workOrder.estimatedDays}`,
			programDate: new Date(workOrder.programDate),
			estimatedHours: `${workOrder.estimatedHours}`,
			workDescription: workOrder.workDescription ?? "",
			workProgressStatus: `${workOrder.workProgressStatus}`,
			estimatedEndDate: workOrder.estimatedEndDate ?? new Date(),
			solicitationDate: workOrder.solicitationDate ?? new Date(),
			equipment: workOrder.equipment.map((equipment) => equipment.id),
			solicitationTime: workOrder.solicitationTime ?? new Date().toTimeString().split(" ")[0],
		},
	})

	useEffect(() => {
		if (companiesData) {
			setSelectedCompany(
				companiesData.companies.find((company) => company.id === workOrder.company?.id)
			)
		}
	}, [companiesData, workOrder.company])

	useEffect(() => {
		const estimatedHours = Number(form.watch("estimatedHours"))
		const estimatedDays = Math.ceil(estimatedHours / 8)

		form.setValue("estimatedDays", estimatedDays.toString())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("estimatedHours")])

	async function onSubmit(values: UpdateWorkOrderSchema) {
		setIsSubmitting(true)

		try {
			const { ok, message } = await updateWorkOrderById({
				id: workOrder.id,
				values,
			})

			if (!ok) throw new Error(message)

			toast.success("Orden de trabajo actualizada exitosamente")
			router.push(`/admin/dashboard/ordenes-de-trabajo/`)
		} catch (error) {
			console.error(error)
			toast.error("Error al actualizar la orden de trabajo", {
				description: error instanceof Error ? error.message : "Intente nuevamente",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className="bg-primary hover:bg-primary/80 flex h-10 items-center justify-center gap-1 rounded-md px-3 text-sm text-white"
				onClick={() => setOpen(true)}
			>
				<SquarePen className="h-4 w-4" />
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

						<SelectWithSearchFormField<UpdateWorkOrderSchema>
							name="responsibleId"
							label="Responsable OTC"
							control={form.control}
							placeholder="Selecciona un responsable"
							description="Persona que se encargara de la OT"
							options={
								usersData?.users.map((user) => ({
									value: user.id,
									label: user.name,
								})) ?? []
							}
						/>

						<SelectFormField<UpdateWorkOrderSchema>
							name="status"
							control={form.control}
							label="Estado"
							options={WorkOrderStatusOptions}
							itemClassName="h-full content-start"
							description="Estado actual de la OT"
						/>

						<SelectFormField<UpdateWorkOrderSchema>
							name="type"
							control={form.control}
							label="Tipo de Trabajo"
							options={WorkOrderTypeOptions}
							itemClassName="h-full content-start"
							placeholder="Seleccione el tipo de trabajo"
						/>

						<DatePickerFormField<UpdateWorkOrderSchema>
							control={form.control}
							name="solicitationDate"
							label="Fecha de Solicitud"
						/>

						<InputFormField<UpdateWorkOrderSchema>
							name="solicitationTime"
							label="Hora de Solicitud"
							control={form.control}
						/>

						<InputFormField<UpdateWorkOrderSchema>
							name="workRequest"
							control={form.control}
							label="Trabajo Solicitado"
							placeholder="Ingrese el trabajo solicitado"
						/>

						<SelectFormField<UpdateWorkOrderSchema>
							name="priority"
							label="Prioridad"
							control={form.control}
							options={WorkOrderPriorityOptions}
							placeholder="Seleccione una prioridad"
						/>

						<SelectFormField<UpdateWorkOrderSchema>
							name="capex"
							label="CAPEX"
							control={form.control}
							options={WorkOrderCAPEXOptions}
							placeholder="Seleccione un indicador"
						/>

						<MultiSelectFormField<UpdateWorkOrderSchema>
							name="equipment"
							options={
								equipmentsData?.equipments.map((equipment) => ({
									value: equipment.id,
									label: equipment.name,
								})) ?? []
							}
							control={form.control}
							itemClassName="sm:col-span-2"
							label="Equipo(s) / Ubicación(es)"
							placeholder="Seleccione uno o más equipos"
						/>

						<TextAreaFormField<UpdateWorkOrderSchema>
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
							<h2 className="text-xl font-bold">Empresa Colaboradora</h2>
							<span className="text-muted-foreground text-sm">
								Sólo se muestran las empresas que tengan uno o más supervisores asignados
							</span>
						</div>

						<FormField
							control={form.control}
							name="companyId"
							render={() => (
								<FormItem className="flex flex-col">
									<FormLabel>Empresa Responsable</FormLabel>
									<Select
										disabled={isCompaniesLoading}
										defaultValue={workOrder.company?.id}
										onValueChange={(value) => {
											const company = companiesData?.companies.find((c) => c.id === value)
											setSelectedCompany(company)
											form.setValue("companyId", value)
										}}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Selecciona una empresa" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{isCompaniesLoading ? (
												<div className="flex w-full items-center justify-center p-4">
													<Skeleton className="h-4 w-full" />
												</div>
											) : (
												companiesData?.companies.map((company) => (
													<SelectItem key={company.id} value={company.id}>
														{company.name}
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						{selectedCompany && (
							<FormField
								control={form.control}
								name="supervisorId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Supervisor</FormLabel>
										<Select
											disabled={!selectedCompany}
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona un supervisor" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{selectedCompany?.users
													.filter((user) => user.isSupervisor)
													.map((user) => (
														<SelectItem key={user.id} value={user.id}>
															{user.name}
														</SelectItem>
													))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{selectedCompany && <SafetyTalksInfo users={selectedCompany.users} />}

						<Separator className="my-2 sm:col-span-2" />

						<div className="sm:col-span-2">
							<h2 className="text-xl font-bold">Fechas y Horas</h2>
							<span className="text-muted-foreground text-sm">
								Fechas y horas estimadas relacionadas con el trabajo a realizar.
							</span>
						</div>

						<DatePickerFormField<UpdateWorkOrderSchema>
							name="programDate"
							label="Fecha Programada"
							control={form.control}
						/>

						<InputFormField<UpdateWorkOrderSchema>
							type="number"
							name="estimatedHours"
							control={form.control}
							label="Horas Estimadas"
						/>

						<InputFormField<UpdateWorkOrderSchema>
							type="number"
							name="estimatedDays"
							control={form.control}
							label="Días Estimados"
						/>

						<SubmitButton
							label="Actualizar OT"
							className="sm:col-span-2"
							isSubmitting={isSubmitting}
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
