"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createMaintenancePlanTask } from "@/actions/maintenance-plan-task/createMaintenancePlanTask"
import { type Company, useCompanies } from "@/hooks/companies/use-companies"
import { WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { WorkOrderCAPEXOptions } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { TaskFrequencyOptions } from "@/lib/consts/task-frequency"
import { useEquipments } from "@/hooks/use-equipments"
import { useUsers } from "@/hooks/users/use-users"
import {
	maintenancePlanTaskSchema,
	type MaintenancePlanTaskSchema,
} from "@/lib/form-schemas/maintenance-plan/maintenance-plan-task.schema"

import { DatePickerFormField } from "../shared/DatePickerFormField"
import UploadFilesFormField from "../shared/UploadFilesFormField"
import { TextAreaFormField } from "../shared/TextAreaFormField"
import { SelectFormField } from "../shared/SelectFormField"
import { SwitchFormField } from "../shared/SwitchFormField"
import { InputFormField } from "../shared/InputFormField"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import SubmitButton from "../shared/SubmitButton"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormItem,
	FormField,
	FormLabel,
	FormMessage,
	FormControl,
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

interface MaintenancePlanTaskFormProps {
	maintenancePlanSlug: string
	userId: string
}

export default function MaintenancePlanTaskForm({
	maintenancePlanSlug,
	userId,
}: MaintenancePlanTaskFormProps): React.ReactElement {
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const router = useRouter()

	const form = useForm<MaintenancePlanTaskSchema>({
		resolver: zodResolver(maintenancePlanTaskSchema),
		defaultValues: {
			name: "",
			attachments: [],
			description: "",
			estimatedDays: "1",
			estimatedHours: "0",
			createdById: userId,
			maintenancePlanSlug,
			nextDate: undefined,
			companyId: undefined,
			frequency: undefined,
			equipmentId: undefined,
			responsibleId: undefined,
			workOrderType: undefined,
			workOrderCapex: undefined,
			workOrderPriority: undefined,
			isInternalResponsible: false,
		},
	})

	const { data: equipmentsData, isLoading: isEquipmentsLoading } = useEquipments({ limit: 1000 })
	const { data: companiesData, isLoading: isCompaniesLoading } = useCompanies({ limit: 1000 })
	const { data: usersData } = useUsers({ limit: 1000, showOnlyInternal: true })

	const isInternalResponsible = form.watch("isInternalResponsible")

	const onSubmit = async (values: MaintenancePlanTaskSchema) => {
		setIsSubmitting(true)

		try {
			const { ok, message } = await createMaintenancePlanTask({ values })

			if (ok) {
				toast.success("Tarea de mantenimiento creada exitosamente", {
					description: "La tarea de mantenimiento ha sido creada exitosamente",
					duration: 3000,
				})
				setOpen(false)
				router.refresh()
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
				<Button size={"lg"} className="bg-primary hover:bg-primary/80 text-white">
					<Plus />
					Tarea
					<span className="hidden sm:inline"> de Mantenimiento</span>
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

						<FormField
							control={form.control}
							name="equipmentId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Equipo</FormLabel>
									{isEquipmentsLoading ? (
										<FormControl>
											<Skeleton className="h-10 w-full" />
										</FormControl>
									) : (
										<Select
											disabled={!equipmentsData}
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona el equipo" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="max-w-[var(--radix-select-trigger-width)]">
												{equipmentsData?.equipments?.map((equipment) => (
													<SelectItem key={equipment.id} value={equipment.id}>
														{equipment.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
									<FormMessage />
								</FormItem>
							)}
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

						<UploadFilesFormField<MaintenancePlanTaskSchema>
							name="attachments"
							control={form.control}
							selectedFileIndex={selectedFileIndex}
							setSelectedFileIndex={setSelectedFileIndex}
							containerClassName="sm:col-span-2"
						/>

						<Separator className="sm:col-span-2" />

						<div className="flex flex-col sm:col-span-2">
							<h2 className="text-text w-fit text-xl font-bold sm:col-span-2">
								Información del Responsable
							</h2>
							<p className="text-muted-foreground w-fit">Información del responsable de la tarea</p>
						</div>

						<SwitchFormField<MaintenancePlanTaskSchema>
							name="isInternalResponsible"
							label="¿Es responsable interno?"
							control={form.control}
							itemClassName="sm:col-span-2"
						/>

						{!isInternalResponsible ? (
							<>
								<FormField
									control={form.control}
									name="companyId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Empresa</FormLabel>
											{isCompaniesLoading ? (
												<FormControl>
													<Skeleton className="h-10 w-full" />
												</FormControl>
											) : (
												<Select
													disabled={!companiesData}
													onValueChange={(value) => {
														field.onChange(value)
														setSelectedCompany(
															companiesData?.companies.find((company) => company.id === value) ||
																null
														)
													}}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Selecciona la empresa" />
														</SelectTrigger>
													</FormControl>
													<SelectContent className="max-w-[var(--radix-select-trigger-width)]">
														{companiesData?.companies?.map((company) => (
															<SelectItem key={company.id} value={company.id}>
																{company.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="responsibleId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Responsable</FormLabel>
											<Select
												disabled={!selectedCompany}
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Selecciona un responsable" />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="max-w-[var(--radix-select-trigger-width)]">
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
							</>
						) : (
							<FormField
								control={form.control}
								name="responsibleId"
								render={({ field }) => (
									<FormItem className="sm:col-span-2">
										<FormLabel>Responsable Interno</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona un responsable interno" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="max-w-[var(--radix-select-trigger-width)]">
												{usersData?.users.map((user) => (
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

						<Separator className="sm:col-span-2" />

						<div className="flex flex-col sm:col-span-2">
							<h2 className="text-text w-fit text-xl font-bold sm:col-span-2">
								Información para la orden de trabajo
							</h2>
							<p className="text-muted-foreground w-fit">
								Información que se requiere para la creación de la orden de trabajo
							</p>
						</div>

						<InputFormField<MaintenancePlanTaskSchema>
							type="number"
							name="estimatedDays"
							label="Días estimados"
							control={form.control}
							placeholder="Días estimados"
						/>

						<InputFormField<MaintenancePlanTaskSchema>
							type="number"
							name="estimatedHours"
							label="Horas estimadas"
							control={form.control}
							placeholder="Horas estimadas"
						/>

						<SelectFormField<MaintenancePlanTaskSchema>
							control={form.control}
							name="workOrderPriority"
							options={WorkOrderPriorityOptions}
							label="Prioridad de la orden de trabajo"
							placeholder="Prioridad de la orden de trabajo"
						/>

						<SelectFormField<MaintenancePlanTaskSchema>
							control={form.control}
							name="workOrderType"
							options={WorkOrderTypeOptions}
							label="Tipo de la orden de trabajo"
							placeholder="Tipo de la orden de trabajo"
						/>

						<SelectFormField<MaintenancePlanTaskSchema>
							control={form.control}
							name="workOrderCapex"
							options={WorkOrderCAPEXOptions}
							label="Capex de la orden de trabajo"
							placeholder="Capex de la orden de trabajo"
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
