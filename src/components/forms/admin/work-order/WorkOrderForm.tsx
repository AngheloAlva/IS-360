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
import { createWorkOrder } from "@/actions/work-orders/createWorkOrder"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { getEquipment } from "@/actions/equipments/getEquipment"
import { getCompanies } from "@/actions/companies/getCompanies"
import { getInternalUsers } from "@/actions/users/getUsers"
import { cn } from "@/lib/utils"
import {
	workOrderSchema,
	WorkOrderSchema,
} from "@/lib/form-schemas/admin/work-order/workOrder.schema"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
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

import type { Company, Equipment, User } from "@prisma/client"

type CompanyWithUsers = Company & { users: User[] }

export default function WorkOrderForm(): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [equipments, setEquipments] = useState<Equipment[]>([])
	const [internalUsers, setInternalUsers] = useState<User[]>([])
	const [companies, setCompanies] = useState<CompanyWithUsers[]>([])
	const [isCompaniesLoading, setIsCompaniesLoading] = useState<boolean>(false)
	const [isEquipmentsLoading, setIsEquipmentsLoading] = useState<boolean>(false)
	const [isInternalUsersLoading, setIsInternalUsersLoading] = useState<boolean>(false)
	const [selectedCompany, setSelectedCompany] = useState<CompanyWithUsers | undefined>(undefined)

	const router = useRouter()

	const form = useForm<WorkOrderSchema>({
		resolver: zodResolver(workOrderSchema),
		defaultValues: {
			companyId: "",
			breakDays: "0",
			workRequest: "",
			supervisorId: "",
			responsibleId: "",
			estimatedDays: "0",
			estimatedHours: "0",
			workDescription: "",
			requiresBreak: false,
			programDate: new Date(),
			estimatedEndDate: new Date(),
			solicitationDate: new Date(),
			solicitationTime: new Date().toTimeString().split(" ")[0],
		},
	})

	useEffect(() => {
		const fetchCompanies = async () => {
			setIsCompaniesLoading(true)
			const { data, ok } = await getCompanies(100, 1)

			if (!ok || !data) {
				toast("Error al cargar las empresas", {
					description: "Error al cargar las empresas",
					duration: 5000,
				})
				return
			}

			setCompanies(data)
			setIsCompaniesLoading(false)
		}

		void fetchCompanies()
	}, [])

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
			const { data, ok } = await getEquipment(100, 1)

			if (!ok || !data) {
				toast("Error al cargar los equipos", {
					description: "Error al cargar los equipos",
					duration: 5000,
				})
				return
			}

			setEquipments(data)
			setIsEquipmentsLoading(false)
		}

		void fetchEquipments()
	}, [])

	useEffect(() => {
		const company = companies.find((c) => c.id === form.watch("companyId"))
		setSelectedCompany(company)
		form.setValue("supervisorId", company?.users[0].id || "")
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("companyId")])

	async function onSubmit(values: WorkOrderSchema) {
		setIsSubmitting(true)

		try {
			const { ok } = await createWorkOrder({ values })

			if (!ok) {
				toast("Error al crear la solicitud", {
					description: "Error al crear la solicitud",
					duration: 5000,
				})
				return
			}

			toast("Solicitud creada exitosamente", {
				description: "Solicitud creada exitosamente",
				duration: 5000,
			})
			router.push(`/dashboard/admin/ordenes-de-trabajo/`)
		} catch (error) {
			toast("Error al crear la solicitud", {
				description: "Error al crear la solicitud" + error,
				duration: 5000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	useEffect(() => {
		console.log(form.formState.errors)
	}, [form.formState])

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="mx-auto grid w-full max-w-screen-xl gap-4 md:grid-cols-2"
			>
				<FormField
					control={form.control}
					name="responsibleId"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Responsable OTC</FormLabel>

							{isInternalUsersLoading ? (
								<Skeleton className="h-9 w-full rounded-md" />
							) : (
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger className="border-gray-200">
											<SelectValue placeholder="Seleccione al responsable" />
										</SelectTrigger>
									</FormControl>
									<SelectContent className="text-neutral-700">
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
							<FormLabel className="text-gray-700">Tipo de Trabajo</FormLabel>

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
						<FormItem className="flex flex-col pt-2.5">
							<FormLabel className="text-gray-700">Fecha de Solicitud</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-full border-gray-200 bg-white pl-3 text-left font-normal text-gray-700",
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
						<FormItem className="flex flex-col pt-2.5">
							<FormLabel className="text-gray-700">Hora de Solicitud</FormLabel>
							<Input value={field.value} onChange={field.onChange} />
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="workRequest"
					render={({ field }) => (
						<FormItem className="flex flex-col pt-2.5">
							<FormLabel className="text-gray-700">Trabajo Solicitado</FormLabel>
							<Input value={field.value} onChange={field.onChange} />
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="priority"
					render={({ field }) => (
						<FormItem className="flex flex-col pt-2.5">
							<FormLabel className="text-gray-700">Prioridad</FormLabel>
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
					name="companyId"
					render={({ field }) => (
						<FormItem className="flex flex-col pt-2.5">
							<FormLabel className="text-gray-700">Empresa Responsable</FormLabel>
							{isCompaniesLoading ? (
								<Skeleton className="h-10 w-full" />
							) : (
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<SelectTrigger>
										<SelectValue placeholder="Seleccione una empresa" />
									</SelectTrigger>
									<SelectContent>
										{companies.map((company) => (
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

				<div className="grid w-full grid-cols-2 pt-7">
					{selectedCompany && (
						<>
							<div>
								<p className="text-sm font-medium text-gray-700">Empresa seleccionada</p>
								<p className="text-sm text-gray-700">{selectedCompany.name}</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-700">Supervisor</p>
								<p className="text-sm text-gray-700">{selectedCompany.users[0].name}</p>
							</div>
						</>
					)}
				</div>

				<FormField
					control={form.control}
					name="workDescription"
					render={({ field }) => (
						<FormItem className="flex flex-col pt-2.5 md:col-span-2">
							<FormLabel className="text-gray-700">Descripción del Trabajo</FormLabel>
							<Textarea value={field.value} onChange={field.onChange} className="min-h-32" />
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="equipment"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Equipo</FormLabel>

							{isEquipmentsLoading ? (
								<Skeleton className="h-9 w-full rounded-md" />
							) : (
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger className="border-gray-200">
											<SelectValue placeholder="Seleccione el equipo" />
										</SelectTrigger>
									</FormControl>
									<SelectContent className="text-neutral-700">
										{equipments.map((equipment) => (
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

				<Separator className="my-4 md:col-span-2" />

				<FormField
					control={form.control}
					name="programDate"
					render={({ field }) => (
						<FormItem className="flex flex-col pt-2.5">
							<FormLabel className="text-gray-700">Fecha Programada</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-full border-gray-200 bg-white pl-3 text-left font-normal text-gray-700",
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
						<FormItem className="flex flex-col pt-2.5">
							<FormLabel className="text-gray-700">Horas Estimadas</FormLabel>
							<Input value={field.value} onChange={field.onChange} type="number" min="1" />
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="estimatedDays"
					render={({ field }) => (
						<FormItem className="flex flex-col pt-2.5">
							<FormLabel className="text-gray-700">Días Estimados</FormLabel>
							<Input value={field.value} onChange={field.onChange} type="number" min="1" />
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="requiresBreak"
					render={({ field }) => (
						<FormItem className="flex flex-col pt-2.5">
							<FormLabel className="text-gray-700">Requiere dias de paro</FormLabel>
							<FormControl>
								<Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-2" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button className="mt-4 md:col-span-2" type="submit" size={"lg"} disabled={isSubmitting}>
					{!isSubmitting ? (
						"Crear Nueva OT"
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
