"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { createWorkOrder } from "@/actions/work-orders/createWorkOrder"
import { WorkOrderCAPEXOptions } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { getEquipment } from "@/actions/equipments/getEquipment"
import { useCompanies } from "@/hooks/companies/use-companies"
import { getInternalUsers } from "@/actions/users/getUsers"
import { uploadFilesToCloud } from "@/lib/upload-files"
import {
	workOrderSchema,
	type WorkOrderSchema,
} from "@/lib/form-schemas/admin/work-order/workOrder.schema"

import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import UploadFilesFormField from "../../shared/UploadFilesFormField"
import MultipleSelector from "@/components/ui/multiselect"
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
import type { User } from "@prisma/client"

export default function CreateWorkOrderForm(): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [equipments, setEquipments] = useState<
		Array<{
			value: string
			label: string
		}>
	>([])
	const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined)
	const [isInternalUsersLoading, setIsInternalUsersLoading] = useState<boolean>(false)
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [isEquipmentsLoading, setIsEquipmentsLoading] = useState<boolean>(false)
	const [internalUsers, setInternalUsers] = useState<User[]>([])
	const [open, setOpen] = useState(false)

	const { data: companiesData, isLoading: isCompaniesLoading } = useCompanies({ limit: 100 })

	const router = useRouter()

	const form = useForm<WorkOrderSchema>({
		resolver: zodResolver(workOrderSchema),
		defaultValues: {
			companyId: "",
			equipment: [],
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
				label: equipment.name,
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

	async function onSubmit(values: WorkOrderSchema) {
		const initReportFile = form.getValues("file")?.[0]

		setIsSubmitting(true)

		try {
			if (initReportFile && initReportFile.file) {
				const fileExtension = initReportFile.file.name.split(".").pop()
				const uniqueFilename = `${Date.now()}-${Math.random()
					.toString(36)
					.substring(2, 9)}-${values.companyId.slice(0, 4)}.${fileExtension}`

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
				})

				if (!ok) throw new Error(message)
			} else {
				const { ok, message } = await createWorkOrder({
					values,
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

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className="bg-primary hover:bg-primary/80 flex h-10 items-center justify-center gap-1 rounded-md px-3 text-sm text-white"
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

						<SelectFormField<WorkOrderSchema>
							name="type"
							control={form.control}
							label="Tipo de Trabajo"
							options={WorkOrderTypeOptions}
							placeholder="Seleccione el tipo de trabajo"
						/>

						<DatePickerFormField<WorkOrderSchema>
							control={form.control}
							name="solicitationDate"
							label="Fecha de Solicitud"
						/>

						<InputFormField<WorkOrderSchema>
							name="solicitationTime"
							label="Hora de Solicitud"
							control={form.control}
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

						<FormField
							control={form.control}
							name="equipment"
							render={({ field }) => (
								<FormItem className="sm:col-span-2">
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
												className="border-input"
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

						<DatePickerFormField<WorkOrderSchema>
							name="programDate"
							label="Fecha Programada"
							control={form.control}
						/>

						<InputFormField<WorkOrderSchema>
							type="number"
							name="estimatedHours"
							control={form.control}
							label="Horas Estimadas"
						/>

						<InputFormField<WorkOrderSchema>
							type="number"
							name="estimatedDays"
							control={form.control}
							label="Días Estimados"
						/>

						<Separator className="my-2 sm:col-span-2" />

						<div className="sm:col-span-2">
							<h2 className="text-xl font-bold">Reporte Inicial</h2>
							<span className="text-muted-foreground text-sm">
								Reporte inicial relacionado con el trabajo a realizar.
							</span>
						</div>

						<UploadFilesFormField
							name="file"
							maxFileSize={200}
							isMultiple={false}
							control={form.control}
							selectedFileIndex={selectedFileIndex}
							containerClassName="w-full sm:col-span-2"
							setSelectedFileIndex={setSelectedFileIndex}
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
