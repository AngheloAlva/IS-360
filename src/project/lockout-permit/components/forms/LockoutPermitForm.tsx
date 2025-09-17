"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
	InfoIcon,
	LockIcon,
	Trash2Icon,
	Layers2Icon,
	XCircleIcon,
	CirclePlusIcon,
} from "lucide-react"

import { lockoutPermitSchema, type LockoutPermitSchema } from "../../schemas/lockout-permit.schema"
import { useWorkOrders } from "@/project/work-order/hooks/use-work-order"
import { useEquipments } from "@/project/equipment/hooks/use-equipments"
import { createLockoutPermit } from "../../actions/createLockoutPermit"
import { useOperators } from "@/shared/hooks/use-operators"
import { queryClient } from "@/lib/queryClient"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Separator } from "@/shared/components/ui/separator"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Form } from "@/shared/components/ui/form"

interface LockoutPermitFormProps {
	companyId: string
	userId: string
	isOtcMember: boolean
}

export default function LockoutPermitForm({
	companyId,
	userId,
	isOtcMember,
}: LockoutPermitFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()

	const form = useForm<LockoutPermitSchema>({
		resolver: zodResolver(lockoutPermitSchema),
		defaultValues: {
			endDate: new Date(),
			startDate: new Date(),
			lockoutType: undefined,
			activitiesToExecute: [{ activity: "" }, { activity: "" }],
			lockoutRegistrations: [
				{
					name: "",
					rut: "",
					removeTime: "",
					lockNumber: "",
					installTime: "",
					installDate: new Date(),
					removeDate: new Date(),
				},
			],
			zeroEnergyReviews: [
				{
					action: "",
					equipment: "",
					performedBy: "",
					isZeroEnergyReview: false,
				},
			],
			requestedById: userId,
			areaResponsibleId: "",
		},
	})

	const { data: workOrders } = useWorkOrders({
		page: 1,
		companyId,
		search: "",
		limit: 1000,
		order: "asc",
		dateRange: null,
		typeFilter: null,
		statusFilter: null,
		orderBy: "createdAt",
		priorityFilter: null,
		onlyWithRequestClousure: false,
	})

	const { data: equipments } = useEquipments({
		page: 1,
		limit: 1000,
		orderBy: "name",
		order: "asc",
	})

	const { data: operators } = useOperators({
		page: 1,
		limit: 1000,
	})

	const {
		fields: activitiesFields,
		append: appendActivity,
		remove: removeActivity,
	} = useFieldArray({
		control: form.control,
		name: "activitiesToExecute",
	})

	const {
		fields: lockoutRegistrationFields,
		append: appendLockoutRegistration,
		remove: removeLockoutRegistration,
	} = useFieldArray({
		control: form.control,
		name: "lockoutRegistrations",
	})

	const {
		fields: zeroEnergyFields,
		append: appendZeroEnergy,
		remove: removeZeroEnergy,
	} = useFieldArray({
		control: form.control,
		name: "zeroEnergyReviews",
	})

	const watchLockoutType = form.watch("lockoutType")

	async function onSubmit(values: LockoutPermitSchema) {
		try {
			setIsSubmitting(true)

			const { ok } = await createLockoutPermit({
				values,
				userId,
			})

			if (!ok) {
				toast.error("Error al crear el permiso de bloqueo")
				return
			}

			await queryClient.invalidateQueries({ queryKey: ["lockout-permits"] })
			toast.success("Permiso de bloqueo creado exitosamente")
			router.push("/admin/dashboard/solicitudes-de-bloqueo")
		} catch (error) {
			console.error("Error submitting lockout permit:", error)
			toast.error("Error al crear el permiso de bloqueo")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<LockIcon className="h-6 w-6 rounded-sm bg-yellow-500/10 p-1 text-yellow-500" />
								Información Básica del Permiso de Bloqueo
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								{isOtcMember && (
									<SelectWithSearchFormField
										control={form.control}
										name="otNumberId"
										label="Número de OT (opcional)"
										placeholder="Seleccionar OT..."
										options={
											workOrders?.workOrders?.map((wo) => ({
												value: wo.id,
												label: `${wo.otNumber} - ${wo.workRequest}`,
											})) || []
										}
									/>
								)}

								<SelectWithSearchFormField<LockoutPermitSchema>
									control={form.control}
									name="areaResponsibleId"
									label="Responsable del Área"
									placeholder="Seleccionar responsable..."
									options={
										operators?.operators?.map((operator) => ({
											value: operator.id,
											label: operator.name,
										})) || []
									}
								/>

								<SelectFormField<LockoutPermitSchema>
									control={form.control}
									name="lockoutType"
									label="Tipo de Bloqueo"
									placeholder="Seleccionar tipo..."
									options={[
										{ value: "PREVENTIVE", label: "Preventivo" },
										{ value: "CORRECTIVE", label: "Correctivo" },
										{ value: "EMERGENCY", label: "Emergencia" },
										{ value: "OTHER", label: "Otro" },
									]}
								/>

								{watchLockoutType === "OTHER" && (
									<InputFormField<LockoutPermitSchema>
										control={form.control}
										name="lockoutTypeOther"
										label="Especificar Tipo de Bloqueo"
										placeholder="Describir el tipo de bloqueo..."
									/>
								)}

								<DatePickerFormField<LockoutPermitSchema>
									control={form.control}
									name="startDate"
									label="Fecha de Inicio"
								/>

								<DatePickerFormField<LockoutPermitSchema>
									control={form.control}
									name="endDate"
									label="Fecha de Fin"
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex w-full flex-row items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<Layers2Icon className="h-6 w-6 rounded-sm bg-yellow-600/10 p-1 text-yellow-600" />
								Descripción de Actividades
							</CardTitle>

							<Button
								size="sm"
								type="button"
								variant="ghost"
								className="text-lime-600 hover:bg-lime-100 hover:text-lime-700"
								onClick={() => appendActivity({ activity: "" })}
							>
								<CirclePlusIcon className="h-4 w-4" />
								Agregar Actividad
							</Button>
						</CardHeader>

						<CardContent>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								{activitiesFields.map((field, index) => (
									<div key={field.id} className="flex w-full items-center gap-1">
										<Badge variant="outline" className="size-9 justify-center rounded-r-none">
											{index + 1}
										</Badge>
										<InputFormField<LockoutPermitSchema>
											label=""
											className="rounded-l-none"
											control={form.control}
											itemClassName="w-full gap-0"
											placeholder="Describir la actividad..."
											name={`activitiesToExecute.${index}.activity`}
										/>

										{activitiesFields.length > 1 && (
											<Button
												size="icon"
												type="button"
												variant="ghost"
												className="text-red-600 hover:text-red-700"
												onClick={() => removeActivity(index)}
											>
												<Trash2Icon className="h-4 w-4" />
											</Button>
										)}
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card className="gap-4">
						<CardHeader className="flex w-full flex-row items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<CirclePlusIcon className="h-6 w-6 rounded-sm bg-lime-600/10 p-1 text-lime-600" />
								Registro del Bloqueo y Etiquetado
							</CardTitle>

							<Button
								size="sm"
								type="button"
								variant="ghost"
								className="text-lime-600 hover:bg-lime-100 hover:text-lime-700"
								onClick={() =>
									appendLockoutRegistration({
										name: "",
										rut: "",
										lockNumber: "",
										removeTime: "",
										installTime: "",
										removeDate: new Date(),
										installDate: new Date(),
									})
								}
							>
								<CirclePlusIcon className="h-4 w-4" />
								Agregar Registro
							</Button>
						</CardHeader>

						<CardContent>
							<div className="space-y-4">
								{lockoutRegistrationFields.map((field, index) => (
									<Card key={field.id} className="border-dashed">
										<CardContent>
											<div className="mb-4 flex items-center justify-between">
												<Badge
													variant="secondary"
													className="text-yellow-6`00 bg-yellow-500/10 font-semibold"
												>
													Registro #{index + 1}
												</Badge>
												{lockoutRegistrationFields.length > 1 && (
													<Button
														size="sm"
														type="button"
														variant="ghost"
														className="text-red-600 hover:bg-red-100 hover:text-red-700"
														onClick={() => removeLockoutRegistration(index)}
													>
														<XCircleIcon className="h-4 w-4" />
														Eliminar
													</Button>
												)}
											</div>

											<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
												<InputFormField<LockoutPermitSchema>
													label="Nombre"
													control={form.control}
													name={`lockoutRegistrations.${index}.name`}
													placeholder="Nombre completo"
												/>
												<InputFormField<LockoutPermitSchema>
													label="RUN"
													control={form.control}
													placeholder="12.345.678-9"
													name={`lockoutRegistrations.${index}.rut`}
												/>
												<InputFormField<LockoutPermitSchema>
													label="N° Candado"
													control={form.control}
													placeholder="Número del candado"
													name={`lockoutRegistrations.${index}.lockNumber`}
												/>
											</div>

											<Separator className="my-4" />

											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												<div className="space-y-2">
													<h4 className="font-medium text-green-700">Instalación</h4>
													<div className="grid grid-cols-2 gap-2">
														<DatePickerFormField<LockoutPermitSchema>
															label="Fecha"
															control={form.control}
															name={`lockoutRegistrations.${index}.installDate`}
														/>
														<InputFormField<LockoutPermitSchema>
															control={form.control}
															name={`lockoutRegistrations.${index}.installTime`}
															label="Hora"
															placeholder="HH:MM"
														/>{" "}
													</div>
												</div>

												<div className="space-y-2">
													<h4 className="font-medium text-red-700">Retiro</h4>
													<div className="grid grid-cols-2 gap-2">
														<DatePickerFormField<LockoutPermitSchema>
															label="Fecha"
															control={form.control}
															name={`lockoutRegistrations.${index}.removeDate`}
														/>
														<InputFormField<LockoutPermitSchema>
															label="Hora"
															placeholder="HH:MM"
															control={form.control}
															name={`lockoutRegistrations.${index}.removeTime`}
														/>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>

					<Card className="gap-4">
						<CardHeader className="flex w-full flex-row items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<InfoIcon className="h-6 w-6 rounded-sm bg-lime-500/10 p-1 text-lime-500" />
								Maniobras de Revisión Energía Cero (0)
							</CardTitle>

							<Button
								size="sm"
								type="button"
								variant="ghost"
								className="text-lime-600 hover:bg-lime-100 hover:text-lime-700"
								onClick={() =>
									appendZeroEnergy({
										action: "",
										location: "",
										equipment: "",
										performedBy: "",
										isZeroEnergyReview: false,
									})
								}
							>
								<CirclePlusIcon className="h-4 w-4" />
								Agregar Revisión
							</Button>
						</CardHeader>

						<CardContent>
							<div className="space-y-4">
								{zeroEnergyFields.map((field, index) => (
									<Card key={field.id} className="border-dashed">
										<CardContent>
											<div className="mb-4 flex items-center justify-between">
												<Badge variant="secondary" className="bg-yellow-500/10 font-semibold">
													Revisión #{index + 1}
												</Badge>

												{zeroEnergyFields.length > 1 && (
													<Button
														size="sm"
														type="button"
														variant="ghost"
														onClick={() => removeZeroEnergy(index)}
														className="text-red-600 hover:bg-red-100 hover:text-red-700"
													>
														<XCircleIcon className="h-4 w-4" />
														Eliminar
													</Button>
												)}
											</div>

											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												<SelectWithSearchFormField<LockoutPermitSchema>
													label="Equipo"
													control={form.control}
													itemClassName="md:col-span-2"
													placeholder="Nombre del equipo"
													name={`zeroEnergyReviews.${index}.equipment`}
													onChange={(value) => {
														const [id, location] = value.split("_")

														form.setValue(
															`zeroEnergyReviews.${index}.equipment`,
															id + "_" + location
														)
														form.setValue(`zeroEnergyReviews.${index}.location`, location)
													}}
													options={
														equipments?.equipments.map((equipment) => ({
															value: equipment.id + "_" + equipment.location,
															label: equipment.name + " - " + equipment.location,
														})) || []
													}
												/>
												<InputFormField<LockoutPermitSchema>
													control={form.control}
													name={`zeroEnergyReviews.${index}.action`}
													label="Acción Realizada"
													placeholder="Describir la acción"
												/>
												<SelectWithSearchFormField<LockoutPermitSchema>
													label="Realizado por"
													control={form.control}
													placeholder="Quién realizó la acción"
													name={`zeroEnergyReviews.${index}.performedBy`}
													options={
														operators?.operators.map((operator) => ({
															value: operator.id,
															label: operator.name,
														})) || []
													}
												/>

												<SwitchFormField<LockoutPermitSchema>
													control={form.control}
													label="Revisa Energía Cero"
													className="data-[state=checked]:bg-lime-500"
													name={`zeroEnergyReviews.${index}.isZeroEnergyReview`}
												/>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<InfoIcon className="h-6 w-6 rounded-sm bg-lime-500/10 p-1 text-lime-500" />
								Información Adicional
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-4">
								<TextAreaFormField<LockoutPermitSchema>
									control={form.control}
									name="finalObservations"
									label="Observaciones Finales"
									placeholder="Describir las observaciones finales"
								/>
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-end gap-2">
						<Button
							size={"lg"}
							type="button"
							variant="outline"
							className="w-1/3"
							disabled={isSubmitting}
							onClick={() => router.back()}
						>
							Cancelar
						</Button>

						<SubmitButton
							className="w-2/3"
							label="Crear Permiso de Bloqueo"
							isSubmitting={isSubmitting}
						/>
					</div>
				</form>
			</Form>
		</div>
	)
}
