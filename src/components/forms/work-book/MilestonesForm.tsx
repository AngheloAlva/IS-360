"use client"

import { type FieldError, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
	Trash2Icon,
	ListCheckIcon,
	MilestoneIcon,
	PlusCircleIcon,
	ChevronRightIcon,
} from "lucide-react"

import { createMilestones } from "@/actions/work-orders/manage-milestones"
import { cn } from "@/lib/utils"
import {
	workBookMilestonesSchema,
	type WorkBookMilestonesSchema,
} from "@/lib/form-schemas/work-book/milestones.schema"

import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { Form, FormDescription, FormMessage } from "@/components/ui/form"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

interface MilestonesFormProps {
	workOrderId: string
}

export default function MilestonesForm({ workOrderId }: MilestonesFormProps) {
	const [loading, setLoading] = useState<boolean>(false)
	const [activeTab, setActiveTab] = useState("0")
	const [open, setOpen] = useState(false)
	const router = useRouter()

	const form = useForm<WorkBookMilestonesSchema>({
		resolver: zodResolver(workBookMilestonesSchema),
		defaultValues: {
			workOrderId,
			milestones: [
				{
					name: "",
					description: "",
					weight: "0",
					tasks: [
						{
							name: "",
							description: "",
						},
					],
				},
			],
		},
	})

	const {
		fields: milestoneFields,
		append: milestoneAppend,
		remove: milestoneRemove,
	} = useFieldArray({
		control: form.control,
		name: "milestones",
	})

	const onSubmit = async (values: WorkBookMilestonesSchema) => {
		try {
			setLoading(true)

			const result = await createMilestones(values)

			if (result.ok) {
				toast.success("Hitos guardados correctamente", {
					description: result.message,
					duration: 5000,
				})

				setOpen(false)
				router.refresh()
			} else {
				toast.error("Error al guardar los hitos", {
					description: result.message,
					duration: 5000,
				})
			}
		} catch (error) {
			console.error(error)

			toast.error("Error al guardar los hitos", {
				description: (error as Error).message,
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className="bg-primary hover:bg-primary/80 flex h-10 items-center justify-center gap-1 rounded-md px-3 text-sm text-white"
				onClick={() => setOpen(true)}
			>
				<PlusCircleIcon className="h-4 w-4" />
				<span className="hidden sm:inline">Agregar Hitos</span>
			</SheetTrigger>

			<SheetContent side="right" className="gap-0 sm:max-w-[50dvw]">
				<SheetHeader className="shadow">
					<SheetTitle>Agregar Hitos y Actividades</SheetTitle>
					<SheetDescription>
						Gestione los hitos y actividades para el libro de obras. Cada hito debe tener al menos
						una actividad. La suma de los pesos de los hitos debe ser exactamente 100%.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6 overflow-y-auto px-4 pb-14"
					>
						{form.formState.errors.milestones &&
							form.formState.errors.milestones.length &&
							form.formState.errors.milestones?.length > 0 && (
								<div className="rounded-md border border-red-500 bg-red-50 p-3 text-sm text-red-800">
									<p className="font-medium">Errores de validación:</p>
									<FormMessage className="mt-1" />
									<ul className="mt-2 list-disc pl-5">
										{(form.formState.errors.milestones as FieldError[])?.map((error, index) => (
											<li key={index}>{error?.message}</li>
										))}
									</ul>
								</div>
							)}
						<Tabs
							defaultValue="0"
							value={activeTab}
							onValueChange={setActiveTab}
							className="flex min-h-full flex-col gap-4 md:flex-row"
						>
							<div className="md:w-1/4">
								<TabsList className="flex h-auto w-full flex-row justify-start gap-1 bg-transparent p-0 pt-4 md:flex-col">
									{milestoneFields.map((field, index) => (
										<TabsTrigger
											key={field.id}
											value={index.toString()}
											className={cn(
												"border-input w-full justify-start border px-3 py-2 font-bold tracking-wide md:border-0",
												"data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
											)}
										>
											<div className="flex w-full justify-between">
												<span className="truncate">
													{form.watch(`milestones.${index}.name`) || `Hito ${index + 1}`}
												</span>
												{milestoneFields.length > 1 && (
													<div
														className="hover:bg-accent hover:text-text size-5 cursor-pointer rounded-full p-0.5 transition-colors"
														onClick={(e) => {
															e.stopPropagation()
															milestoneRemove(index)

															if (activeTab === index.toString()) {
																if (index > 0) {
																	setActiveTab((index - 1).toString())
																} else if (milestoneFields.length > 1) {
																	setActiveTab("0")
																}
															} else if (parseInt(activeTab) > index) {
																setActiveTab((parseInt(activeTab) - 1).toString())
															}
														}}
													>
														<Trash2Icon className="h-3.5 w-3.5" />
													</div>
												)}
											</div>
										</TabsTrigger>
									))}

									<Button
										type="button"
										variant="ghost"
										className="text-primary mt-2 w-full"
										onClick={() => {
											milestoneAppend({
												name: "",
												weight: "0",
												description: "",
												tasks: [{ name: "", isCompleted: false, description: "" }],
											})
											setActiveTab(milestoneFields.length.toString())
										}}
									>
										<PlusCircleIcon className="h-4 w-4" />
										Agregar Hito
									</Button>
								</TabsList>
							</div>

							<div className="border-l-0 pl-0 md:w-3/4 md:border-l md:pl-4">
								{milestoneFields.map((field, index) => (
									<TabsContent key={field.id} value={index.toString()} className="m-0 pt-4">
										<MilestoneForm form={form} index={index} />
									</TabsContent>
								))}
							</div>
						</Tabs>

						<Separator className="mb-6" />

						<SubmitButton isSubmitting={loading} label="Guardar Hitos y Actividades" />
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}

interface MilestoneFormProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	form: any
	index: number
}

function MilestoneForm({ form, index }: MilestoneFormProps) {
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: `milestones.${index}.tasks`,
	})

	const startDateError = form.formState.errors.milestones?.[index]?.startDate?.message
	const endDateError = form.formState.errors.milestones?.[index]?.endDate?.message

	return (
		<div className="space-y-4">
			<div className="space-y-5">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between">
					<h3 className="flex items-center gap-x-2 text-lg font-bold">
						Detalles del Hito
						<MilestoneIcon className="size-5" />
					</h3>
					<FormDescription className="mt-0">Datos estimados para el hito</FormDescription>
				</div>

				{(startDateError || endDateError) && (
					<div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
						<p className="font-medium">Advertencias de fechas:</p>
						<ul className="mt-2 list-disc pl-5">
							{startDateError && <li>{startDateError}</li>}
							{endDateError && <li>{endDateError}</li>}
						</ul>
					</div>
				)}

				<div className="grid grid-cols-1 gap-x-3 gap-y-5 md:grid-cols-2">
					<InputFormField<WorkBookMilestonesSchema>
						control={form.control}
						label="Nombre del Hito"
						name={`milestones.${index}.name`}
					/>

					<InputFormField<WorkBookMilestonesSchema>
						min={1}
						step={0.1}
						type="number"
						label="Peso del Hito"
						control={form.control}
						name={`milestones.${index}.weight`}
					/>

					<DatePickerFormField<WorkBookMilestonesSchema>
						control={form.control}
						label="Fecha de inicio"
						name={`milestones.${index}.startDate`}
					/>

					<DatePickerFormField<WorkBookMilestonesSchema>
						control={form.control}
						label="Fecha de finalización"
						name={`milestones.${index}.endDate`}
					/>
				</div>

				<TextAreaFormField<WorkBookMilestonesSchema>
					label="Descripción"
					control={form.control}
					name={`milestones.${index}.description`}
				/>
			</div>

			<Separator />

			<div className="space-y-5">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between">
					<h3 className="flex items-center gap-x-2 text-lg font-bold">
						Actividades del Hito
						<ListCheckIcon className="size-5" />
					</h3>
					<FormDescription className="mt-0">Debe agregar al menos una actividad</FormDescription>
				</div>

				<div className="space-y-5">
					{fields.map((field, taskIndex) => (
						<div key={field.id}>
							<div className="pb-2">
								<div className="flex items-center justify-between">
									<h3 className="flex items-center text-base font-semibold">
										<ChevronRightIcon className="size-4" /> Actividad {taskIndex + 1}
									</h3>
									{fields.length > 1 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => remove(taskIndex)}
										>
											<Trash2Icon className="h-4 w-4" />
										</Button>
									)}
								</div>
							</div>

							<div className="space-y-4">
								<div className="grid grid-cols-1 gap-x-3 gap-y-5 md:grid-cols-2">
									<InputFormField<WorkBookMilestonesSchema>
										control={form.control}
										label="Nombre de la Actividad"
										name={`milestones.${index}.tasks.${taskIndex}.name`}
									/>

									<div className="grid grid-cols-2 gap-2">
										<InputFormField<WorkBookMilestonesSchema>
											placeholder="Horas"
											control={form.control}
											label="Horas estimadas"
											name={`milestones.${index}.tasks.${taskIndex}.estimatedHours`}
										/>

										<InputFormField<WorkBookMilestonesSchema>
											label="Personas"
											control={form.control}
											name={`milestones.${index}.tasks.${taskIndex}.estimatedPeople`}
										/>
									</div>

									<DatePickerFormField<WorkBookMilestonesSchema>
										control={form.control}
										label="Fecha planeada"
										name={`milestones.${index}.tasks.${taskIndex}.plannedDate`}
									/>

									<div className="grid grid-cols-2 gap-2">
										<InputFormField<WorkBookMilestonesSchema>
											control={form.control}
											label="Hora inicio"
											name={`milestones.${index}.tasks.${taskIndex}.activityStartTime`}
											placeholder="08:00"
										/>
										<InputFormField<WorkBookMilestonesSchema>
											control={form.control}
											label="Hora fin"
											name={`milestones.${index}.tasks.${taskIndex}.activityEndTime`}
											placeholder="17:00"
										/>
									</div>
								</div>

								<TextAreaFormField<WorkBookMilestonesSchema>
									label="Descripción"
									control={form.control}
									name={`milestones.${index}.tasks.${taskIndex}.description`}
								/>
							</div>
						</div>
					))}

					<Button
						type="button"
						variant="ghost"
						className="text-primary w-full"
						onClick={() =>
							append({
								name: "",
								description: "",
							})
						}
					>
						<PlusCircleIcon className="h-4 w-4" />
						Agregar Actividad
					</Button>
				</div>
			</div>
		</div>
	)
}
