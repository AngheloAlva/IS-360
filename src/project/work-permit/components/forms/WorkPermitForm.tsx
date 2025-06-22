"use client"

import { endOfWeek, isSunday, nextMonday, format } from "date-fns"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Plus, X } from "lucide-react"
import { es } from "date-fns/locale"
import { toast } from "sonner"

import { useWorkOrders, WorkOrder } from "@/project/work-order/hooks/use-work-order"
import { createWorkPermit } from "@/project/work-permit/actions/createWorkPermit"
import { useUsersByCompany } from "@/project/user/hooks/use-users-by-company"
import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { updateWorkPermit } from "../../actions/updateWorkPermit"
import { WORK_ORDER_PRIORITY } from "@prisma/client"
import { cn } from "@/lib/utils"
import {
	workPermitSchema,
	type WorkPermitSchema,
} from "@/project/work-permit/schemas/work-permit.schema"
import {
	ToolsOptions,
	RisksOptions,
	MutualityOptions,
	PreChecksOptions,
	WorkWillBeOptions,
	WasteTypesOptions,
	ControlMeasuresOptions,
} from "@/lib/consts/work-permit-options"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
import { MultiSelectFormField } from "@/shared/components/forms/MultiSelectFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Form } from "@/shared/components/ui/form"
import { queryClient } from "@/lib/queryClient"

import type { WorkPermit } from "../../hooks/use-work-permit"

interface WorkPermitFormProps {
	userId: string
	userName: string
	companyId: string
	isOtcMember?: boolean
	initialValues?: WorkPermit
}

export default function WorkPermitForm({
	userId,
	userName,
	companyId,
	initialValues,
	isOtcMember = false,
}: WorkPermitFormProps): React.ReactElement {
	const [workOrderSelected, setWorkOrderSelected] = useState<WorkOrder | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

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

	const form = useForm<WorkPermitSchema>({
		resolver: zodResolver(workPermitSchema),
		defaultValues: {
			preChecks: [],
			tools: initialValues?.tools || [],
			acceptTerms: isOtcMember ? true : false,
			otherRisk: initialValues?.otherRisk || "",
			wasteType: initialValues?.wasteType || "",
			mutuality: initialValues?.mutuality || "",
			exactPlace: initialValues?.exactPlace || "",
			otherTools: initialValues?.otherTools || "",
			workWillBe: initialValues?.workWillBe || "",
			aplicantPt: initialValues?.user.name || userName,
			startDate: initialValues?.startDate || undefined,
			otNumber: initialValues?.otNumber?.otNumber || "",
			otherMutuality: initialValues?.otherMutuality || "",
			otherPreChecks: initialValues?.otherPreChecks || "",
			generateWaste: initialValues?.generateWaste || false,
			workWillBeOther: initialValues?.workWillBeOther || "",
			additionalObservations: initialValues?.observations || "",
			riskIdentification: initialValues?.riskIdentification || [],
			wasteDisposalLocation: initialValues?.wasteDisposalLocation || "",
			preventiveControlMeasures: initialValues?.preventiveControlMeasures || [],
			otherPreventiveControlMeasures: initialValues?.otherPreventiveControlMeasures || "",
			participants: initialValues?.participants.map((participant) => ({
				userId: participant.id,
			})) || [
				{
					userId: "",
				},
				{
					userId: "",
				},
			],
		},
	})

	const router = useRouter()

	const { data: workOrdersData } = useWorkOrders({
		page: 1,
		companyId,
		limit: 100,
		search: "",
		order: "desc",
		dateRange: null,
		typeFilter: null,
		statusFilter: null,
		permitFilter: true,
		orderBy: "createdAt",
	})

	const { data: usersData } = useUsersByCompany({
		page: 1,
		companyId,
		search: "",
		limit: 1000,
	})

	useEffect(() => {
		const otNumber = form.watch("otNumber")

		if (workOrdersData?.workOrders && otNumber && !initialValues) {
			const workOrder = workOrdersData.workOrders.find(
				(workOrder) => workOrder.otNumber === otNumber
			)

			if (!workOrder || !workOrder.programDate) {
				toast.error("La orden de trabajo seleccionada no tiene una fecha de programación válida")
				return
			}

			if (workOrder.status !== "PLANNED" && workOrder.status !== "IN_PROGRESS") {
				toast.error(
					"Solo se pueden crear permisos para órdenes de trabajo en estado Planificada o En Proceso"
				)
				return
			}

			const startDate = new Date(workOrder.programDate)
			const otEndDate = workOrder.estimatedEndDate ? new Date(workOrder.estimatedEndDate) : null
			const endDate = getPermitExpirationDate(startDate, otEndDate)
			const expirationMessage = getPermitExpirationMessage(startDate, endDate)

			form.setValue("startDate", startDate)
			toast.info(expirationMessage)
			setWorkOrderSelected(workOrder)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("otNumber")])

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
				res = await createWorkPermit({ values, userId, companyId })
			}

			if (!res.ok) {
				toast("Error", {
					description: "Hubo un error al enviar el permiso de trabajo",
					duration: 3000,
				})
				setIsSubmitting(false)
				return
			}

			toast.success("Permiso de trabajo", {
				description: "Permiso de trabajo creado exitosamente",
				duration: 3000,
			})

			queryClient.invalidateQueries({
				queryKey: [
					"workPermits",
					{
						companyId,
					},
				],
			})

			router.push("/dashboard/permiso-de-trabajo")
		} catch (error) {
			setIsSubmitting(false)

			toast.error("Error", {
				description: `Hubo un error al enviar el permiso de trabajo. ${error instanceof Error ? error.message : "Error desconocido"}`,
				duration: 3000,
			})
		}
	}

	const controlMeasuresAreOther = form.watch("preventiveControlMeasures").includes("Otros")
	const riskAreOther = form.watch("riskIdentification").includes("Otros")
	const workWillBeAreOther = form.watch("workWillBe").includes("Otro")
	const preChecksAreOther = form.watch("preChecks").includes("Otros")
	const mutualityAreOther = form.watch("mutuality").includes("Otro")
	const toolsAreOther = form.watch("tools").includes("Otros")
	const generateWaste = form.watch("generateWaste")
	const acceptTerms = form.watch("acceptTerms")

	const {
		fields: participantsFields,
		append: appendParticipants,
		remove: removeParticipant,
	} = useFieldArray({
		control: form.control,
		name: "participants",
	})

	return (
		<Card>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="mx-auto grid w-full max-w-screen-xl grid-cols-1 gap-x-2 gap-y-5 md:grid-cols-2"
					>
						<div className="flex w-full flex-col gap-x-2 gap-y-5 md:col-span-2 lg:flex-row">
							<div className="flex w-1/2 flex-col justify-start gap-5">
								{initialValues ? (
									<InputFormField<WorkPermitSchema>
										readOnly
										name="otNumber"
										label="Número de OT (No editable)"
										control={form.control}
									/>
								) : (
									<SelectFormField<WorkPermitSchema>
										name="otNumber"
										label="Número de OT"
										control={form.control}
										options={
											workOrdersData?.workOrders?.map((workOrder) => ({
												value: workOrder.otNumber,
												label: workOrder.otNumber,
											})) ?? []
										}
									/>
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
							</div>

							<div className="bg-secondary-background/20 grid w-1/2 gap-y-4 rounded-lg p-3 shadow sm:col-span-2 sm:grid-cols-2">
								<h2 className="text-lg font-semibold sm:col-span-2">Información de la OT:</h2>

								<div>
									<h3 className="text-sm font-semibold">Trabajo solicitado:</h3>
									<p className="text-muted-foreground">{workOrderSelected?.workRequest || "N/A"}</p>
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
									<h3 className="text-sm font-semibold">Descripción del trabajo:</h3>
									<p className="text-muted-foreground">
										{workOrderSelected?.workDescription || "N/A"}
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

						<Separator className="my-2 md:col-span-2" />

						<MultiSelectFormField<WorkPermitSchema>
							name="riskIdentification"
							label="Identificacion de riesgos"
							itemClassName="content-start"
							control={form.control}
							options={RisksOptions}
						/>

						{riskAreOther && (
							<InputFormField<WorkPermitSchema>
								name="otherRisk"
								label="Especifique otro riesgo"
								control={form.control}
							/>
						)}

						<MultiSelectFormField<WorkPermitSchema>
							name="preventiveControlMeasures"
							label="Medidas de control preventivas"
							itemClassName="content-start"
							control={form.control}
							options={ControlMeasuresOptions}
						/>

						{controlMeasuresAreOther && (
							<InputFormField<WorkPermitSchema>
								control={form.control}
								label="Especifique otras medidas"
								name="otherPreventiveControlMeasures"
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
									placeholder="Seleccione el lugar de disposición de residuos"
									options={[
										{
											value: "Vertedero establecido",
											label: "Vertedero establecido",
										},
										{
											value: "Instalaciones de contratista",
											label: "Instalaciones de contratista",
										},
										{
											value: "Bodegas de residuos OTC",
											label: "Bodegas de residuos OTC",
										},
									]}
								/>
							</>
						)}

						<Separator className="mt-2 md:col-span-2" />

						<div className="flex w-full items-center justify-between md:col-span-2">
							<h2 className="text-lg font-semibold md:col-span-2">Registro de participacion</h2>

							<Button
								type="button"
								variant="outline"
								onClick={() => appendParticipants({ userId: "" })}
							>
								Agregar participante <Plus />
							</Button>
						</div>

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
									options={
										usersData?.users?.map((user) => ({
											value: user.id,
											label: user.name,
										})) ?? []
									}
								/>

								{index > 0 && (
									<Button
										type="button"
										variant="outline"
										className="col-span-4 md:mt-5"
										onClick={() => removeParticipant(index)}
									>
										<X />
										<span className="md:hidden">Eliminar participante {index + 1}</span>
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

						<SubmitButton
							disabled={!acceptTerms}
							label={initialValues ? "Actualizar solicitud" : "Crear solicitud"}
							isSubmitting={isSubmitting}
							className="mt-4 md:col-span-2"
						/>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
