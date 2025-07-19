"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, differenceInDays } from "date-fns"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { SquarePen } from "lucide-react"
import { toast } from "sonner"

import { updateWorkOrderById } from "@/project/work-order/actions/updateWorkOrderById"
import { WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { uploadFilesToCloud, type UploadResult } from "@/lib/upload-files"
import { useEquipments } from "@/project/equipment/hooks/use-equipments"
import { WorkOrderStatusOptions } from "@/lib/consts/work-order-status"
import { WorkOrderCAPEXOptions } from "@/lib/consts/work-order-capex"
import { WorkOrder } from "@/project/work-order/hooks/use-work-order"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { useCompanies } from "@/project/company/hooks/use-companies"
import { useUsers } from "@/project/user/hooks/use-users"
import { queryClient } from "@/lib/queryClient"
import {
	updateWorkOrderSchema,
	type UpdateWorkOrderSchema,
} from "@/project/work-order/schemas/updateWorkOrder.schema"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
import { MultiSelectFormField } from "@/shared/components/forms/MultiSelectFormField"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SliderFormField } from "@/shared/components/forms/SliderFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Separator } from "@/shared/components/ui/separator"
import FileTable from "@/shared/components/forms/FileTable"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
} from "@/shared/components/ui/form"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/shared/components/ui/select"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

import type { Company } from "@/project/company/hooks/use-companies"

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
	const { data: equipmentsData } = useEquipments({ limit: 100, order: "asc", orderBy: "name" })
	const { data: usersData } = useUsers({ limit: 100 })

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
			workProgressStatus: [workOrder.workProgressStatus],
			estimatedEndDate: workOrder.estimatedEndDate ?? undefined,
			equipment: workOrder.equipment.map((equipment) => equipment.id),
			solicitationDate: new Date(workOrder.solicitationDate) ?? new Date(),
			solicitationTime: workOrder.solicitationTime ?? new Date().toTimeString().split(" ")[0],
			endReport: workOrder.endReport
				? [
						{
							url: workOrder.endReport.url,
						},
					]
				: undefined,
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
		console.log(form.formState.errors)
	}, [form.formState.errors])

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

	async function onSubmit(values: UpdateWorkOrderSchema) {
		setIsSubmitting(true)

		try {
			const file = form.getValues("endReport")?.[0]
			let endReport: UploadResult[] | undefined

			if (file) {
				endReport = await uploadFilesToCloud({
					files: [file],
					containerType: "files",
					nameStrategy: "original",
					randomString: workOrder.id,
				})
			}

			const { ok, message } = await updateWorkOrderById({
				id: workOrder.id,
				values: {
					endReport: undefined,
					...values,
				},
				endReport,
			})

			if (!ok) throw new Error(message)

			toast.success("Orden de trabajo actualizada exitosamente")
			queryClient.invalidateQueries({
				queryKey: [
					"workOrders",
					{
						companyId: null,
					},
				],
			})
			setOpen(false)
			form.reset()
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
				className="text-muted-foreground hover:bg-accent flex w-full cursor-pointer items-center justify-start gap-2 rounded-md bg-transparent px-3 py-1 text-sm font-medium hover:scale-100 hover:text-white"
				onClick={() => setOpen(true)}
			>
				<SquarePen className="h-4 w-4" />
				Editar
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-xl">
				<SheetHeader className="shadow">
					<SheetTitle>Editar Orden de Trabajo</SheetTitle>
					<SheetDescription>
						Complete la información en el formulario para editar la OT.
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
								Información útil para editar la Orden de Trabajo.
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

						<SliderFormField<UpdateWorkOrderSchema>
							label="Progreso"
							control={form.control}
							name="workProgressStatus"
							itemClassName="sm:col-span-2"
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
							name="estimatedDays"
							control={form.control}
							label="Días Estimados"
						/>

						<DatePickerFormField<UpdateWorkOrderSchema>
							name="estimatedEndDate"
							control={form.control}
							label="Fecha Final Estimada"
						/>

						<InputFormField<UpdateWorkOrderSchema>
							type="number"
							name="estimatedHours"
							control={form.control}
							label="Horas Estimadas"
						/>

						<Separator className="my-2 sm:col-span-2" />

						<FileTable<UpdateWorkOrderSchema>
							name="endReport"
							isMultiple={false}
							label="Reporte Final"
							control={form.control}
							className="my-4 sm:col-span-2"
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
							label="Actualizar OT"
							isSubmitting={isSubmitting}
							className="bg-orange-600 text-white hover:bg-orange-600 hover:text-white"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
