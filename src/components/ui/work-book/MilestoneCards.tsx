"use client"

import { ClockIcon, UsersIcon, CalendarIcon, ListCheckIcon, CheckCircleIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

import { completeMilestoneTask } from "@/actions/work-orders/manage-milestones"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { cn } from "@/lib/utils"
import {
	confirmActivitySchema,
	ConfirmActivitySchema,
} from "@/lib/form-schemas/work-book/confirm-activity.schema"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import UploadFilesFormField from "@/components/forms/shared/UploadFilesFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Form } from "../form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetFooter,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

interface MilestoneTask {
	id: string
	name: string
	description?: string | null
	order: number
	isCompleted: boolean
	plannedDate?: Date | null
	activityStartTime?: string | null
	activityEndTime?: string | null
	estimatedHours?: number | null
	estimatedPeople?: number | null
	weight?: number
	completedAt?: Date | null
	completedBy?: string | null
	comments?: string | null
}

interface Milestone {
	id: string
	name: string
	description?: string | null
	order: number
	isCompleted: boolean
	progress: number
	weight: number
	startDate?: Date | null
	endDate?: Date | null
	tasks: MilestoneTask[]
}

interface MilestoneCardsProps {
	milestones: Milestone[]
}

export default function MilestoneCards({ milestones }: MilestoneCardsProps) {
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [selectedTask, setSelectedTask] = useState<MilestoneTask | null>(null)
	const [taskFormOpen, setTaskFormOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<ConfirmActivitySchema>({
		resolver: zodResolver(confirmActivitySchema),
		defaultValues: {
			executionDate: new Date(),
			activityStartTime: "",
			activityEndTime: "",
			comments: "",
		},
	})

	const router = useRouter()

	const onSubmit = async (values: ConfirmActivitySchema) => {
		if (!selectedTask) return

		const files = form.getValues("files")

		try {
			setIsSubmitting(true)

			if (files && files.length > 0) {
				const uploadResults = await uploadFilesToCloud({
					files,
					containerType: "files",
					randomString: selectedTask.id,
					secondaryName: selectedTask.name,
				})

				const result = await completeMilestoneTask(
					selectedTask.id,
					{
						...values,
						files: undefined,
					},
					uploadResults
				)

				if (result.ok) {
					toast.success("Actividad completada", {
						description:
							"La actividad se ha marcado como completada y se ha registrado en el libro de obras.",
					})

					setTaskFormOpen(false)
					router.refresh()
				} else {
					toast.error("Error al completar la actividad", {
						description: result.message,
					})
				}
			} else {
				const result = await completeMilestoneTask(selectedTask.id, {
					...values,
					files: undefined,
				})

				if (result.ok) {
					toast.success("Actividad completada", {
						description:
							"La actividad se ha marcado como completada y se ha registrado en el libro de obras.",
					})

					setTaskFormOpen(false)
					router.refresh()
				} else {
					toast.error("Error al completar la actividad", {
						description: result.message,
					})
				}
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al completar la actividad")
		} finally {
			setIsSubmitting(false)
		}
	}

	if (milestones.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-center">
				<h3 className="text-lg font-medium">No hay hitos definidos</h3>
				<p className="text-muted-foreground mt-2">
					Utiliza el botón &quot;Agregar Hitos&quot; para agregar hitos y actividades a este libro
					de obras.
				</p>
			</div>
		)
	}

	const openTaskForm = (task: MilestoneTask) => {
		setSelectedTask(task)
		form.setValue("activityStartTime", task.activityStartTime || "")
		form.setValue("executionDate", task.plannedDate ? new Date(task.plannedDate) : new Date())
		form.setValue("activityEndTime", task.activityEndTime || "")
		form.setValue("comments", task.comments || "")
		setTaskFormOpen(true)
	}

	return (
		<>
			<div className="space-y-6">
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
					{milestones.map((milestone) => (
						<Card key={milestone.id}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1">
										<CardTitle className="text-lg font-bold">{milestone.name}</CardTitle>
										{milestone.isCompleted && (
											<CheckCircleIcon className="ml-1 h-4 w-4 text-green-500" />
										)}
									</div>
									<Badge
										variant="outline"
										className={cn("bg-red-500/10 text-red-500 hover:bg-red-500/20", {
											"bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20":
												milestone.progress >= 50,
											"bg-green-500/10 text-green-600 hover:bg-green-500/20":
												milestone.progress === 100,
										})}
									>
										{milestone.progress.toFixed(0)}%
									</Badge>
								</div>
								{milestone.description && (
									<CardDescription className="text-xs">{milestone.description}</CardDescription>
								)}
							</CardHeader>

							<CardContent>
								<div className="mb-2">
									<Progress
										value={milestone.progress}
										className="h-2"
										indicatorClassName={cn({
											"bg-yellow-500": milestone.progress >= 50,
											"bg-green-500": milestone.progress === 100,
										})}
									/>
								</div>

								<div className="text-muted-foreground text-xs">
									<div className="grid grid-cols-2 gap-2">
										{milestone.startDate && (
											<div className="flex items-center gap-1">
												<ClockIcon className="h-3 w-3" />
												<span>
													Inicio:{" "}
													{format(new Date(milestone.startDate), "dd MMM yyyy", {
														locale: es,
													})}
												</span>
											</div>
										)}
										{milestone.endDate && (
											<div className="flex items-center gap-1">
												<ClockIcon className="h-3 w-3" />
												<span>
													Fin:{" "}
													{format(new Date(milestone.endDate), "dd MMM yyyy", {
														locale: es,
													})}
												</span>
											</div>
										)}
									</div>
								</div>

								<div className="mt-8">
									<h4 className="flex items-center gap-1 text-base font-bold">
										<ListCheckIcon className="h-4 w-4" />
										Actividades <span className="text-sm">({milestone.tasks.length})</span>
									</h4>
									{milestone.tasks.length === 0 ? (
										<p className="text-muted-foreground mt-2 text-center text-xs">
											No hay actividades definidas para este hito
										</p>
									) : (
										<div className="mt-2 space-y-4">
											{milestone.tasks.map((task) => (
												<div
													key={task.id}
													className={cn("rounded-lg border p-3", {
														"border-green-500/50 bg-green-500/10": task.isCompleted,
														"border-input": !task.isCompleted,
													})}
												>
													<div className="flex items-center justify-between">
														<div className="flex-1">
															<div className="flex items-center gap-2">
																<div className="grid gap-0.5">
																	<div className="flex items-center">
																		<span
																			className={cn(
																				"text-sm leading-none font-semibold",
																				task.isCompleted && "text-muted-foreground line-through"
																			)}
																		>
																			{task.name}
																		</span>
																		{task.isCompleted && (
																			<CheckCircleIcon className="ml-2 h-4 w-4 text-green-500" />
																		)}
																	</div>
																	{task.isCompleted && task.completedAt && (
																		<p className="text-muted-foreground text-xs">
																			Completada el{" "}
																			{format(new Date(task.completedAt), "dd MMM yyyy", {
																				locale: es,
																			})}
																		</p>
																	)}
																</div>
															</div>
														</div>

														{!task.isCompleted && (
															<Button
																size="sm"
																variant="outline"
																className="border-green-500/50 bg-green-500/10 text-green-600 shadow-none hover:bg-green-500/20"
																onClick={() => openTaskForm(task)}
															>
																Completar
															</Button>
														)}
													</div>

													<div className="text-muted-foreground mt-3 text-xs">
														{task.description && (
															<div className="mb-3">
																<p>{task.description}</p>
															</div>
														)}

														<div className="grid grid-cols-2 gap-2">
															{task.plannedDate && (
																<div className="flex items-center gap-2">
																	<CalendarIcon className="h-3 w-3" />
																	<div>
																		<span className="text-xs">
																			{format(new Date(task.plannedDate), "dd MMM yyyy", {
																				locale: es,
																			})}
																		</span>
																	</div>
																</div>
															)}

															{task.estimatedHours !== null &&
																task.estimatedHours !== undefined && (
																	<div className="flex items-center gap-2">
																		<ClockIcon className="h-3 w-3" />
																		<div>
																			<span className="text-xs">
																				{task.estimatedHours} horas estimadas
																			</span>
																		</div>
																	</div>
																)}

															{task.estimatedPeople !== null &&
																task.estimatedPeople !== undefined && (
																	<div className="flex items-center gap-2">
																		<UsersIcon className="h-3 w-3" />
																		<div>
																			<span className="text-xs">
																				{task.estimatedPeople} persona
																				{task.estimatedPeople !== 1 ? "s" : ""}
																			</span>
																		</div>
																	</div>
																)}

															{task.activityStartTime && task.activityEndTime && (
																<div className="flex items-center gap-2">
																	<ClockIcon className="h-3 w-3" />
																	<div>
																		<span className="text-xs">
																			Horario: {task.activityStartTime} - {task.activityEndTime}
																		</span>
																	</div>
																</div>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			<Sheet open={taskFormOpen} onOpenChange={setTaskFormOpen}>
				<SheetContent className="gap-0 sm:max-w-md">
					<SheetHeader className="shadow">
						<SheetTitle>Completar actividad: {selectedTask?.name}</SheetTitle>
						<SheetDescription>
							Revisa los detalles de la actividad y modifica los campos si es necesario.
						</SheetDescription>
					</SheetHeader>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="grid gap-4 overflow-y-auto py-4"
						>
							<div className="grid h-full gap-4 px-2 pb-6 sm:grid-cols-2">
								<InputFormField<ConfirmActivitySchema>
									control={form.control}
									label="Hora de inicio"
									name="activityStartTime"
								/>

								<InputFormField<ConfirmActivitySchema>
									control={form.control}
									label="Hora de término"
									name="activityEndTime"
								/>

								<DatePickerFormField<ConfirmActivitySchema>
									name="executionDate"
									control={form.control}
									label="Fecha de ejecución"
									itemClassName="sm:col-span-2"
								/>

								<TextAreaFormField<ConfirmActivitySchema>
									name="comments"
									label="Comentarios"
									className="min-h-32"
									control={form.control}
									itemClassName="sm:col-span-2"
								/>

								<UploadFilesFormField<ConfirmActivitySchema>
									name="files"
									isMultiple={true}
									maxFileSize={500}
									className="hidden"
									control={form.control}
									selectedFileIndex={selectedFileIndex}
									containerClassName="w-full sm:col-span-2"
									setSelectedFileIndex={setSelectedFileIndex}
								/>
							</div>

							<SheetFooter className="gap-0">
								<Button
									type="button"
									variant="outline"
									disabled={isSubmitting}
									onClick={() => setTaskFormOpen(false)}
								>
									Cancelar
								</Button>

								<SubmitButton
									label="Completar actividad"
									isSubmitting={isSubmitting}
									className="hover:bg-primary/80"
								/>
							</SheetFooter>
						</form>
					</Form>
				</SheetContent>
			</Sheet>
		</>
	)
}
