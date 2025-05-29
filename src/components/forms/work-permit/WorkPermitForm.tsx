"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { addDays, format } from "date-fns"
import { Plus, X } from "lucide-react"
import { es } from "date-fns/locale"
import { toast } from "sonner"

import { useWorkOrders, WorkOrder } from "@/hooks/work-orders/use-work-order"
import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"
import { createWorkPermit } from "@/actions/work-permit/createWorkPermit"
import { useUsersByCompany } from "@/hooks/users/use-users-by-company"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { WORK_ORDER_PRIORITY } from "@prisma/client"
import { cn } from "@/lib/utils"
import {
	workPermitSchema,
	type WorkPermitSchema,
} from "@/lib/form-schemas/work-permit/work-permit-schema"
import {
	ToolsOptions,
	RisksOptions,
	MutualityOptions,
	PreChecksOptions,
	WorkWillBeOptions,
	WasteTypesOptions,
	ControlMeasuresOptions,
} from "@/lib/consts/work-permit-options"

import { MultiSelectFormField } from "@/components/forms/shared/MultiSelectFormField"
import { SelectWithSearchFormField } from "../shared/SelectWithSearchFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SwitchFormField } from "@/components/forms/shared/SwitchFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Form } from "@/components/ui/form"

interface WorkPermitFormProps {
	userId: string
	companyId: string
	userName: string
}

export default function WorkPermitForm({
	userId,
	userName,
	companyId,
}: WorkPermitFormProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [workOrderSelected, setWorkOrderSelected] = useState<WorkOrder | null>(null)

	const form = useForm<WorkPermitSchema>({
		resolver: zodResolver(workPermitSchema),
		defaultValues: {
			userId: userId,
			companyId: companyId,
			tools: [],
			otNumber: "",
			otherRisk: "",
			wasteType: "",
			mutuality: "",
			preChecks: [],
			exactPlace: "",
			otherTools: "",
			workWillBe: "",
			endDate: undefined,
			otherPreChecks: "",
			otherMutuality: "",
			acceptTerms: false,
			workWillBeOther: "",
			startDate: undefined,
			generateWaste: false,
			aplicantPt: userName,
			riskIdentification: [],
			wasteDisposalLocation: "",
			additionalObservations: "",
			preventiveControlMeasures: [],
			otherPreventiveControlMeasures: "",
			participants: [
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
		dateRange: null,
		typeFilter: null,
		statusFilter: null,
	})

	const { data: usersData } = useUsersByCompany({
		page: 1,
		companyId,
		search: "",
		limit: 1000,
	})

	useEffect(() => {
		const otNumber = form.watch("otNumber")

		if (workOrdersData?.workOrders && otNumber) {
			const workOrder = workOrdersData.workOrders.find(
				(workOrder) => workOrder.otNumber === otNumber
			)

			if (!workOrder) return

			form.setValue("startDate", new Date(workOrder.programDate))
			setWorkOrderSelected(workOrder)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("otNumber")])

	useEffect(() => {
		const workWillBe = form.watch("workWillBe")

		if (
			workWillBe === "En Caliente" ||
			workWillBe === "Acceso Limitado" ||
			workWillBe === "Espacio confinado"
		) {
			form.setValue("endDate", addDays(form.watch("startDate"), 1))
		} else {
			form.setValue("endDate", addDays(form.watch("startDate"), 7))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("workWillBe")])

	async function onSubmit(values: WorkPermitSchema) {
		try {
			setIsSubmitting(true)

			const res = await createWorkPermit(values)

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

	useEffect(() => {
		console.log(form.formState.errors)
	}, [form.formState.errors])

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
								<h2 className="text-lg font-semibold text-gray-700 sm:col-span-2">
									Información de la OT:
								</h2>

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
									<h3 className="text-sm font-semibold">Fecha de solicitud:</h3>
									<p className="text-muted-foreground">
										{workOrderSelected?.solicitationDate
											? format(workOrderSelected.solicitationDate, "PPP", { locale: es })
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
									<h3 className="text-sm font-semibold">Fecha programada:</h3>
									<p className="text-muted-foreground">
										{workOrderSelected?.programDate
											? format(workOrderSelected.programDate, "PPP", { locale: es })
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

						<Separator className="mt-2 bg-gray-200 md:col-span-2" />

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

						<Separator className="my-2 bg-gray-200 md:col-span-2" />

						{/* <h2 className="text-lg font-semibold text-gray-700">Analisis seguro del trabajo</h2>

						<div className="flex w-full items-center justify-between md:col-span-2">
							<FormLabel className="text-gray-700 md:col-span-2">Detalle de Actividades</FormLabel>

							<Button
								type="button"
								variant="outline"
								onClick={() => appendActivityDetails({ activity: "" })}
							>
								Agregar actividad <Plus />
							</Button>
						</div>

						<div className="mb-4 grid gap-4 md:col-span-2 md:grid-cols-2">
							{activityDetailsFields.map((field, index) => (
								<FormField
									key={field.id}
									control={form.control}
									name={`activityDetails.${index}.activity`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-gray-700">Actividad {index + 1}</FormLabel>
											<FormControl>
												<div className="flex items-center justify-center gap-1">
													<Input
														className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
														placeholder="Actividad"
														{...field}
													/>
													<Button
														type="button"
														variant="outline"
														className="border-gray-200"
														onClick={() => removeActivityDetail(index)}
													>
														<X />
													</Button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							))}
						</div> */}

						<MultiSelectFormField<WorkPermitSchema>
							name="riskIdentification"
							label="Identificacion de riesgos"
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

								<InputFormField<WorkPermitSchema>
									name="wasteDisposalLocation"
									label="Los residuos seran dispuestos en"
									control={form.control}
								/>
							</>
						)}

						{/* 
						<h2 className="text-lg font-semibold text-gray-700 md:col-span-2">
							Firmas de autorización
						</h2>

						<InputFormField<WorkPermitSchema>
							name="whoDeliversWorkAreaOp"
							label="Quien entrega el área de trabajo (OP)"
							control={form.control}
						/>

						<InputFormField<WorkPermitSchema>
							name="workerExecutor"
							label="Ejecutor del trabajo"
							control={form.control}
						/> */}

						{/* 							
								<Separator className="my-2 bg-gray-200 md:col-span-2" />

								<h2 className="text-lg font-semibold text-gray-700 md:col-span-2">
									Recepcion del trabajo
								</h2>

								<SwitchFormField<WorkPermitSchema>
									control={form.control}
									name="cleanAndTidyWorkArea"
									label="El área de trabajo se encuentra limpia y ordenada"
								/>

								<SwitchFormField<WorkPermitSchema>
									control={form.control}
									name="workCompleted"
									label="Trabajo terminado"
								/>

								<TextAreaFormField<WorkPermitSchema>
									name="observations"
									label="Observaciones"
									control={form.control}
								/> */}

						<Separator className="mt-2 bg-gray-200 md:col-span-2" />

						<div className="flex w-full items-center justify-between md:col-span-2">
							<h2 className="text-lg font-semibold text-gray-700 md:col-span-2">
								Registro de participacion
							</h2>

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

								<Button
									type="button"
									variant="outline"
									className="col-span-4 md:mt-5"
									onClick={() => removeParticipant(index)}
								>
									<X />
									<span className="md:hidden">Eliminar participante {index + 1}</span>
								</Button>
							</div>
						))}

						<TextAreaFormField<WorkPermitSchema>
							control={form.control}
							name="additionalObservations"
							itemClassName="sm:col-span-2"
							label="Observaciones adicionales a los trabajos"
						/>

						<SwitchFormField<WorkPermitSchema>
							name="acceptTerms"
							control={form.control}
							itemClassName="sm:col-span-2"
							label="Los trabajadores declaran haber sido participe en la ejecucion del analisis de trabajo seguro (AST), estar instruido acerca del metodo correcto y seguro de trabajo, los riesgos y peligros asociados y sus medidas de prevencion."
						/>

						<SubmitButton
							disabled={!acceptTerms}
							label="Enviar solicitud"
							isSubmitting={isSubmitting}
							className="mt-4 md:col-span-2"
						/>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
