"use client"

import { differenceInDays, format } from "date-fns"
import { useEffect, useState } from "react"
import { es } from "date-fns/locale"
import Link from "next/link"
import {
	LinkIcon,
	Clock3Icon,
	MapPinIcon,
	SettingsIcon,
	Building2Icon,
	CircleDotIcon,
	ListChecksIcon,
	ChevronLeftIcon,
	ArrowUpRightIcon,
	CalendarDaysIcon,
	ChevronRightIcon,
	HistoryIcon,
} from "lucide-react"

import { useMaintenanceTaskWorkOrders } from "@/project/maintenance-plan/hooks/use-maintenance-task-work-orders"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { TaskSpecialtyLabels } from "@/lib/consts/task-specialty"
import { TaskFrequencyLabels } from "@/lib/consts/task-frequency"
import { TaskTypeLabels } from "@/lib/consts/task-type"
import { PLAN_FREQUENCY } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"

import MaintenancePlanTaskForm from "@/project/maintenance-plan/components/forms/MaintenancePlanTaskForm"
import DeletePlanTaskDialog from "@/project/maintenance-plan/components/dialogs/DeletePlanTaskDialog"
import CreateWorkOrderForm from "@/project/work-order/components/forms/CreateWorkOrderForm"
import PostponeTaskDialog from "@/project/work-order/components/forms/PostponeTask"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/shared/components/ui/accordion"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import Spinner from "@/shared/components/Spinner"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

import type { MaintenancePlanTask } from "@/project/maintenance-plan/hooks/use-maintenance-plans-tasks"

interface MaintenancePlanTaskDetailDialogProps {
	open: boolean
	task: MaintenancePlanTask | null
	onOpenChange: (open: boolean) => void
	planSlug: string
	userId: string
}

const WORK_ORDERS_PAGE_SIZE = 5

export default function MaintenancePlanTaskDetailDialog({
	open,
	task,
	onOpenChange,
	planSlug,
	userId,
}: MaintenancePlanTaskDetailDialogProps) {
	const [workOrdersPage, setWorkOrdersPage] = useState(1)

	useEffect(() => {
		if (open) setWorkOrdersPage(1)
	}, [open, task?.id])

	const { data, isLoading } = useMaintenanceTaskWorkOrders({
		planSlug,
		taskId: task?.id,
		page: workOrdersPage,
		limit: WORK_ORDERS_PAGE_SIZE,
		enabled: open,
	})

	if (!task) return null

	const taskEquipments = task.equipments.length > 0 ? task.equipments : [task.equipment]
	const taskEquipmentNames = taskEquipments.map((equipment) => equipment.name)
	const taskEquipmentDisplayNames = taskEquipments.map(
		(equipment) =>
			`${equipment.name}${equipment.tag ? ` [${equipment.tag}]` : ""} - ${equipment.location?.path ?? ""}`
	)
	const taskEquipmentIds = taskEquipments.map((equipment) => equipment.id)
	const taskEquipmentLocations = [...new Set(taskEquipments.map((equipment) => equipment.location?.path ?? ""))]

	const totalPages = data?.pages ?? 1
	const canGoPrevious = workOrdersPage > 1
	const canGoNext = workOrdersPage < totalPages

	const frequencyBadgeClassName = cn("border-purple-500 bg-purple-500/10 text-purple-500", {
		"border-red-500 bg-red-500/10 text-red-500": task.frequency === PLAN_FREQUENCY.YEARLY,
		"border-amber-500 bg-amber-500/10 text-amber-500":
			task.frequency === PLAN_FREQUENCY.FOURMONTHLY,
		"border-teal-500 bg-teal-500/10 text-teal-500": task.frequency === PLAN_FREQUENCY.QUARTERLY,
		"border-blue-500 bg-blue-500/10 text-blue-500": task.frequency === PLAN_FREQUENCY.BIMONTHLY,
		"border-green-500 bg-green-500/10 text-green-500": task.frequency === PLAN_FREQUENCY.MONTHLY,
	})

	const nextDateBadgeClassName = (() => {
		const leftDays = differenceInDays(new Date(task.nextDate), new Date())
		return cn({
			"border-green-500 bg-green-500/10 text-green-500": leftDays > 15,
			"border-amber-500 bg-amber-500/10 text-amber-500": leftDays <= 15 && leftDays > 0,
			"border-red-500 bg-red-500/10 text-red-500": leftDays <= 0,
		})
	})()

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-hidden p-0 sm:max-w-4xl">
				<div className="h-3 w-full bg-purple-600" />

				<DialogHeader className="mt-1 px-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<DialogTitle className="flex items-center gap-2 text-xl">{task.name}</DialogTitle>

							<DialogDescription className="text-left">
								Detalle de tarea de mantenimiento
							</DialogDescription>
						</div>

						<div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
							<MaintenancePlanTaskForm
								compactTrigger
								userId={userId}
								triggerLabel="Editar"
								maintenancePlanSlug={planSlug}
								className="border border-purple-500/40 bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white"
								initialData={{
									id: task.id,
									name: task.name,
									nextDate: task.nextDate,
									frequency: task.frequency,
									specialty: task.specialty ?? undefined,
									taskType: task.taskType ?? undefined,
									isAutomated: task.isAutomated,
									emailsForCopy: task.emailsForCopy,
									automatedCapex: task.automatedCapex,
									automatedPriority: task.automatedPriority,
									description: task.description ?? undefined,
									automatedCompanyId: task.automatedCompanyId,
									automatedResponsibleId: task.automatedResponsibleId,
									equipmentId: taskEquipmentIds[0],
									equipmentIds: taskEquipmentIds,
									automatedSupervisorId: task.automatedSupervisorId,
									automatedWorkOrderType: task.automatedWorkOrderType,
									automatedDaysInAdvance: task.automatedDaysInAdvance,
									automatedEstimatedDays: task.automatedEstimatedDays,
									automatedEstimatedDaysByMonth: task.automatedEstimatedDaysByMonth,
									automatedEstimatedHours: task.automatedEstimatedHours,
									automatedWorkDescription: task.automatedWorkDescription,
									blockIfPreviousNotCompleted: task.blockIfPreviousNotCompleted,
								}}
							/>

							<div>
								<PostponeTaskDialog
									taskId={task.id}
									nextDate={task.nextDate}
									triggerLabel="Posponer"
								/>
							</div>

							<CreateWorkOrderForm
								equipmentId={taskEquipmentIds}
								maintenancePlanTaskId={[task.id]}
								equipmentName={taskEquipmentDisplayNames}
								triggerClassName="border font-normal gap-1 border-orange-500/40 bg-orange-500/10 text-orange-600 hover:bg-orange-500 hover:text-white w-fit h-7 rounded-md"
								buttonLabel="Crear OT"
								initialData={{
									workRequest: task.name,
									programDate: task.nextDate,
									responsibleId: task.createdBy.id,
									description: task.description ?? "",
								}}
							/>

							<div>
								<DeletePlanTaskDialog
									taskId={task.id}
									maintenancePlanSlug={planSlug}
									triggerLabel="Eliminar"
								/>
							</div>
						</div>
					</div>
				</DialogHeader>

				<ScrollArea className="max-h-[80dvh] px-6 pb-6">
					<div className="flex flex-col gap-6">
						<div className="space-y-3">
							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-1">
									<p className="text-muted-foreground text-xs">Frecuencia</p>
									<Badge className={frequencyBadgeClassName}>
										{TaskFrequencyLabels[task.frequency]}
									</Badge>
								</div>
								<div className="space-y-1">
									<p className="text-muted-foreground text-xs">Próxima ejecución</p>
									<Badge className={nextDateBadgeClassName}>
										{format(new Date(task.nextDate), "dd-MM-yyyy")}
									</Badge>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-1">
									<p className="text-muted-foreground text-xs">Especialidad</p>
									<p className="text-sm font-medium">
										{task.specialty ? TaskSpecialtyLabels[task.specialty] : "-"}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-muted-foreground text-xs">Tipo de Tarea</p>
									<p className="text-sm font-medium">
										{task.taskType ? TaskTypeLabels[task.taskType] : "-"}
									</p>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<p className="text-muted-foreground text-xs">OTs creadas</p>
									<p className="text-sm font-medium">{task._count.workOrders}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Creado por</p>
									<p className="text-sm font-medium">{task.createdBy.name}</p>
								</div>
								<div className="flex flex-col items-start gap-1">
									<div className="flex items-center gap-1.5">
										<SettingsIcon className="text-muted-foreground mt-0.5 size-4" />
										<p className="text-muted-foreground text-xs">Equipos</p>
									</div>
									<p className="text-sm font-medium">{taskEquipmentNames.join(", ")}</p>
								</div>
								<div className="flex flex-col items-start gap-1">
									<div className="flex items-center gap-1.5">
										<MapPinIcon className="text-muted-foreground mt-0.5 size-4" />
										<p className="text-muted-foreground text-xs">Ubicaciones</p>
									</div>
									<p className="text-sm font-medium">{taskEquipmentLocations.join(", ")}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Fecha de creación</p>
									<p className="text-sm font-medium">
										{format(new Date(task.createdAt), "dd-MM-yyyy")}
									</p>
								</div>
							</div>

							<div>
								<p className="text-muted-foreground text-xs">Descripción</p>
								<p className="text-sm">{task.description || "-"}</p>
							</div>

							<div>
								<p className="text-muted-foreground mb-1 text-xs">Adjuntos</p>
								{task.attachments.length === 0 ? (
									<p className="text-muted-foreground text-sm">Sin adjuntos</p>
								) : (
									<ul className="space-y-1">
										{task.attachments.map((attachment) => (
											<li key={attachment.id}>
												<Link
													href={attachment.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
												>
													{attachment.name}
													<LinkIcon className="size-4" />
												</Link>
											</li>
										))}
									</ul>
								)}
							</div>
						</div>

						<Separator />

						<Accordion type="multiple" defaultValue={["work-orders"]} className="w-full space-y-2">
							<AccordionItem value="work-orders" className="rounded-lg border px-3">
								<AccordionTrigger className="py-3 hover:no-underline">
									<div className="flex w-full items-center justify-between pr-2">
										<span className="flex items-center gap-2 text-base font-semibold">
											<ListChecksIcon className="size-5" />
											OTs asociadas
										</span>
										<Badge variant="outline">{data?.total ?? 0}</Badge>
									</div>
								</AccordionTrigger>
								<AccordionContent className="pb-3">
									<div className="flex flex-col gap-3">
										{isLoading ? (
											<div className="flex h-24 items-center justify-center">
												<Spinner className="size-5" />
											</div>
										) : !data?.workOrders.length ? (
											<p className="text-muted-foreground text-sm">
												No hay órdenes asociadas todavía.
											</p>
										) : (
											<>
												<div className="space-y-2">
													{data.workOrders.map((workOrder) => (
														<div key={workOrder.id} className="bg-muted/20 rounded-lg border p-3">
															<div className="flex items-start justify-between gap-3">
																<div className="flex-1 space-y-2">
																	<div className="flex items-center gap-2">
																		<Link
																			href={`/admin/dashboard/ordenes-de-trabajo/${workOrder.id}`}
																			target="_blank"
																			className="text-sm font-semibold hover:underline"
																		>
																			{workOrder.otNumber}
																		</Link>
																		<ArrowUpRightIcon className="text-muted-foreground size-4" />
																	</div>

																	<div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
																		<span className="inline-flex items-center gap-1">
																			<Building2Icon className="size-3.5" />
																			{workOrder.company?.name ?? "Sin empresa"}
																		</span>
																		<span className="inline-flex items-center gap-1">
																			<CalendarDaysIcon className="size-3.5" />
																			Creada:{" "}
																			{format(new Date(workOrder.createdAt), "dd/MM/yyyy", {
																				locale: es,
																			})}
																		</span>
																		<span className="inline-flex items-center gap-1">
																			<Clock3Icon className="size-3.5" />
																			Ejecución:{" "}
																			{format(new Date(workOrder.programDate), "dd/MM/yyyy", {
																				locale: es,
																			})}
																		</span>
																	</div>
																</div>

																<div className="flex min-w-36 flex-col items-end gap-2">
																	<Badge variant="outline">
																		{WorkOrderStatusLabels[workOrder.status]}
																	</Badge>
																	<CreateWorkOrderForm
																		equipmentId={taskEquipmentIds}
																		maintenancePlanTaskId={[task.id]}
																		equipmentName={taskEquipmentDisplayNames}
																		buttonLabel="Usar base"
																		triggerClassName="h-7 w-fit justify-center border border-purple-500/40 bg-purple-500/10 px-2 text-[11px] font-medium text-purple-600 hover:bg-purple-500/20 hover:text-purple-700"
																		initialData={{
																			programDate: task.nextDate,
																			workRequest: workOrder.workRequest,
																			description:
																				workOrder.workDescription ?? task.description ?? "",
																			responsibleId: workOrder.responsible.id,
																			supervisorId: workOrder.supervisor.id,
																			companyId: workOrder.company?.id,
																			type: workOrder.type,
																			priority: workOrder.priority,
																			capex: workOrder.capex ?? undefined,
																			estimatedDays: workOrder.estimatedDays,
																			estimatedHours: workOrder.estimatedHours,
																		}}
																	/>
																</div>
															</div>
														</div>
													))}
												</div>

												<div className="flex items-center justify-between border-t pt-2">
													<p className="text-muted-foreground text-xs">
														Página {data?.page ?? 1} de {totalPages}
													</p>
													<div className="flex items-center gap-2">
														<Button
															variant="outline"
															size="sm"
															disabled={!canGoPrevious}
															onClick={() => setWorkOrdersPage((prev) => Math.max(1, prev - 1))}
														>
															<ChevronLeftIcon className="mr-1 size-4" />
															Anterior
														</Button>
														<Button
															variant="outline"
															size="sm"
															disabled={!canGoNext}
															onClick={() => setWorkOrdersPage((prev) => prev + 1)}
														>
															Siguiente
															<ChevronRightIcon className="ml-1 size-4" />
														</Button>
													</div>
												</div>
											</>
										)}
									</div>
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value="timeline" className="rounded-lg border px-3">
								<AccordionTrigger className="py-3 hover:no-underline">
									<span className="flex items-center gap-2 text-base font-semibold">
										<HistoryIcon className="size-5" />
										<span className="text-base font-semibold">Linea de Tiempo de la tarea</span>
									</span>
								</AccordionTrigger>
								<AccordionContent className="pb-3">
									{!data?.timeline?.length ? (
										<p className="text-muted-foreground text-sm">
											Aun no hay ejecuciones registradas.
										</p>
									) : (
										<ol className="space-y-2">
											{data.timeline.map((event) => (
												<li
													key={event.id}
													className="flex items-start gap-2 rounded-md border px-3 py-2"
												>
													<CircleDotIcon className="mt-0.5 size-4 text-purple-600" />
													<div className="flex-1">
														<div className="flex flex-wrap items-center justify-between gap-2">
															<Link
																href={`/admin/dashboard/ordenes-de-trabajo/${event.id}`}
																target="_blank"
																className="text-sm font-semibold hover:underline"
															>
																{event.otNumber}
															</Link>
															<Badge variant="outline">{WorkOrderStatusLabels[event.status]}</Badge>
														</div>
														<p className="text-muted-foreground mt-1 text-xs">
															Ejecución:{" "}
															{format(new Date(event.programDate), "dd/MM/yyyy", { locale: es })} -
															Creada:{" "}
															{format(new Date(event.createdAt), "dd/MM/yyyy", { locale: es })}
														</p>
													</div>
												</li>
											))}
										</ol>
									)}
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
