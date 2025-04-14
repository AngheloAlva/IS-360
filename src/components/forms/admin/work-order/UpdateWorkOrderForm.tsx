"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { toast } from "sonner"

import { WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { WorkOrderCAPEXOptions } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { getEquipment } from "@/actions/equipments/getEquipment"
import { getInternalUsers } from "@/actions/users/getUsers"
import { useCompanies } from "@/hooks/use-companies"
import { cn } from "@/lib/utils"
import {
	updateWorkOrderSchema,
	type UpdateWorkOrderSchema,
} from "@/lib/form-schemas/admin/work-order/updateWorkOrder.schema"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import MultipleSelector from "@/components/ui/multiselect"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import SafetyTalksInfo from "./SafetyTalksInfo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

import type { Equipment, User, WorkOrder } from "@prisma/client"
import type { Company } from "@/hooks/use-companies"
import { updateWorkOrderById } from "@/actions/work-orders/updateWorkOrderById"

interface UpdateWorkOrderFormProps {
	workOrder: WorkOrder & { equipment: Equipment[] }
}

export default function UpdateWorkOrderForm({
	workOrder,
}: UpdateWorkOrderFormProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [equipments, setEquipments] = useState<
		Array<{
			value: string
			label: string
		}>
	>([])
	const [internalUsers, setInternalUsers] = useState<User[]>([])
	const [isEquipmentsLoading, setIsEquipmentsLoading] = useState<boolean>(false)
	const [isInternalUsersLoading, setIsInternalUsersLoading] = useState<boolean>(false)
	const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined)

	const { data: companiesData, isLoading: isCompaniesLoading } = useCompanies({ limit: 100 })

	const router = useRouter()

	const form = useForm<UpdateWorkOrderSchema>({
		resolver: zodResolver(updateWorkOrderSchema),
		defaultValues: {
			type: workOrder.type,
			status: workOrder.status,
			priority: workOrder.priority,
			companyId: workOrder.companyId,
			workRequest: workOrder.workRequest,
			breakDays: `${workOrder.breakDays}`,
			capex: workOrder.capex ?? undefined,
			supervisorId: workOrder.supervisorId,
			responsibleId: workOrder.responsibleId,
			estimatedDays: `${workOrder.estimatedDays}`,
			programDate: new Date(workOrder.programDate),
			estimatedHours: `${workOrder.estimatedHours}`,
			requiresBreak: workOrder.requiresBreak ?? false,
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
				companiesData.companies.find((company) => company.id === workOrder.companyId)
			)
		}
	}, [companiesData, workOrder.companyId])

	useEffect(() => {
		const fetchInternalUsers = async () => {
			setIsInternalUsersLoading(true)
			const { data, ok } = await getInternalUsers(100, 1)

			if (!ok || !data) {
				toast("Error al cargar los usuarios internos", {
					description: "Error al cargar los usuarios internos",
					duration: 5000,
				})
				return
			}

			setInternalUsers(data)
			setIsInternalUsersLoading(false)
		}

		void fetchInternalUsers()
	}, [])

	useEffect(() => {
		const fetchEquipments = async () => {
			setIsEquipmentsLoading(true)
			const { data, ok } = await getEquipment(1000, 1)

			if (!ok || !data) {
				toast("Error al cargar los equipos", {
					description: "Error al cargar los equipos",
					duration: 5000,
				})
				return
			}

			const equipments = data.map((equipment) => ({
				value: equipment.id,
				label: equipment.tag + " - " + equipment.name,
			}))

			setEquipments(equipments)
			setIsEquipmentsLoading(false)
		}

		void fetchEquipments()
	}, [])

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
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="mx-auto flex w-full max-w-screen-xl flex-col gap-4"
			>
				<Card className="w-full">
					<CardContent className="grid gap-x-4 gap-y-5 md:grid-cols-2">
						<h2 className="text-xl font-bold md:col-span-2">Información General</h2>

						<FormField
							control={form.control}
							name="responsibleId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Responsable</FormLabel>
									{isInternalUsersLoading ? (
										<FormControl>
											<Skeleton className="h-10 w-full" />
										</FormControl>
									) : (
										<Select
											disabled={!internalUsers}
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona un responsable" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{internalUsers.map((user) => (
													<SelectItem key={user.id} value={user.id}>
														{user.name}
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
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tipo de Trabajo</FormLabel>

									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger className="border-gray-200">
												<SelectValue placeholder="Seleccione el tipo de trabajo" />
											</SelectTrigger>
										</FormControl>
										<SelectContent className="text-neutral-700">
											{WorkOrderTypeOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="solicitationDate"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Fecha de Solicitud</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={"outline"}
													className={cn(
														"w-full border-gray-200 bg-white pl-3 text-left font-normal",
														!field.value && "text-muted-foreground"
													)}
												>
													{field.value ? (
														format(field.value, "PPP", { locale: es })
													) : (
														<span>Pick a date</span>
													)}
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
												disabled={(date) => date < new Date("1900-01-01")}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="solicitationTime"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Hora de Solicitud</FormLabel>
									<Input value={field.value} onChange={field.onChange} />
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="workRequest"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Trabajo Solicitado</FormLabel>
									<Input value={field.value} onChange={field.onChange} />
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="priority"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Prioridad</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<SelectTrigger>
											<SelectValue placeholder="Seleccione una prioridad" />
										</SelectTrigger>
										<SelectContent>
											{WorkOrderPriorityOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="capex"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>CAPEX</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<SelectTrigger>
											<SelectValue placeholder="Seleccione un indicador" />
										</SelectTrigger>
										<SelectContent>
											{WorkOrderCAPEXOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="workProgressStatus"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Estado de Progreso</FormLabel>
									<FormControl>
										<div className="flex items-center gap-1">
											<Input value={field.value} onChange={field.onChange} type="number" />
											<Button
												disabled
												size={"icon"}
												type="button"
												variant={"outline"}
												className="border-input bg-transparent hover:bg-transparent disabled:opacity-100"
											>
												%
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="equipment"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Equipo(s)</FormLabel>
									<FormControl>
										{isEquipmentsLoading ? (
											<Skeleton className="h-9 w-full rounded-md" />
										) : (
											<MultipleSelector
												value={equipments.filter((equipment) =>
													field.value?.includes(equipment.value)
												)}
												options={equipments}
												placeholder="Seleccione uno o más equipos"
												commandProps={{
													label: "Equipos",
												}}
												hideClearAllButton
												hidePlaceholderWhenSelected
												emptyIndicator={
													<p className="text-center text-sm">No hay más equipos disponibles</p>
												}
												onChange={(options) => {
													field.onChange(options.map((option) => option.value))
												}}
											/>
										)}
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="workDescription"
							render={({ field }) => (
								<FormItem className="flex flex-col md:col-span-2">
									<FormLabel>Descripción del Trabajo</FormLabel>
									<Textarea value={field.value} onChange={field.onChange} className="min-h-32" />
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="grid w-full gap-x-3 gap-y-5 md:grid-cols-2">
						<div className="md:col-span-2">
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
										onValueChange={(value) => {
											const company = companiesData?.companies.find((c) => c.id === value)
											setSelectedCompany(company)
											form.setValue("companyId", value)
										}}
										defaultValue={workOrder.companyId}
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
					</CardContent>
				</Card>

				<Card className="w-full">
					<CardContent className="grid gap-x-4 gap-y-5 md:grid-cols-2">
						<h2 className="text-xl font-bold md:col-span-2">Fechas y Horas</h2>

						<FormField
							control={form.control}
							name="programDate"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Fecha Programada</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={"outline"}
													className={cn(
														"w-full border-gray-200 bg-white pl-3 text-left font-normal",
														!field.value && "text-muted-foreground"
													)}
												>
													{field.value ? (
														format(field.value, "PPP", { locale: es })
													) : (
														<span>Seleccione una fecha</span>
													)}
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
												disabled={(date) => date < new Date("1900-01-01")}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="estimatedHours"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Horas Estimadas</FormLabel>
									<Input value={field.value} onChange={field.onChange} type="number" min="1" />
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="estimatedDays"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Días Estimados</FormLabel>
									<Input value={field.value} onChange={field.onChange} type="number" min="1" />
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				<Button className="mt-4 w-full" type="submit" size={"lg"} disabled={isSubmitting}>
					{!isSubmitting ? (
						`Actualizar ${workOrder.otNumber}`
					) : (
						<div role="status" className="flex items-center justify-center">
							<svg
								aria-hidden="true"
								className="fill-primary h-8 w-8 animate-spin text-gray-200 dark:text-gray-600"
								viewBox="0 0 100 101"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
									fill="currentColor"
								/>
								<path
									d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
									fill="currentFill"
								/>
							</svg>
							<span className="sr-only">Cargando...</span>
						</div>
					)}
				</Button>
			</form>
		</Form>
	)
}
