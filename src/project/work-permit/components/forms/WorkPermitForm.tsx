"use client"

import { InfoIcon, UsersIcon, Trash2Icon, Layers2Icon, CirclePlusIcon } from "lucide-react"
import { endOfWeek, isSunday, nextMonday, format } from "date-fns"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { es } from "date-fns/locale"
import { toast } from "sonner"

import { useWorkOrders, WorkOrder } from "@/project/work-order/hooks/use-work-order"
import { createWorkPermit } from "@/project/work-permit/actions/createWorkPermit"
import { useUsersByCompany } from "@/project/user/hooks/use-users-by-company"
import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { updateWorkPermit } from "../../actions/updateWorkPermit"
import { WORK_ORDER_PRIORITY } from "@/generated/prisma/enums"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"
import {
	createWorkPermitSchema,
	type WorkPermitSchema,
} from "@/project/work-permit/schemas/work-permit.schema"
import {
	ToolsOptions,
	MutualityOptions,
	PreChecksOptions,
	WorkWillBeOptions,
	WasteTypesOptions,
} from "@/lib/consts/work-permit-options"

import ActivityChangesDialog, { useActivityChangesDialog } from "../dialogs/ActivityChangesDialog"
import { ActivityRow } from "./ActivityCard"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
import { MultiSelectFormField } from "@/shared/components/forms/MultiSelectFormField"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import PrintReminderDialog from "../dialogs/PrintReminderDialog"
import { Separator } from "@/shared/components/ui/separator"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Form } from "@/shared/components/ui/form"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

import type { WorkPermit } from "../../hooks/use-work-permit"

interface WorkPermitFormProps {
	userName: string
	companyId: string
	isOtcMember?: boolean
	initialValues?: WorkPermit
}

export default function WorkPermitForm({
	userName,
	companyId,
	initialValues,
	isOtcMember = false,
}: WorkPermitFormProps): React.ReactElement {
	const [workOrderSelected, setWorkOrderSelected] = useState<WorkOrder | null>(null)
	const [expirationMessage, setExpirationMessage] = useState("")
	const [showPrintDialog, setShowPrintDialog] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { shouldShow: shouldShowChanges } = useActivityChangesDialog()
	const [showChangesDialog, setShowChangesDialog] = useState(shouldShowChanges)

	const form = useForm<WorkPermitSchema>({
		resolver: zodResolver(createWorkPermitSchema(isOtcMember)),
		defaultValues: {
			tools: initialValues?.tools || [],
			acceptTerms: isOtcMember ? true : false,
			isUrgent: initialValues?.isUrgent || false,
			preChecks: initialValues?.preChecks || [],
			wasteType: initialValues?.wasteType || "",
			mutuality: initialValues?.mutuality || "",
			exactPlace: initialValues?.exactPlace || "",
			otherTools: initialValues?.otherTools || "",
			workWillBe: initialValues?.workWillBe || "",
			aplicantPt: initialValues?.user.name || userName,
			otNumber: initialValues?.otNumber?.otNumber || "",
			otherMutuality: initialValues?.otherMutuality || "",
			otherPreChecks: initialValues?.otherPreChecks || "",
			generateWaste: initialValues?.generateWaste || false,
			workWillBeOther: initialValues?.workWillBeOther || "",
			additionalObservations: initialValues?.observations || "",
			wasteDisposalLocation: initialValues?.wasteDisposalLocation || "",
			otherWasteDisposalLocation: initialValues?.otherWasteDisposalLocation || "",
			endDate: initialValues?.endDate ? new Date(initialValues?.endDate) : undefined,
			startDate: initialValues?.startDate ? new Date(initialValues?.startDate) : undefined,
			activityDetails: initialValues?.activities?.length
				? initialValues.activities
						.sort((a, b) => a.order - b.order)
						.map((a) => ({
							activity: a.activity,
							peligros: a.peligros,
							riesgos: a.riesgos,
							medidasDeControl: a.medidasDeControl,
							otroPeligro: a.otroPeligro || "",
							otroRiesgo: a.otroRiesgo || "",
							otraMedidaDeControl: a.otraMedidaDeControl || "",
						}))
				: [
						{
							activity: "",
							peligros: [],
							riesgos: [],
							medidasDeControl: [],
							otroPeligro: "",
							otroRiesgo: "",
							otraMedidaDeControl: "",
						},
						{
							activity: "",
							peligros: [],
							riesgos: [],
							medidasDeControl: [],
							otroPeligro: "",
							otroRiesgo: "",
							otraMedidaDeControl: "",
						},
					],
			participants: initialValues?.participants.map((participant) => ({
				userId: participant.id,
			})) || [
				{},
				{
					userId: "",
				},
			],
		},
	})

	const router = useRouter()

	const getPermitExpirationDate = (startDate: Date, otEndDate: Date | null): Date => {
		const upcomingSunday = endOfWeek(startDate, { weekStartsOn: 1 })

		const adjustedUpcomingSunday = isSunday(startDate)
			? endOfWeek(nextMonday(startDate), { weekStartsOn: 1 })
			: upcomingSunday

		if (!otEndDate) return adjustedUpcomingSunday

		return otEndDate < adjustedUpcomingSunday ? otEndDate : adjustedUpcomingSunday
	}

	const getPermitExpirationMessage = (startDate: Date, endDate: Date): string => {
		const formattedEndDate = format(endDate, "EEEE d 'de' MMMM", { locale: es })
		const formattedStartDate = format(startDate, "EEEE d 'de' MMMM", { locale: es })
		return `El permiso iniciará el ${formattedStartDate} y vencerá el ${formattedEndDate}. Los permisos tienen una duración máxima de 7 días y no pueden extenderse más allá del domingo.`
	}

	const getAvailableUsers = (currentIndex: number) => {
		const participants = form.watch("participants")
		const selectedUserIds = participants
			.map((p, idx) => (idx !== currentIndex ? p.userId : null))
			.filter((id): id is string => id !== null && id !== "")

		return (
			usersData?.users
				?.filter((user) => !selectedUserIds.includes(user.id))
				.map((user) => ({
					value: user.id,
					label: user.name,
				})) ?? []
		)
	}

	const { data: workOrdersData } = useWorkOrders({
		page: 1,
		companyId,
		search: "",
		limit: 1000,
		isOtcMember,
		order: "desc",
		dateRange: null,
		typeFilter: null,
		statusFilter: null,
		permitFilter: true,
		orderBy: "createdAt",
		priorityFilter: null,
		includeEquipments: true,
		onlyWithRequestClousure: false,
	})

	const { data: usersData } = useUsersByCompany({
		page: 1,
		search: "",
		limit: 1000,
		companyId: isOtcMember ? process.env.NEXT_PUBLIC_OTC_COMPANY_ID! : companyId,
	})

	useEffect(() => {
		const otNumber = form.watch("otNumber")
		const isUrgent = form.watch("isUrgent")

		if (isOtcMember && isUrgent) {
			form.setValue("endDate", new Date())
			form.setValue("startDate", new Date())
			setExpirationMessage(
				"Este permiso está configurado como urgente por lo que su duración es de solo un día"
			)
			return
		}

		if (workOrdersData?.workOrders && otNumber && !initialValues) {
			const workOrder = workOrdersData.workOrders.find(
				(workOrder) => workOrder.otNumber === otNumber
			)

			if (!workOrder) {
				toast.error("La orden de trabajo seleccionada no tiene una fecha de programación válida")
				return
			}

			if (!["PLANNED", "IN_PROGRESS", "PENDING"].includes(workOrder.status)) {
				toast.error(
					"Solo se pueden crear permisos para órdenes de trabajo en estado Planificada o En Proceso"
				)
				return
			}

			const startDate = new Date()
			const effectiveEndDate = workOrder.rescheduledEndDate ?? workOrder.estimatedEndDate
			const otEndDate = effectiveEndDate ? new Date(effectiveEndDate) : null
			const endDate = getPermitExpirationDate(startDate, otEndDate)
			const expirationMessage = getPermitExpirationMessage(startDate, endDate)

			form.setValue("endDate", endDate)
			form.setValue("startDate", startDate)
			setWorkOrderSelected(workOrder)
			setExpirationMessage(expirationMessage)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("otNumber"), form.watch("isUrgent")])

	async function onSubmit(values: WorkPermitSchema) {
		try {
			setIsSubmitting(true)

			let res: {
				ok: boolean
				message: string
			}

			if (initialValues) {
				res = await updateWorkPermit({ id: initialValues.id, values })
			} else {
				res = await createWorkPermit({ values, companyId })
			}

			if (!res.ok) {
				toast("Error", {
					description: "Hubo un error al enviar el permiso de trabajo",
					duration: 3000,
				})
				setIsSubmitting(false)
				return
			}

			if (!initialValues) {
				setShowPrintDialog(true)
			} else {
				toast.success("Permiso de trabajo", {
					description: "Permiso de trabajo actualizado exitosamente",
					duration: 3000,
				})
			}

   void queryClient.invalidateQueries({
				queryKey: [
					"workPermits",
					{
						companyId,
					},
				],
			})
		} catch (error) {
			setIsSubmitting(false)

			toast.error("Error", {
				description: `Hubo un error al enviar el permiso de trabajo. ${error instanceof Error ? error.message : "Error desconocido"}`,
				duration: 3000,
			})
		}
	}

	const workWillBeAreOther = form.watch("workWillBe").includes("Otro")
	const preChecksAreOther = form.watch("preChecks").includes("Otros")
	const mutualityAreOther = form.watch("mutuality").includes("Otro")
	const toolsAreOther = form.watch("tools").includes("Otros")
	const generateWaste = form.watch("generateWaste")
	const wasteType = form.watch("wasteType")
	const wasteDisposalLocation = form.watch("wasteDisposalLocation")
	const acceptTerms = form.watch("acceptTerms")
	const isUrgent = form.watch("isUrgent")

	useEffect(() => {
		// Reset disposal location if waste type changes
		if (!initialValues || (initialValues && initialValues.wasteType !== wasteType)) {
			form.setValue("wasteDisposalLocation", "")
			form.setValue("otherWasteDisposalLocation", "")
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [wasteType])

	const getDisposalLocationOptions = () => {
		if (wasteType === "Peligroso") {
			return [
				{
					value: "Ingreso a bodega RESPEL Planta Hualpén",
					label: "Ingreso a bodega RESPEL Planta Hualpén",
				},
				{
					value: "Ingreso a bodega RESPEL planta Avellano",
					label: "Ingreso a bodega RESPEL planta Avellano",
				},
			]
		}
		if (wasteType === "Industrial") {
			return [
				{
					value: "Disposición en terreno con tolva gestionada por OTC",
					label: "Disposición en terreno con tolva gestionada por OTC",
				},
				{
					value: "Disposición en tolva de planta Hualpén",
					label: "Disposición en tolva de planta Hualpén",
				},
			]
		}
		if (wasteType === "Domestico") {
			return [
				{
					value: "Disposición en basureros y tolvas planta Hualpén",
					label: "Disposición en basureros y tolvas planta Hualpén",
				},
				{
					value: "Disposición en basureros de planta Avellano",
					label: "Disposición en basureros de planta Avellano",
				},
				{
					value: "Otra",
					label: "Otra: Especificar cual",
				},
			]
		}
		return []
	}

	const {
		fields: participantsFields,
		append: appendParticipants,
		remove: removeParticipant,
	} = useFieldArray({
		control: form.control,
		name: "participants",
	})

	const {
		fields: activityDetailsFields,
		append: appendActivityDetails,
		remove: removeActivityDetail,
	} = useFieldArray({
		control: form.control,
		name: "activityDetails",
	})

	return (
		<>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="mx-auto flex w-full max-w-7xl flex-col gap-5"
				>
					<Card className="overflow-visible">
						<CardContent className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
							<div className="flex w-full flex-col gap-x-4 gap-y-5 md:col-span-2 lg:flex-row">
								<div className="flex w-1/2 flex-col justify-start gap-5">
									{isOtcMember && (
										<SwitchFormField<WorkPermitSchema>
											name="isUrgent"
											label="¿Es urgente?"
											control={form.control}
										/>
									)}

									{initialValues ? (
										<InputFormField<WorkPermitSchema>
											readOnly
											name="otNumber"
											label="Número de OT (No editable)"
											control={form.control}
										/>
									) : (
										<>
											{(!isOtcMember || !isUrgent) && (
												<SelectWithSearchFormField<WorkPermitSchema>
													name="otNumber"
													label="Número de OT"
													control={form.control}
													options={
														workOrdersData?.workOrders?.map((workOrder) => ({
															value: workOrder.otNumber,
															label: workOrder.otNumber + " - " + workOrder.workRequest,
														})) ?? []
													}
												/>
											)}

											{isOtcMember && isUrgent && (
												<Alert>
													<InfoIcon />
													<AlertTitle>Permiso Urgente</AlertTitle>
													<AlertDescription>
														Este permiso se está creando como urgente, por lo que no requiere una
														Orden de Trabajo asociada.
													</AlertDescription>
												</Alert>
											)}
										</>
									)}

									<InputFormField<WorkPermitSchema>
										readOnly
										name="aplicantPt"
										control={form.control}
										label="Solicitante del Permiso (No editable)"
									/>

									<SelectFormField<WorkPermitSchema>
										name="mutuality"
										label="Mutualidad"
										control={form.control}
										options={MutualityOptions}
									/>

									{mutualityAreOther && (
										<InputFormField<WorkPermitSchema>
											name="otherMutuality"
											label="Otro"
											control={form.control}
										/>
									)}

									{expirationMessage && (
										<Alert>
											<InfoIcon />
											<AlertTitle>Fecha de expiración</AlertTitle>
											<AlertDescription>{expirationMessage}</AlertDescription>
										</Alert>
									)}
								</div>

								<div className="bg-secondary-background/20 grid w-1/2 gap-y-4 rounded-lg p-3 shadow sm:col-span-2 sm:grid-cols-2">
									<h2 className="flex items-center gap-2 text-lg font-semibold sm:col-span-2">
										<Layers2Icon className="text-muted-foreground size-5" />
										Información de la OT:
									</h2>

									<div className="sm:col-span-2">
										<h3 className="text-sm font-semibold">Trabajo solicitado:</h3>
										<p className="text-muted-foreground">
											{workOrderSelected?.workRequest || "N/A"}
										</p>
									</div>
									<div>
										<h3 className="text-sm font-semibold">Tipo de trabajo:</h3>
										<p className="text-muted-foreground">
											{workOrderSelected?.type
												? WorkOrderTypeLabels[
														workOrderSelected.type as keyof typeof WorkOrderTypeLabels
													]
												: "N/A"}
										</p>
									</div>
									<div>
										<h3 className="text-sm font-semibold">Prioridad:</h3>
										<Badge
											className={cn("bg-primary/5 border-primary text-primary", {
												"border-red-500 bg-red-500/5 text-red-500":
													workOrderSelected?.priority === WORK_ORDER_PRIORITY.HIGH,
												"border-yellow-500 bg-yellow-500/5 text-yellow-500":
													workOrderSelected?.priority === WORK_ORDER_PRIORITY.MEDIUM,
												"border-green-500 bg-green-500/5 text-green-500":
													workOrderSelected?.priority === WORK_ORDER_PRIORITY.LOW,
											})}
										>
											{workOrderSelected?.priority
												? WorkOrderPriorityLabels[
														workOrderSelected.priority as keyof typeof WorkOrderPriorityLabels
													]
												: "N/A"}
										</Badge>
									</div>
									<div>
										<h3 className="text-sm font-semibold">Fecha programada:</h3>
										<p className="text-muted-foreground">
											{workOrderSelected?.programDate
												? format(workOrderSelected.programDate, "PPP", { locale: es })
												: "N/A"}
										</p>
									</div>
									<div>
										<h3 className="text-sm font-semibold">Fecha estimada de finalización:</h3>
										<p className="text-muted-foreground">
											{workOrderSelected?.estimatedEndDate
												? format(workOrderSelected.estimatedEndDate, "PPP", { locale: es })
												: "N/A"}
										</p>
									</div>
									{workOrderSelected?.rescheduledEndDate && (
										<div>
											<h3 className="text-sm font-semibold">Fecha reprogramada:</h3>
											<p className="font-semibold text-amber-600">
												{format(workOrderSelected.rescheduledEndDate, "PPP", { locale: es })}
											</p>
										</div>
									)}
									<div>
										<h3 className="text-sm font-semibold">Horas estimadas:</h3>
										<p className="text-muted-foreground">
											{workOrderSelected?.estimatedHours || "N/A"} horas
										</p>
									</div>
									<div>
										<h3 className="text-sm font-semibold">Días estimados:</h3>
										<p className="text-muted-foreground">
											{workOrderSelected?.estimatedDays || "N/A"} día
											{workOrderSelected?.estimatedDays === 1 ? "" : "s"}
										</p>
									</div>
									<div>
										<h3 className="text-sm font-semibold">Empresa:</h3>
										<p className="text-muted-foreground">
											{workOrderSelected?.company?.name || "N/A"}
										</p>
									</div>
									<div>
										<h3 className="text-sm font-semibold">
											{isOtcMember ? "Operador/Mantenedor" : "Supervisor"}:
										</h3>
										<p className="text-muted-foreground">
											{workOrderSelected?.supervisor.name || "N/A"}
										</p>
									</div>
								</div>
							</div>

							<Separator className="mt-2 md:col-span-2" />

							<InputFormField<WorkPermitSchema>
								name="exactPlace"
								control={form.control}
								label="Lugar exacto"
							/>

							<SelectFormField<WorkPermitSchema>
								name="workWillBe"
								control={form.control}
								label="Trabajo a realizar"
								options={WorkWillBeOptions}
							/>

							{workWillBeAreOther && (
								<InputFormField<WorkPermitSchema>
									name="workWillBeOther"
									control={form.control}
									label="Especifique otro trabajo"
								/>
							)}

							<MultiSelectFormField<WorkPermitSchema>
								name="tools"
								label="Herramienta y/o equipos a utilizar"
								control={form.control}
								options={ToolsOptions}
							/>

							{toolsAreOther && (
								<InputFormField<WorkPermitSchema>
									name="otherTools"
									label="Especifique otras herramientas"
									control={form.control}
								/>
							)}

							<MultiSelectFormField<WorkPermitSchema>
								name="preChecks"
								label="Chequeos previos al trabajo requeridos"
								control={form.control}
								options={PreChecksOptions}
							/>

							{preChecksAreOther && (
								<InputFormField<WorkPermitSchema>
									name="otherPreChecks"
									label="Especifique otros chequeos"
									control={form.control}
								/>
							)}

							<SwitchFormField<WorkPermitSchema>
								name="generateWaste"
								control={form.control}
								itemClassName="sm:col-span-2 mt-2"
								label="¿La ejecución del trabajo generará residuos?"
							/>

							{generateWaste && (
								<>
									<SelectFormField<WorkPermitSchema>
										name="wasteType"
										label="Tipo de residuo"
										control={form.control}
										options={WasteTypesOptions}
									/>

									<SelectFormField<WorkPermitSchema>
										control={form.control}
										name="wasteDisposalLocation"
										label="Los residuos seran dispuestos en"
										placeholder={
											wasteType
												? "Seleccione el lugar de disposición"
												: "Seleccione primero el tipo de residuo"
										}
										options={getDisposalLocationOptions()}
									/>

									{wasteType === "Domestico" && wasteDisposalLocation === "Otra" && (
										<InputFormField<WorkPermitSchema>
											name="otherWasteDisposalLocation"
											label="Especifique el lugar de disposición"
											placeholder="Ingrese el lugar donde se dispondrán los residuos"
											control={form.control}
										/>
									)}
								</>
							)}
						</CardContent>
					</Card>

					<Card className="overflow-visible">
						<CardHeader className="flex w-full flex-row items-center justify-between">
							<div className="flex items-start gap-2">
								<Layers2Icon className="h-6 w-6 rounded-sm bg-rose-600/10 p-1 text-rose-600" />
								<div>
									<CardTitle>Detalle de actividades</CardTitle>
									<CardDescription>
										Debe detallar las actividades que se realizarán durante el permiso de trabajo.
									</CardDescription>
								</div>
							</div>

							<Button
								type="button"
								variant="ghost"
								className="text-rose-600 hover:bg-rose-100 hover:text-rose-700"
								onClick={() =>
									appendActivityDetails({
										activity: "",
										peligros: [],
										riesgos: [],
										medidasDeControl: [],
										otroPeligro: "",
										otroRiesgo: "",
										otraMedidaDeControl: "",
									})
								}
							>
								<CirclePlusIcon className="h-4 w-4" />
								Agregar actividad
							</Button>
						</CardHeader>

						<CardContent className="flex flex-col gap-4 p-0">
							<div className="px-4 pt-4">
								<Alert>
									<InfoIcon />
									<AlertTitle>Nota</AlertTitle>
									<AlertDescription>
										Este permiso de trabajo es válido mientras las condiciones descritas en él no
										cambien, lo cual se evalúa diariamente por el análisis de riesgos de la tarea
										(ART) de cada contratista. En caso de haber cambios, usted debe solicitar y
										generar un nuevo permiso de trabajo a OTC.
									</AlertDescription>
								</Alert>

								<p className="text-muted-foreground mt-3 text-sm">
									Es obligatorio describir cada actividad que compone el trabajo a ejecutar.
								</p>
							</div>

							<div>
								<div className="max-h-fit min-w-200">
									<div className="bg-muted/50 grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 border-b px-3 py-2">
										<span className="text-sm font-semibold">Actividad</span>
										<span className="text-sm font-semibold">Peligros</span>
										<span className="text-sm font-semibold">Riesgos</span>
										<span className="text-sm font-semibold">Medidas de control</span>
										<span className="w-9" />
									</div>

									{activityDetailsFields.map((field, index) => (
										<ActivityRow
											key={field.id}
											index={index}
											control={form.control}
											watch={form.watch}
											canRemove={activityDetailsFields.length > 1}
											onRemove={() => removeActivityDetail(index)}
										/>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex w-full flex-row items-center justify-between">
							<div className="flex items-start gap-2">
								<UsersIcon className="h-6 w-6 rounded-sm bg-indigo-600/10 p-1 text-indigo-600" />
								<div>
									<CardTitle>Registro de participacion</CardTitle>
									<CardDescription>
										Debe registrar los participantes que se van a registrar en el permiso de
										trabajo. Estos serán utilizados como opciones en el libro de obras.
									</CardDescription>
								</div>
							</div>

							<Button
								type="button"
								variant="ghost"
								className="text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
								onClick={() => appendParticipants({ userId: "" })}
							>
								<CirclePlusIcon className="h-4 w-4" />
								Agregar participante
							</Button>
						</CardHeader>

						<CardContent className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
							{participantsFields.map((field, index) => (
								<div
									key={field.id}
									className="mb-1 flex w-full flex-wrap items-center gap-2 md:flex-nowrap"
								>
									<SelectWithSearchFormField
										name={`participants.${index}.userId`}
										label="Participante"
										control={form.control}
										itemClassName="w-full"
										options={getAvailableUsers(index)}
									/>

									{index > 0 && (
										<Button
											type="button"
											variant="ghost"
											onClick={() => removeParticipant(index)}
											className="mt-5 hover:bg-rose-100 hover:text-rose-600"
										>
											<Trash2Icon />
										</Button>
									)}
								</div>
							))}

							<TextAreaFormField<WorkPermitSchema>
								optional
								control={form.control}
								name="additionalObservations"
								itemClassName="sm:col-span-2"
								label="Observaciones adicionales a los trabajos"
							/>

							{!isOtcMember && (
								<SwitchFormField<WorkPermitSchema>
									name="acceptTerms"
									control={form.control}
									itemClassName="sm:col-span-2"
									label="Los trabajadores declaran haber sido participe en la ejecucion del analisis de trabajo seguro (AST), estar instruido acerca del metodo correcto y seguro de trabajo, los riesgos y peligros asociados y sus medidas de prevencion."
								/>
							)}
						</CardContent>
					</Card>

					<SubmitButton
						disabled={!acceptTerms}
						isSubmitting={isSubmitting}
						className="bg-indigo-600 hover:bg-indigo-700 hover:text-white"
						label={initialValues ? "Actualizar permiso de trabajo" : "Crear permiso de trabajo"}
					/>

					<ActivityChangesDialog
						isOpen={showChangesDialog}
						onClose={() => setShowChangesDialog(false)}
					/>

					<PrintReminderDialog
						isOpen={showPrintDialog}
						onClose={() => {
							setShowPrintDialog(false)

							if (isOtcMember) {
								router.push("/admin/dashboard/permisos-de-trabajo")
							} else {
								router.push("/dashboard/permiso-de-trabajo")
							}
						}}
					/>
				</form>
			</Form>
		</>
	)
}
