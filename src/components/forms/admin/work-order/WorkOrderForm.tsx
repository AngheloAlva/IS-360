"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { CalendarIcon, UploadCloud, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { toast } from "sonner"

import { WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { createWorkOrder } from "@/actions/work-orders/createWorkOrder"
import { WorkOrderCAPEXOptions } from "@/lib/consts/work-order-capex"
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
import MultipleSelector from "@/components/ui/multiselect"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
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

import type { Company, User } from "@prisma/client"

type CompanyWithUsers = Company & { users: User[] }

export default function WorkOrderForm(): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [equipments, setEquipments] = useState<
		Array<{
			value: string
			label: string
		}>
	>([])
	const [internalUsers, setInternalUsers] = useState<User[]>([])
	const [companies, setCompanies] = useState<CompanyWithUsers[]>([])
	const [isCompaniesLoading, setIsCompaniesLoading] = useState<boolean>(false)
	const [isEquipmentsLoading, setIsEquipmentsLoading] = useState<boolean>(false)
	const [isInternalUsersLoading, setIsInternalUsersLoading] = useState<boolean>(false)
	const [selectedCompany, setSelectedCompany] = useState<CompanyWithUsers | undefined>(undefined)
	const [initReportFile, setInitReportFile] = useState<File | null>(null)
	const [initReportPreview, setInitReportPreview] = useState<string | null>(null)

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
			const { data, ok } = await getCompanies(100, 1, true)

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
		const company = companies.find((c) => c.id === form.watch("companyId"))
		setSelectedCompany(company)
		form.setValue("supervisorId", company?.users[0]?.id || "")
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("companyId")])

	useEffect(() => {
		const estimatedHours = Number(form.watch("estimatedHours"))
		const estimatedDays = Math.ceil(estimatedHours / 8)

		form.setValue("estimatedDays", estimatedDays.toString())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("estimatedHours")])

	const handleFileChange = (file: File | null) => {
		if (!file) return

		// Validación de tamaño (20MB)
		if (file.size > 20_000_000) {
			toast.error("Archivo demasiado grande", {
				description: "El tamaño máximo permitido es 20MB",
			})
			return
		}

		// Validación de tipo
		const validTypes = /\.(pdf|docx?|xlsx?|pptx?|txt)$/i
		if (!validTypes.test(file.name)) {
			toast.error("Formato no soportado (solo PDF, DOCX, XLSX, PPTX, TXT)")
			return
		}

		setInitReportFile(file)

		if (file.type.startsWith("image/")) {
			const reader = new FileReader()
			reader.onload = (e) => setInitReportPreview(e.target?.result as string)
			reader.readAsDataURL(file)
		} else {
			setInitReportPreview(null)
		}
	}

	async function onSubmit(values: WorkOrderSchema) {
		setIsSubmitting(true)

		try {
			if (initReportFile) {
				const fileExtension = initReportFile.name.split(".").pop()
				const uniqueFilename = `${Date.now()}-${Math.random()
					.toString(36)
					.substring(2, 9)}-${values.companyId.slice(0, 4)}.${fileExtension}`

				const response = await fetch("/api/file", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						filenames: [uniqueFilename],
						containerType: "files",
					}),
				})

				if (!response.ok) throw new Error("Error al obtener URL de subida")

				const data = await response.json()
				if (!data.urls?.[0]) throw new Error("Respuesta inválida del servidor")

				const uploadResponse = await fetch(data.urls[0], {
					method: "PUT",
					body: initReportFile,
					headers: {
						"Content-Type": initReportFile.type,
						"x-ms-blob-type": "BlockBlob",
						"x-ms-version": "2020-04-08",
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "PUT",
						"Access-Control-Allow-Headers": "*",
					},
					mode: "cors",
					credentials: "omit",
				})

				if (!uploadResponse.ok) throw new Error("Error al subir el archivo")

				const blobUrl = data.urls[0].split("?")[0]

				const { ok, message } = await createWorkOrder({
					values,
					initReportFile: {
						fileUrl: blobUrl,
						fileType: initReportFile.type,
						fileName: values.workRequest + "-" + initReportFile.name,
					},
				})

				if (!ok) throw new Error(message)
			} else {
				const { ok, message } = await createWorkOrder({
					values,
				})

				if (!ok) throw new Error(message)
			}

			toast.success("Solicitud creada exitosamente")
			router.push(`/admin/dashboard/ordenes-de-trabajo/`)
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
									<FormLabel>Responsable OTC</FormLabel>

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
					<CardContent className="grid gap-x-4 gap-y-5 md:grid-cols-2">
						<div className="md:col-span-2">
							<h2 className="text-xl font-bold">Empresa Colaboradora</h2>
							<span className="text-muted-foreground text-sm">
								Sólo se muestran las empresas que tengan uno o más supervisores asignados
							</span>
						</div>

						<FormField
							control={form.control}
							name="companyId"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Empresa Responsable</FormLabel>
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
						<div className="grid w-full grid-cols-2 pt-4.5">
							{selectedCompany && (
								<>
									<div>
										<p className="text-sm font-medium">Empresa seleccionada</p>
										<p className="text-sm">{selectedCompany.name}</p>
									</div>
									<div>
										<p className="text-sm font-medium">Supervisor</p>
										<p className="text-sm">{selectedCompany.users[0]?.name}</p>
									</div>
								</>
							)}
						</div>
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

				<Card className="w-full">
					<CardContent className="grid gap-x-4 gap-y-5 pb-10 md:grid-cols-2">
						<h2 className="text-xl font-bold md:col-span-2">Reporte Inicial</h2>

						<div className="space-y-4">
							<FormLabel>Subir Archivo</FormLabel>
							<div
								className={cn(
									"group relative h-full cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
									!initReportFile
										? "border-blue-200 bg-blue-50 hover:border-blue-300"
										: "border-green-200 bg-green-50"
								)}
								onDrop={(e) => {
									e.preventDefault()
									handleFileChange(e.dataTransfer.files?.[0] ?? null)
								}}
								onDragOver={(e) => e.preventDefault()}
							>
								<Input
									type="file"
									className="absolute inset-0 h-full w-full opacity-0"
									onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
									accept=".pdf, image/*, .doc, .docx, .xls, .xlsx"
								/>
								<div className="flex flex-col items-center gap-4">
									<UploadCloud className="h-12 w-12 text-gray-400" />
									<div>
										<p className="font-medium text-gray-700">
											{initReportFile ? "¡Archivo listo!" : "Arrastra tu archivo aquí"}
										</p>
										<p className="mt-2 text-sm text-gray-500">
											Formatos soportados: PDF, DOC, XLS, JPG, PNG
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<FormLabel>Previsualización</FormLabel>
							<div className="h-full rounded-lg border-2 border-dashed border-gray-200 p-4">
								{initReportFile ? (
									<div className="flex h-full flex-col items-center justify-center">
										{initReportPreview ? (
											<>
												{/* eslint-disable-next-line @next/next/no-img-element */}
												<img
													alt="Previsualización"
													src={initReportPreview}
													className="mb-4 max-h-40 object-contain"
												/>
												<p className="max-w-full truncate text-sm font-medium">
													{initReportFile.name}
												</p>
											</>
										) : (
											<>
												<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
													<span className="text-3xl">📄</span>
												</div>
												<p className="max-w-full truncate text-sm font-medium">
													{initReportFile.name}
												</p>
												<p className="mt-1 text-xs text-gray-500">
													{(initReportFile.size / 1024).toFixed(2)} KB
												</p>
											</>
										)}
										<Button
											type="button"
											variant={"ghost"}
											onClick={() => {
												setInitReportFile(null)
												setInitReportPreview(null)
											}}
											className="mt-4 flex items-center gap-1 text-red-600 hover:bg-red-100 hover:text-red-700"
										>
											<X className="h-4 w-4" />
											<span className="text-sm">Eliminar</span>
										</Button>
									</div>
								) : (
									<div className="flex h-full items-center justify-center text-gray-400">
										<p>Previsualización del documento</p>
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				<Button className="mt-4 w-full" type="submit" size={"lg"} disabled={isSubmitting}>
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
