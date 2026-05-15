"use client"

import { DoorClosedLockedIcon, Layers2Icon, PlusCircleIcon, Trash2Icon } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"

import { createLockoutPermitForWorkPermit } from "@/project/lockout-permit/actions/create-lockout-permit-for-work-permit"
import { useUsersByCompany } from "@/project/user/hooks/use-users-by-company"
import { useEquipments } from "@/project/equipment/hooks/use-equipments"
import { useOperators } from "@/shared/hooks/use-operators"
import { queryClient } from "@/lib/queryClient"
import {
	createLockoutPermitSchema,
	type LockoutPermitSchema,
} from "@/project/lockout-permit/schemas/lockout-permit.schema"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
import { MultiSelectFormField } from "@/shared/components/forms/MultiSelectFormField"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface ManageLockoutPermitsDialogProps {
	workPermitId: string
	companyId: string
	isInternalMember: boolean
}

export default function ManageLockoutPermitsDialog({
	workPermitId,
	companyId,
	isInternalMember,
}: ManageLockoutPermitsDialogProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const { data: usersData } = useUsersByCompany({
		page: 1,
		limit: 1000,
		search: "",
		companyId,
	})

	const { data: equipmentsData } = useEquipments({
		page: 1,
		limit: 1000,
		order: "asc",
		orderBy: "name",
	})

	const { data: operatorsData } = useOperators({
		page: 1,
		limit: 1000,
	})

	const companyUsers = usersData?.users ?? []
	const equipments = equipmentsData?.equipments ?? []
	const operators = operatorsData?.operators ?? []

	const form = useForm<LockoutPermitSchema>({
		resolver: zodResolver(createLockoutPermitSchema(isInternalMember)),
		defaultValues: {
			lockoutType: undefined,
			lockoutTypeOther: "",
			lockoutAreaResponsibleId: "",
			lockoutEquipments: [],
			startDate: undefined,
			endDate: undefined,
			lockoutActivities: [{ activity: "" }],
			lockoutRecords: [
				{
					userId: "",
					installTime: "",
					installDate: undefined,
					contractorLockNumber: "",
				},
			],
			lockoutFinalObservations: "",
		},
	})

	const lockoutType = form.watch("lockoutType")

	const {
		remove: removeLockoutActivity,
		append: appendLockoutActivity,
		fields: lockoutActivitiesFields,
	} = useFieldArray({
		control: form.control,
		name: "lockoutActivities",
	})

	const {
		remove: removeLockoutRecord,
		append: appendLockoutRecord,
		fields: lockoutRecordsFields,
	} = useFieldArray({
		control: form.control,
		name: "lockoutRecords",
	})

	const onSubmit = async (values: LockoutPermitSchema) => {
		try {
			setIsSubmitting(true)

			const result = await createLockoutPermitForWorkPermit({
				workPermitId,
				values,
			})

			if (!result.ok) {
				toast.error(result.message)
				return
			}

			toast.success(result.message)
			form.reset()
			setIsOpen(false)
			await queryClient.invalidateQueries({ queryKey: ["work-permits"] })
		} catch (error) {
			console.error("Error creating lockout permit:", error)
			toast.error("Error al crear el permiso de bloqueo")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700 hover:text-white">
					<PlusCircleIcon className="h-4 w-4" />
					Nuevo Permiso
				</Button>
			</DialogTrigger>

			<DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Crear Permiso de Bloqueo</DialogTitle>
					<DialogDescription>
						Complete la información del permiso de bloqueo para este permiso de trabajo.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<SelectFormField<LockoutPermitSchema>
								label="Tipo de Bloqueo"
								control={form.control}
								name="lockoutType"
								options={[
									{ value: "PREVENTIVE", label: "Preventivo" },
									{ value: "CORRECTIVE", label: "Correctivo" },
									{ value: "EMERGENCY", label: "Emergencia" },
									{ value: "OTHER", label: "Otro" },
								]}
							/>

							{isInternalMember && (
								<SelectWithSearchFormField<LockoutPermitSchema>
									name="lockoutAreaResponsibleId"
									label="Responsable del Área"
									control={form.control}
									options={
										operators?.map((op) => ({
											value: op.id,
											label: op.name,
										})) ?? []
									}
								/>
							)}

							{lockoutType === "OTHER" && (
								<InputFormField<LockoutPermitSchema>
									name="lockoutTypeOther"
									label="Especifique el tipo de bloqueo"
									control={form.control}
								/>
							)}

							<MultiSelectFormField<LockoutPermitSchema>
								control={form.control}
								label="Equipos a Bloquear"
								itemClassName="sm:col-span-2"
								name="lockoutEquipments"
								options={equipments.map((equipment) => ({
									value: equipment.id,
									label: equipment.name,
								}))}
							/>

							<DatePickerFormField<LockoutPermitSchema>
								label="Desde"
								control={form.control}
								name="startDate"
							/>

							<DatePickerFormField<LockoutPermitSchema>
								label="Hasta"
								control={form.control}
								name="endDate"
							/>
						</div>

						<Card>
							<CardHeader className="flex w-full flex-row items-center justify-between">
								<div className="flex items-start gap-2">
									<Layers2Icon className="h-6 w-6 rounded-sm bg-violet-600/10 p-1 text-violet-600" />
									<div>
										<CardTitle>Actividades a Ejecutar</CardTitle>
										<CardDescription>
											Describa las actividades que se realizarán durante el bloqueo.
										</CardDescription>
									</div>
								</div>
								<Button
									size="sm"
									type="button"
									variant="ghost"
									className="text-violet-600 hover:bg-violet-100 hover:text-violet-700"
									onClick={() => appendLockoutActivity({ activity: "" })}
								>
									<PlusCircleIcon className="h-4 w-4" />
									Agregar
								</Button>
							</CardHeader>

							<CardContent>
								<div className="grid grid-cols-1 gap-2">
									{lockoutActivitiesFields.map((field, activityIndex) => (
										<div key={field.id} className="flex w-full items-end gap-2">
											<InputFormField<LockoutPermitSchema>
												label={`Actividad ${activityIndex + 1}`}
												control={form.control}
												itemClassName="flex-1"
												name={`lockoutActivities.${activityIndex}.activity`}
												placeholder="Descripción de la actividad"
											/>
											<Button
												size="icon"
												type="button"
												variant="ghost"
												className="hover:bg-rose-100 hover:text-rose-700"
												onClick={() => removeLockoutActivity(activityIndex)}
											>
												<Trash2Icon className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex w-full flex-row items-center justify-between">
								<div className="flex items-start gap-2">
									<DoorClosedLockedIcon className="h-6 w-6 rounded-sm bg-fuchsia-600/10 p-1 text-fuchsia-600" />
									<div>
										<CardTitle>Registros del Bloqueo y Etiquetado</CardTitle>
										<CardDescription>
											Ingrese los registros del bloqueo y etiquetado.
										</CardDescription>
									</div>
								</div>
								<Button
									size="sm"
									type="button"
									variant="ghost"
									className="text-fuchsia-600 hover:bg-fuchsia-100 hover:text-fuchsia-700"
									onClick={() =>
										appendLockoutRecord({
											userId: "",
											installTime: "",
											installDate: undefined,
											contractorLockNumber: "",
										})
									}
								>
									<PlusCircleIcon className="h-4 w-4" />
									Agregar
								</Button>
							</CardHeader>

							<CardContent className="space-y-5">
								{lockoutRecordsFields.map((field, recordIndex) => (
									<div key={field.id} className="flex w-full flex-row items-end gap-2">
										<SelectWithSearchFormField<LockoutPermitSchema>
											itemClassName="flex-1"
											control={form.control}
											placeholder="Seleccione una persona"
											label="Persona que realiza la instalación"
											name={`lockoutRecords.${recordIndex}.userId`}
											options={companyUsers.map((user) => ({
												value: user.id,
												label: user.name,
											}))}
										/>

										<InputFormField<LockoutPermitSchema>
											placeholder="14"
											control={form.control}
											label="Número de Candado"
											name={`lockoutRecords.${recordIndex}.contractorLockNumber`}
										/>

										<DatePickerFormField<LockoutPermitSchema>
											itemClassName="flex-1"
											control={form.control}
											label="Fecha de Instalación"
											name={`lockoutRecords.${recordIndex}.installDate`}
										/>

										<InputFormField<LockoutPermitSchema>
											placeholder="08:30"
											control={form.control}
											label="Hora de Instalación"
											name={`lockoutRecords.${recordIndex}.installTime`}
										/>

										<Button
											size="icon"
											type="button"
											variant="ghost"
											className="hover:bg-rose-100 hover:text-rose-700"
											onClick={() => removeLockoutRecord(recordIndex)}
										>
											<Trash2Icon className="h-4 w-4" />
										</Button>
									</div>
								))}
							</CardContent>
						</Card>

						<TextAreaFormField<LockoutPermitSchema>
							optional
							label="Observaciones Finales del Bloqueo"
							control={form.control}
							name="lockoutFinalObservations"
						/>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								className="w-1/2"
								disabled={isSubmitting}
								onClick={() => setIsOpen(false)}
							>
								Cancelar
							</Button>

							<SubmitButton
								isSubmitting={isSubmitting}
								label="Crear Permiso de Bloqueo"
								className="w-1/2 bg-purple-600 hover:bg-purple-700 hover:text-white"
							/>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
