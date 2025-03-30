"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { toast } from "sonner"

import { type WorkBookSchema, workBookSchema } from "@/lib/form-schemas/work-book/work-book.schema"
import { updateWorkOrderLikeBook } from "@/actions/work-orders/updateWorkOrder"
import { getWorkOrdersByCompanyId } from "@/actions/work-orders/getWorkOrders"
import { WORK_ORDER_PRIORITY_VALUES } from "@/lib/consts/work-order-priority"
import { WORK_ORDER_STATUS_VALUES } from "@/lib/consts/work-order-status"
import { WORK_ORDER_TYPE_VALUES } from "@/lib/consts/work-order-types"
import { getCompanyById } from "@/actions/companies/getCompanies"
import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "../ui/card"
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

import type { WorkOrder } from "@prisma/client"

interface WorkBookFormProps {
	userId: string
	companyId: string
}

type WorkOrderWithSupervisorAndResponsible = WorkOrder & {
	supervisor: {
		name: string
		id: string
		phone: string | null
	}
	responsible: {
		name: string
		id: string
		phone: string | null
	}
}

export default function WorkBookForm({ userId, companyId }: WorkBookFormProps): React.ReactElement {
	const [loading, setLoading] = useState<boolean>(false)
	const [workOrdersIsLoading, setWorkOrdersIsLoading] = useState<boolean>(true)
	const [workOrders, setWorkOrders] = useState<WorkOrderWithSupervisorAndResponsible[]>([])
	const [workOrderSelected, setWorkOrderSelected] =
		useState<WorkOrderWithSupervisorAndResponsible | null>(null)

	const router = useRouter()

	const form = useForm<WorkBookSchema>({
		resolver: zodResolver(workBookSchema),
		defaultValues: {
			workName: "",
			userId: userId,
			workOrderId: "",
			workLocation: "",
			workStartDate: new Date(),
		},
	})

	useEffect(() => {
		navigator.geolocation.getCurrentPosition((position) => {
			form.setValue("workLocation", `${position.coords.latitude},${position.coords.longitude}`)
		})
	}, [form])

	useEffect(() => {
		const fetchWorkOrders = async () => {
			const { ok, data } = await getWorkOrdersByCompanyId(companyId)

			if (!ok || !data) {
				toast("Error al cargar las ordenes de trabajo", {
					description: "Error al cargar las ordenes de trabajo",
					duration: 5000,
				})

				return
			}

			setWorkOrders(data)
			setWorkOrdersIsLoading(false)
		}

		void fetchWorkOrders()
	}, [companyId])

	useEffect(() => {
		const fetchCompanies = async () => {
			if (!companyId) return
			const { ok, data } = await getCompanyById(companyId)

			if (!ok || !data) {
				toast("Error al cargar la empresa", {
					description: "Error al cargar la empresa",
					duration: 5000,
				})

				return
			}
		}

		void fetchCompanies()
	}, [companyId])

	useEffect(() => {
		const workOrder = workOrders.find((workOrder) => workOrder.id === form.getValues("workOrderId"))
		if (!workOrder) return

		setWorkOrderSelected(workOrder)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("workOrderId")])

	async function onSubmit(values: WorkBookSchema) {
		try {
			setLoading(true)

			if (!workOrderSelected) {
				toast("Error al actualizar el libro de obras", {
					description: "Debe seleccionar una orden de trabajo.",
					duration: 5000,
				})

				return
			}

			const { ok, message } = await updateWorkOrderLikeBook({ id: workOrderSelected.id, values })

			if (ok) {
				toast("Libro de obras actualizado", {
					description: message,
					duration: 5000,
				})

				router.push(`/dashboard/libro-de-obras/${workOrderSelected.id}`)
			} else {
				toast("Error al actualizar el libro de obras", {
					description: message,
					duration: 5000,
				})
			}
		} catch (error) {
			console.error(error)

			toast("Ocurrió un error al intentar crear el registro", {
				description: (error as Error).message,
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex w-full max-w-screen-md flex-col gap-4"
			>
				<Card className="w-full">
					<CardContent className="flex flex-col gap-4">
						<h2 className="text-xl font-bold">Orden de Trabajo (OT)</h2>

						<FormField
							control={form.control}
							name="workOrderId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Número de OT</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Seleccione un número de OT" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{workOrdersIsLoading ? (
												<Skeleton className="h-8 w-full" />
											) : (
												workOrders.map((workOrder) => (
													<SelectItem key={workOrder.id} value={workOrder.id}>
														{workOrder.otNumber}
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{workOrderSelected && (
							<>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<h3 className="font-medium">Trabajo solicitado:</h3>
										<p>{workOrderSelected.workRequest}</p>
									</div>
									<div>
										<h3 className="font-medium">Tipo de trabajo:</h3>
										<p>{WORK_ORDER_TYPE_VALUES[workOrderSelected.type]}</p>
									</div>
									<div>
										<h3 className="font-medium">Estado:</h3>
										<p>{WORK_ORDER_STATUS_VALUES[workOrderSelected.status]}</p>
									</div>
									<div>
										<h3 className="font-medium">Prioridad:</h3>
										<p>{WORK_ORDER_PRIORITY_VALUES[workOrderSelected.priority]}</p>
									</div>
									<div>
										<h3 className="font-medium">Fecha de solicitud:</h3>
										<p>{workOrderSelected.solicitationDate.toLocaleDateString()}</p>
									</div>
									<div>
										<h3 className="font-medium">Descripción del trabajo:</h3>
										<p>{workOrderSelected.workDescription || "N/A"}</p>
									</div>
									<div>
										<h3 className="font-medium">Fecha programada:</h3>
										<p>{workOrderSelected.programDate.toLocaleDateString()}</p>
									</div>
									<div>
										<h3 className="font-medium">Horas estimadas:</h3>
										<p>{workOrderSelected.estimatedHours}</p>
									</div>
									<div>
										<h3 className="font-medium">Días estimados:</h3>
										<p>{workOrderSelected.estimatedDays}</p>
									</div>
								</div>
							</>
						)}
					</CardContent>
				</Card>

				<Card className="w-full">
					<CardContent className="grid gap-4 md:grid-cols-2">
						<h2 className="text-xl font-bold md:col-span-2">Datos Libro de Obras</h2>

						<FormField
							control={form.control}
							name="workName"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-gray-700">Nombre de la Obra</FormLabel>
									<FormControl>
										<Input
											className="w-full rounded-md bg-white text-sm text-gray-700"
											placeholder="Nombre de la obra"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="workStartDate"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Fecha de Inicio</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={"outline"}
													className={cn(
														"w-full rounded-md bg-white pl-3 text-left text-sm font-normal text-gray-700",
														!field.value && "text-muted-foreground"
													)}
												>
													{field.value ? (
														format(field.value, "PPP", { locale: es })
													) : (
														<span>Selecciona la fecha</span>
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
					</CardContent>
				</Card>

				<Button className="mt-4 w-full" type="submit" size={"lg"} disabled={loading}>
					{loading ? (
						<div role="status" className="flex items-center justify-center">
							<svg
								aria-hidden="true"
								className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
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
					) : (
						"Crear Libro de Obras"
					)}
				</Button>
			</form>
		</Form>
	)
}
