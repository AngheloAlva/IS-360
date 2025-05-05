"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { ClockIcon, UsersIcon, CalendarIcon, ListCheckIcon, CheckCircleIcon } from "lucide-react"

import { completeMilestoneTask } from "@/actions/work-orders/manage-milestones"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

interface TaskFormData {
	activityStartTime: string
	activityEndTime: string
	comments: string
}

export default function MilestoneCards({ milestones }: MilestoneCardsProps) {
	const [selectedTask, setSelectedTask] = useState<MilestoneTask | null>(null)
	const [taskFormOpen, setTaskFormOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState<TaskFormData>({
		activityStartTime: "",
		activityEndTime: "",
		comments: "",
	})
	const router = useRouter()

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleCompleteTask = async () => {
		if (!selectedTask) return

		try {
			setIsSubmitting(true)

			const result = await completeMilestoneTask(selectedTask.id, {
				activityStartTime: formData.activityStartTime,
				activityEndTime: formData.activityEndTime,
				comments: formData.comments,
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
		setFormData({
			activityStartTime: task.activityStartTime || "08:00",
			activityEndTime: task.activityEndTime || "18:00",
			comments: task.comments || "",
		})
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
														"border-green-200 bg-green-50": task.isCompleted,
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
																variant="outline"
																size="sm"
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
																			Fecha planificada:{" "}
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
				<SheetContent className="sm:max-w-md">
					<SheetHeader>
						<SheetTitle>Completar actividad</SheetTitle>
						<SheetDescription>
							Complete los detalles para registrar esta actividad en el libro de obras.
						</SheetDescription>
					</SheetHeader>

					<div className="grid gap-4 p-4 pt-0">
						<div className="grid gap-2">
							<Label htmlFor="taskName" className="text-base font-medium">
								Actividad: {selectedTask?.name}
							</Label>
						</div>

						<div className="grid grid-cols-2 gap-x-2 gap-y-5">
							<div className="grid gap-2">
								<Label htmlFor="activityStartTime">Hora de inicio</Label>
								<Input
									id="activityStartTime"
									name="activityStartTime"
									value={formData.activityStartTime}
									onChange={handleChange}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="activityEndTime">Hora de término</Label>
								<Input
									id="activityEndTime"
									name="activityEndTime"
									value={formData.activityEndTime}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="comments">Comentarios adicionales</Label>
							<Textarea
								id="comments"
								name="comments"
								className="min-h-28"
								placeholder="Detalles sobre la actividad realizada..."
								value={formData.comments}
								onChange={handleChange}
								rows={4}
							/>
						</div>
					</div>

					<SheetFooter>
						<Button
							variant="outline"
							onClick={() => setTaskFormOpen(false)}
							disabled={isSubmitting}
						>
							Cancelar
						</Button>
						<Button onClick={handleCompleteTask} disabled={isSubmitting}>
							{isSubmitting ? "Guardando..." : "Completar y guardar"}
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</>
	)
}
