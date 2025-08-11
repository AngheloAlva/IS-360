"use client"

import { Trash2Icon, MilestoneIcon, PlusCircleIcon, PenBoxIcon } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"

import { createAndUpdateMilestones } from "../../actions/milestone/create-and-update-milestones"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"
import {
	workBookMilestonesSchema,
	type WorkBookMilestonesSchema,
} from "@/project/work-order/schemas/milestones.schema"

import { Tabs, TabsContent, TabsList, TabsTrigger, TabsContents } from "@/shared/components/ui/tabs"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { Form, FormDescription, FormMessage } from "@/shared/components/ui/form"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Button } from "@/shared/components/ui/button"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

import type { Milestone } from "../../hooks/use-work-book-milestones"

interface MilestonesFormProps {
	workOrderId: string
	workOrderStartDate: Date
	initialData?: Milestone[]
}

export default function MilestonesForm({ initialData, workOrderId }: MilestonesFormProps) {
	const [loading, setLoading] = useState<boolean>(false)
	const [activeTab, setActiveTab] = useState("0")
	const [open, setOpen] = useState(false)

	const form = useForm<WorkBookMilestonesSchema>({
		resolver: zodResolver(workBookMilestonesSchema),
		defaultValues: {
			workOrderId,
			milestones: initialData
				? initialData.map((milestone) => ({
						id: milestone.id,
						name: milestone.name,
						weight: milestone.weight.toString(),
						description: milestone.description || "",
						activityCount: milestone.activities.length || 0,
						endDate: new Date(milestone.endDate || new Date()),
						startDate: new Date(milestone.startDate || new Date()),
					}))
				: [
						{
							name: "",
							weight: "",
							description: "",
							activityCount: 0,
							endDate: undefined,
							startDate: undefined,
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

			const result = await createAndUpdateMilestones(values)

			if (result.ok) {
				toast.success("Hitos guardados correctamente", {
					description: result.message,
					duration: 5000,
				})

				setOpen(false)
				queryClient.invalidateQueries({
					queryKey: ["workBookMilestones", { workOrderId, showAll: true }],
				})
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
				className="flex h-10 cursor-pointer items-center justify-center gap-1 rounded-md bg-orange-600 px-3 text-sm text-white transition-all hover:scale-105 hover:bg-orange-700"
				onClick={() => setOpen(true)}
			>
				{initialData ? (
					<>
						<PenBoxIcon className="size-4" />
						<span className="hidden sm:inline">Editar Hitos</span>
					</>
				) : (
					<>
						<PlusCircleIcon className="size-4" />
						<span className="hidden sm:inline">Agregar Hitos</span>
					</>
				)}
			</SheetTrigger>

			<SheetContent side="right" className="gap-0 sm:max-w-[70dvw] lg:max-w-[50dvw]">
				<SheetHeader className="shadow">
					<SheetTitle>{initialData ? "Editar Hitos" : "Agregar Hitos"}</SheetTitle>
					<SheetDescription>
						Gestione los hitos para el libro de obras. Podrá agregar actividades diarias despues y
						relacionarlas con los hitos.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="h-full space-y-6 overflow-y-auto px-4 pb-24"
					>
						{form.formState.errors.milestones?.root && (
							<div className="rounded-md border border-red-500 bg-red-50 p-3 text-sm text-red-800">
								<p className="font-medium">Errores de validación:</p>
								<FormMessage className="mt-1" />
								<span>{form.formState.errors.milestones?.root.message}</span>
							</div>
						)}

						{milestoneFields.some(
							(_, index) =>
								form.formState.errors.milestones?.[index]?.startDate ||
								form.formState.errors.milestones?.[index]?.endDate
						) && (
							<div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
								<p className="font-medium">Advertencias de fechas:</p>
								<ul className="mt-2 list-disc pl-5">
									{milestoneFields.map((_, index) => (
										<div key={index}>
											{form.formState.errors.milestones?.[index]?.startDate && (
												<li>
													Hito {index + 1}:{" "}
													{form.formState.errors.milestones[index]?.startDate?.message}
												</li>
											)}
											{form.formState.errors.milestones?.[index]?.endDate && (
												<li>
													Hito {index + 1}:{" "}
													{form.formState.errors.milestones[index]?.endDate?.message}
												</li>
											)}
										</div>
									))}
								</ul>
							</div>
						)}

						<Tabs
							defaultValue="0"
							value={activeTab}
							onValueChange={setActiveTab}
							className="flex flex-col gap-4 md:flex-row"
						>
							<div className="md:w-1/4">
								<TabsList className="grid h-auto w-full grid-cols-2 justify-start gap-1 bg-transparent p-0 pt-4 md:flex md:flex-col">
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

												{milestoneFields.length > 1 && field.activityCount === 0 && (
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
										className="text-primary col-span-2 mt-2 w-full"
										onClick={() => {
											milestoneAppend({
												name: "",
												weight: "",
												description: "",
												activityCount: 0,
												endDate: new Date(),
												startDate: new Date(),
											})
											setActiveTab(milestoneFields.length.toString())
										}}
									>
										<PlusCircleIcon className="h-4 w-4" />
										Agregar Hito
									</Button>
								</TabsList>
							</div>

							<div className="border-l-0 pl-0 md:w-3/4 md:border-l">
								<TabsContents>
									{milestoneFields.map((field, index) => (
										<TabsContent key={field.id} value={index.toString()} className="m-0 pt-4">
											<MilestoneForm form={form} index={index} />
										</TabsContent>
									))}
								</TabsContents>
							</div>
						</Tabs>

						<SubmitButton
							isSubmitting={loading}
							label="Guardar Hitos"
							className="hover:scale-[1.02]"
						/>
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
	return (
		<div className="w-full space-y-4 px-4">
			<div className="space-y-5">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between">
					<h3 className="flex items-center gap-x-2 text-lg font-bold">
						Detalles del Hito
						<MilestoneIcon className="size-5" />
					</h3>
					<FormDescription className="mt-0">Datos estimados para el hito</FormDescription>
				</div>

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
						label="Porcentaje del Hito"
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
		</div>
	)
}
