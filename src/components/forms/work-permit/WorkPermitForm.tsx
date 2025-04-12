"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { createWorkPermit } from "@/actions/work-permit/createWorkPermit"
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
import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SwitchFormField } from "@/components/forms/shared/SwitchFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import { RutFormField } from "@/components/forms/shared/RutFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormMessage,
	FormControl,
} from "@/components/ui/form"

export default function WorkPermitForm({ userId }: { userId: string }): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<WorkPermitSchema>({
		resolver: zodResolver(workPermitSchema),
		defaultValues: {
			userId: userId,
			hour: "",
			tools: [],
			otNumber: "",
			otherRisk: "",
			wasteType: "",
			mutuality: "",
			preChecks: [],
			aplicantPt: "",
			exactPlace: "",
			otherTools: "",
			workWillBe: "",
			whoReceives: "",
			observations: "",
			workersNumber: "",
			responsiblePt: "",
			workerExecutor: "",
			otherPreChecks: "",
			otherMutuality: "",
			acceptTerms: false,
			executanCompany: "",
			workDescription: "",
			workWillBeOther: "",
			initDate: new Date(),
			workCompleted: false,
			generateWaste: false,
			preventionOfficer: "",
			riskIdentification: [],
			wasteDisposalLocation: "",
			whoDeliversWorkAreaOp: "",
			additionalObservations: "",
			cleanAndTidyWorkArea: false,
			preventiveControlMeasures: [],
			otherPreventiveControlMeasures: "",
			activityDetails: [{ activity: "" }, { activity: "" }],
			participants: [{ fullName: "", rut: "", company: "" }],
		},
	})

	const router = useRouter()

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

			toast("Permiso de trabajo", {
				description: "Permiso de trabajo enviado exitosamente",
				duration: 3000,
			})

			router.push("/dashboard/permiso-de-trabajo")
		} catch (error) {
			setIsSubmitting(false)

			toast("Error", {
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
		fields: activityDetailsFields,
		append: appendActivityDetails,
		remove: removeActivityDetail,
	} = useFieldArray({
		control: form.control,
		name: "activityDetails",
	})

	const {
		fields: participantsFields,
		append: appendParticipants,
		remove: removeParticipant,
	} = useFieldArray({
		control: form.control,
		name: "participants",
	})

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="mx-auto grid w-full max-w-screen-xl grid-cols-1 gap-4 md:grid-cols-2"
			>
				<InputFormField<WorkPermitSchema>
					name="aplicantPt"
					label="Solicitante PT"
					control={form.control}
				/>

				<InputFormField<WorkPermitSchema>
					name="responsiblePt"
					label="Responsable PT"
					control={form.control}
				/>

				<InputFormField<WorkPermitSchema>
					name="executanCompany"
					label="Empresa Ejecutante / Interno"
					control={form.control}
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

				<Separator className="mt-2 bg-gray-200 md:col-span-2" />

				<DatePickerFormField<WorkPermitSchema>
					name="initDate"
					control={form.control}
					label="Fecha Inicio Trabajo"
				/>

				<InputFormField<WorkPermitSchema> name="hour" label="Hora" control={form.control} />

				<InputFormField<WorkPermitSchema>
					name="otNumber"
					label="Número de OT"
					control={form.control}
				/>

				<InputFormField<WorkPermitSchema>
					name="workersNumber"
					control={form.control}
					label="Número de trabajadores"
				/>

				<TextAreaFormField<WorkPermitSchema>
					name="workDescription"
					control={form.control}
					label="Descripción del trabajo"
				/>

				<TextAreaFormField<WorkPermitSchema>
					name="exactPlace"
					control={form.control}
					label="Lugar exacto"
				/>

				<SelectFormField<WorkPermitSchema>
					name="workWillBe"
					label="Trabajo a realizar"
					control={form.control}
					options={WorkWillBeOptions}
				/>

				{workWillBeAreOther && (
					<InputFormField<WorkPermitSchema>
						name="workWillBeOther"
						label="Especifique otro trabajo"
						control={form.control}
					/>
				)}

				<Separator className="my-2 bg-gray-200 md:col-span-2" />

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

				<h2 className="text-lg font-semibold text-gray-700">Analisis seguro del trabajo</h2>

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
				</div>

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
						name="otherPreventiveControlMeasures"
						label="Especifique otras medidas"
						control={form.control}
					/>
				)}

				<FormLabel className="mt-4 text-gray-700 md:col-span-2">Evaluacion Ambiental</FormLabel>

				<SwitchFormField<WorkPermitSchema>
					name="generateWaste"
					control={form.control}
					label="La ejecución del trabajo generará residuos"
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

				<Separator className="my-2 bg-gray-200 md:col-span-2" />

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
				/>

				<InputFormField<WorkPermitSchema>
					name="preventionOfficer"
					label="Oficial de prevención"
					control={form.control}
				/>

				{false && (
					<>
						<Separator className="my-2 bg-gray-200 md:col-span-2" />

						<h2 className="text-lg font-semibold text-gray-700 md:col-span-2">
							Recepcion del trabajo
						</h2>

						<InputFormField<WorkPermitSchema>
							name="whoReceives"
							label="Quien recibe (Cierre de PT)"
							control={form.control}
						/>

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
						/>
					</>
				)}

				<Separator className="mt-2 bg-gray-200 md:col-span-2" />

				<div className="flex w-full items-center justify-between md:col-span-2">
					<h2 className="text-lg font-semibold text-gray-700 md:col-span-2">
						Registro de participacion
					</h2>

					<Button
						type="button"
						variant="outline"
						onClick={() => appendParticipants({ fullName: "", rut: "", company: "" })}
					>
						Agregar participante <Plus />
					</Button>
				</div>

				{participantsFields.map((field, index) => (
					<div
						key={field.id}
						className="mb-1 flex w-full flex-wrap items-center gap-2 md:col-span-2 md:flex-nowrap"
					>
						<InputFormField<WorkPermitSchema>
							name={`participants.${index}.fullName`}
							label="Nombre completo"
							control={form.control}
						/>

						<RutFormField<WorkPermitSchema>
							name={`participants.${index}.rut`}
							label="RUT"
							control={form.control}
						/>

						<InputFormField<WorkPermitSchema>
							name={`participants.${index}.company`}
							label="Empresa"
							control={form.control}
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
					name="additionalObservations"
					label="Observaciones adicionales a los trabajos"
					control={form.control}
				/>

				<SwitchFormField<WorkPermitSchema>
					name="acceptTerms"
					control={form.control}
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
	)
}
