"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Plus, X } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { workPermitSchema } from "@/lib/form-schemas/work-permit/work-permit-schema"
import { createWorkPermit } from "@/actions/work-permit/createWorkPermit"
import { formatRut } from "@/utils/formatRut"
import { cn } from "@/lib/utils"
import {
	ToolsOptions,
	RisksOptions,
	MutualityOptions,
	PreChecksOptions,
	WorkWillBeOptions,
	WasteTypesOptions,
	ControlMeasuresOptions,
} from "@/lib/consts/work-permit-options"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import MultipleSelector from "@/components/ui/multiselect"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
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
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/components/ui/select"

export default function WorkPermitForm({ userId }: { userId: string }): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<z.infer<typeof workPermitSchema>>({
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
			participants: [{ fullName: "", rut: "", company: "", number: "" }],
		},
	})

	const router = useRouter()

	async function onSubmit(values: z.infer<typeof workPermitSchema>) {
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
				<FormField
					control={form.control}
					name="aplicantPt"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Solicitante PT</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Solicitante"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="responsiblePt"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Responsable PT</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Responsable"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="executanCompany"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Empresa Ejecutante / Interno</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Empresa"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="mutuality"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Mutualidad</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="border-gray-200">
										<SelectValue placeholder="Seleccione una mutualidad" />
									</SelectTrigger>
								</FormControl>
								<SelectContent className="text-neutral-700">
									{MutualityOptions.map((option) => (
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

				{mutualityAreOther && (
					<FormField
						control={form.control}
						name="otherMutuality"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Otro</FormLabel>
								<FormControl>
									<Input
										className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
										placeholder="Otro"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<Separator className="mt-2 bg-gray-200 md:col-span-2" />

				<FormField
					control={form.control}
					name="initDate"
					render={({ field }) => (
						<FormItem className="flex flex-col pt-2.5">
							<FormLabel className="text-gray-700">Fecha Inicio Trabajo</FormLabel>
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
					name="hour"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Hora</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Hora"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="otNumber"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Número de OT</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Número de OT"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="workersNumber"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Número de trabajadores</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Número de trabajadores"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="workDescription"
					render={({ field }) => (
						<FormItem className="md:col-span-2">
							<FormLabel className="text-gray-700">Descripción del trabajo</FormLabel>
							<FormControl>
								<Textarea
									className="min-h-32 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Descripción del trabajo"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="exactPlace"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Lugar exacto</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Lugar exacto"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="workWillBe"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Trabajo a realizar</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="border-gray-200">
										<SelectValue placeholder="Seleccione una opción" />
									</SelectTrigger>
								</FormControl>
								<SelectContent className="text-neutral-700">
									{WorkWillBeOptions.map((option) => (
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
				{workWillBeAreOther && (
					<FormField
						control={form.control}
						name="workWillBeOther"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-gray-700">Especifique otro trabajo</FormLabel>
								<FormControl>
									<Input
										className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
										placeholder="Especifique otro trabajo"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<Separator className="my-2 bg-gray-200 md:col-span-2" />

				<FormField
					control={form.control}
					name="tools"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Herramienta y/o equipos a utilizar</FormLabel>
							<FormControl>
								<MultipleSelector
									value={ToolsOptions.filter((tool) => field.value.includes(tool.value))}
									options={ToolsOptions}
									placeholder="Seleccione una o más herramientas"
									commandProps={{
										label: "Herramientas",
									}}
									hideClearAllButton
									hidePlaceholderWhenSelected
									emptyIndicator={
										<p className="text-center text-sm">No hay más herramientas disponibles</p>
									}
									onChange={(options) => {
										field.onChange(options.map((option) => option.value))
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{toolsAreOther && (
					<FormField
						control={form.control}
						name="otherTools"
						render={({ field }) => (
							<FormItem className="items-start">
								<FormLabel className="text-gray-700">Especifique otras herramientas</FormLabel>
								<FormControl>
									<Input
										className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
										placeholder="Especifique otras herramientas"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<FormField
					control={form.control}
					name="preChecks"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">
								Chequeos previos al trabajo requeridos
							</FormLabel>
							<FormControl>
								<MultipleSelector
									value={PreChecksOptions.filter((preCheck) =>
										field.value.includes(preCheck.value)
									)}
									options={PreChecksOptions}
									placeholder="Seleccione uno o más chequeos"
									commandProps={{
										label: "Chequeos",
									}}
									hideClearAllButton
									hidePlaceholderWhenSelected
									emptyIndicator={
										<p className="text-center text-sm">No hay más chequeos disponibles</p>
									}
									onChange={(options) => {
										field.onChange(options.map((option) => option.value))
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{preChecksAreOther && (
					<FormField
						control={form.control}
						name="otherPreChecks"
						render={({ field }) => (
							<FormItem className="items-start">
								<FormLabel className="h-fit text-gray-700">Especifique otros chequeos</FormLabel>
								<FormControl>
									<Input
										className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
										placeholder="Especifique otros chequeos"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
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

				<FormField
					control={form.control}
					name="riskIdentification"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Identificacion de riesgos</FormLabel>
							<FormControl>
								<MultipleSelector
									value={RisksOptions.filter((risk) => field.value.includes(risk.value))}
									options={RisksOptions}
									placeholder="Seleccione uno o más riesgos"
									commandProps={{
										label: "Riesgos",
									}}
									hideClearAllButton
									hidePlaceholderWhenSelected
									emptyIndicator={
										<p className="text-center text-sm">No hay más riesgos disponibles</p>
									}
									onChange={(options) => {
										field.onChange(options.map((option) => option.value))
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{riskAreOther && (
					<FormField
						control={form.control}
						name="otherRisk"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-gray-700">Especifique otros riesgos</FormLabel>
								<FormControl>
									<Input
										className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
										placeholder="Especifique otros riesgos"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<FormField
					control={form.control}
					name="preventiveControlMeasures"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Medidas de control preventivas</FormLabel>

							<FormControl>
								<MultipleSelector
									value={ControlMeasuresOptions.filter((measure) =>
										field.value.includes(measure.value)
									)}
									options={ControlMeasuresOptions}
									placeholder="Seleccione una o más medidas"
									commandProps={{
										label: "Medidas",
									}}
									hideClearAllButton
									hidePlaceholderWhenSelected
									emptyIndicator={
										<p className="text-center text-sm">No hay más medidas disponibles</p>
									}
									onChange={(options) => {
										field.onChange(options.map((option) => option.value))
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{controlMeasuresAreOther && (
					<FormField
						control={form.control}
						name="otherPreventiveControlMeasures"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-gray-700">Especifique otras medidas</FormLabel>
								<FormControl>
									<Input
										className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
										placeholder="Especifique otras medidas"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<FormLabel className="mt-4 text-gray-700 md:col-span-2">Evaluacion Ambiental</FormLabel>
				<FormField
					control={form.control}
					name="generateWaste"
					render={({ field }) => (
						<FormItem className="flex items-center md:col-span-2">
							<FormControl>
								<Checkbox checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel>La ejecución del trabajo generará residuos</FormLabel>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				{generateWaste && (
					<>
						<FormField
							control={form.control}
							name="wasteType"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-gray-700">Tipo de residuo</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger className="border-gray-200">
													<SelectValue placeholder="Seleccione un tipo de residuo" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="text-neutral-700">
												{WasteTypesOptions.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="wasteDisposalLocation"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-gray-700">Los residuos seran dispuestos en</FormLabel>
									<FormControl>
										<Input
											className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
											placeholder="Lugar de disposición de residuos"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
				)}

				<Separator className="my-2 bg-gray-200 md:col-span-2" />

				<h2 className="text-lg font-semibold text-gray-700 md:col-span-2">
					Firmas de autorización
				</h2>

				<FormField
					control={form.control}
					name="whoDeliversWorkAreaOp"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Quien entrega el área de trabajo (OP)</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Quien entrega el area trabajo"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="workerExecutor"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Ejecutor del trabajo</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Ejecutor del trabajo"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="preventionOfficer"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Oficial de prevención</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Oficial de prevención"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* // TODO: Permitir solo al actualizar por personal de OTC */}
				{false && (
					<>
						<Separator className="my-2 bg-gray-200 md:col-span-2" />

						<h2 className="text-lg font-semibold text-gray-700 md:col-span-2">
							Recepcion del trabajo
						</h2>
						<FormField
							control={form.control}
							name="whoReceives"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-gray-700">Quien recibe (Cierre de PT)</FormLabel>
									<FormControl>
										<Input
											className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
											placeholder="Quien recibe"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="cleanAndTidyWorkArea"
							render={({ field }) => (
								<FormItem className="flex items-center md:col-span-2">
									<FormControl>
										<Checkbox checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>El área de trabajo se encuentra limpia y ordenada</FormLabel>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="workCompleted"
							render={({ field }) => (
								<FormItem className="flex items-center md:col-span-2">
									<FormControl>
										<Checkbox checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>Trabajo terminado</FormLabel>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="observations"
							render={({ field }) => (
								<FormItem className="md:col-span-2">
									<FormLabel className="mt-2 text-gray-700">Observaciones</FormLabel>
									<FormControl>
										<Textarea
											className="min-h-32 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
											placeholder="Observaciones"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
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
						onClick={() => appendParticipants({ fullName: "", rut: "", company: "", number: "" })}
					>
						Agregar participante <Plus />
					</Button>
				</div>

				{participantsFields.map((field, index) => (
					<div
						key={field.id}
						className="mb-1 flex w-full flex-wrap items-center gap-2 md:col-span-2 md:flex-nowrap"
					>
						<FormField
							control={form.control}
							name={`participants.${index}.number`}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-gray-700">Número</FormLabel>
									<FormControl>
										<Input
											type="number"
											className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={`participants.${index}.fullName`}
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel className="text-gray-700">Nombre completo</FormLabel>
									<FormControl>
										<Input
											className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
											placeholder="Nombre completo"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name={`participants.${index}.rut`}
							render={({ field }) => {
								// eslint-disable-next-line @typescript-eslint/no-unused-vars
								const { onChange, ...restFieldProps } = field

								return (
									<FormItem className="w-full">
										<FormLabel className="text-gray-700">RUT</FormLabel>
										<FormControl>
											<Input
												className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
												placeholder="RUT"
												onChange={(e) => {
													field.onChange(formatRut(e.target.value))
												}}
												{...restFieldProps}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)
							}}
						/>

						<FormField
							control={form.control}
							name={`participants.${index}.company`}
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel className="text-gray-700">Empresa</FormLabel>
									<FormControl>
										<Input
											className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
											placeholder="Empresa"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
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

				<FormField
					control={form.control}
					name="additionalObservations"
					render={({ field }) => (
						<FormItem className="md:col-span-2">
							<FormLabel className="text-gray-700">
								Observaciones adicionales a los trabajos
							</FormLabel>
							<FormControl>
								<Textarea
									className="min-h-32 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Observaciones adicionales"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="acceptTerms"
					render={({ field }) => (
						<FormItem className="flex items-center md:col-span-2">
							<FormControl>
								<Checkbox checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
							<div className="flex flex-col space-y-1 leading-none">
								<FormLabel>
									Los trabajadores declaran haber sido participe en la ejecucion del analisis de
									trabajo seguro (AST), estar instruido acerca del metodo correcto y seguro de
									trabajo, los riesgos y peligros asociados y sus medidas de prevencion.
								</FormLabel>
								<FormMessage className="mt-2" />
							</div>
						</FormItem>
					)}
				/>

				<Button
					className="mt-4 md:col-span-2"
					type="submit"
					size={"lg"}
					disabled={isSubmitting || !acceptTerms}
				>
					{!isSubmitting ? (
						"Enviar solicitud"
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
