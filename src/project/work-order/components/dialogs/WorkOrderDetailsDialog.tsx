"use client"

import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"
import {
	UserIcon,
	LinkIcon,
	UsersIcon,
	ClockIcon,
	CalendarIcon,
	FileTextIcon,
	Building2Icon,
	ClipboardIcon,
	SettingsIcon,
	CalendarClockIcon,
} from "lucide-react"

import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WorkOrderCAPEXLabels } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { DialogLabel } from "@/shared/components/ui/dialog-label"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import { Progress } from "@/shared/components/ui/progress"
import { Badge } from "@/shared/components/ui/badge"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogTrigger,
	DialogDescription,
} from "@/shared/components/ui/dialog"

import type { WorkOrder } from "@/project/work-order/hooks/use-work-order"

interface WorkOrderDetailsDialogProps {
	workOrder: WorkOrder
	children: React.ReactNode
}

export default function WorkOrderDetailsDialog({
	workOrder,
	children,
}: WorkOrderDetailsDialogProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="overflow-hidden p-0">
				<div className="h-2 w-full bg-orange-600"></div>

				<DialogHeader className="px-4">
					<DialogTitle className="flex items-center gap-2">
						<ClipboardIcon className="size-5" />
						Detalles de la Orden de Trabajo
					</DialogTitle>
					<DialogDescription>Información general de la {workOrder.otNumber}</DialogDescription>
				</DialogHeader>

				<ScrollArea className="h-full max-h-[calc(90vh-8rem)] px-6 pb-6">
					<div className="flex flex-col gap-6">
						<div className="flex items-start gap-4">
							<Avatar className="size-16">
								<AvatarImage src={workOrder.company?.logo ?? ""} />
								<AvatarFallback className="text-lg">
									{workOrder.company?.name?.slice(0, 2) ?? "IN"}
								</AvatarFallback>
							</Avatar>

							<div className="flex flex-col gap-2">
								<div>
									<h3 className="text-lg font-semibold">{workOrder.otNumber}</h3>
									<div className="text-muted-foreground flex items-center gap-2 text-sm">
										<Building2Icon className="size-4" />
										<span>{workOrder.company?.name ?? "Interno"}</span>
									</div>
								</div>

								<div className="flex flex-wrap gap-2">
									<Badge className="bg-rose-600/10 text-rose-600">
										{WorkOrderTypeLabels[workOrder.type]}
									</Badge>
									<Badge className="bg-yellow-500/10 text-yellow-500" variant="secondary">
										{WorkOrderPriorityLabels[workOrder.priority]}
									</Badge>
									{workOrder.capex && (
										<Badge className="bg-orange-600/10 text-orange-600">
											{WorkOrderCAPEXLabels[workOrder.capex]}
										</Badge>
									)}
								</div>
							</div>
						</div>

						<Separator />

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Badge className="bg-yellow-500/10 text-yellow-500" variant="secondary">
									{WorkOrderStatusLabels[workOrder.status]}
								</Badge>
								<span className="text-muted-foreground text-sm">
									{workOrder.workProgressStatus || 0}% completado
								</span>
							</div>
							<Progress
								value={workOrder.workProgressStatus || 0}
								className="h-2 bg-orange-600/10"
								indicatorClassName="bg-orange-600"
							/>
						</div>

						<Separator />

						<div className="flex flex-col gap-4">
							<h2 className="flex items-center gap-2 text-lg font-semibold">
								<FileTextIcon className="size-5" />
								Detalles del Trabajo
							</h2>

							<div className="grid gap-4">
								<DialogLabel label="Trabajo Solicitado" value={workOrder.workRequest} />
								<DialogLabel label="Descripción del Trabajo" value={workOrder.workDescription} />
							</div>
						</div>

						{(workOrder.initReport || workOrder.endReport) && (
							<div className="flex flex-col gap-4">
								<h2 className="flex items-center gap-2 text-lg font-semibold">
									<FileTextIcon className="size-5" />
									Informes
								</h2>

								<div className="grid gap-2">
									{workOrder.initReport && (
										<Link
											target="_blank"
											rel="noopener noreferrer"
											href={workOrder.initReport.url}
											className="flex w-fit items-center gap-2 rounded-lg bg-orange-600/10 px-2 py-1 font-medium text-orange-600 hover:bg-orange-600 hover:text-white"
										>
											<LinkIcon className="h-4 w-4" />
											Reporte Inicial
										</Link>
									)}

									{workOrder.endReport && (
										<Link
											target="_blank"
											rel="noopener noreferrer"
											href={workOrder.endReport.url}
											className="flex w-fit items-center gap-2 rounded-lg bg-orange-600/10 px-2 py-1 font-medium text-orange-600 hover:bg-orange-600 hover:text-white"
										>
											<LinkIcon className="h-4 w-4" />
											Reporte Final
										</Link>
									)}
								</div>
							</div>
						)}

						<Separator />

						<div className="flex flex-col gap-4">
							<h2 className="flex items-center gap-2 text-lg font-semibold">
								<SettingsIcon className="size-5" />
								Equipos / Ubicaciones
							</h2>

							<div className="flex flex-wrap gap-2">
								{workOrder.equipment.map((item) => (
									<Badge
										key={item.id}
										className="rounded-lg bg-orange-600 whitespace-normal text-white"
									>
										{item.name}
									</Badge>
								))}
							</div>
						</div>

						<Separator />

						<div className="flex flex-col gap-4">
							<h2 className="flex items-center gap-2 text-lg font-semibold">
								<UsersIcon className="size-5" />
								Personal Asignado
							</h2>

							<div className="grid grid-cols-2 gap-4">
								<DialogLabel
									icon={<UserIcon className="size-4" />}
									label="Supervisor"
									value={workOrder.supervisor.name}
								/>
								<DialogLabel
									icon={<UserIcon className="size-4" />}
									label="Responsable OTC"
									value={workOrder.responsible.name}
								/>
							</div>
						</div>

						<Separator />

						<div className="flex flex-col gap-x-4 gap-y-5">
							<h2 className="flex items-center gap-2 text-lg font-semibold">
								<CalendarIcon className="size-5" />
								Fechas y Tiempos
							</h2>

							<div className="grid grid-cols-2 gap-4">
								<div className="col-span-2">
									<DialogLabel
										icon={<CalendarIcon className="size-4" />}
										label="Fecha y Hora de Solicitud"
										value={
											<div className="flex items-center gap-4">
												<span>{format(workOrder.solicitationDate, "PPP", { locale: es })}</span>
												<div className="flex items-center gap-2">
													<ClockIcon className="text-muted-foreground size-4" />
													<span>{workOrder.solicitationTime}</span>
												</div>
											</div>
										}
									/>
								</div>

								<DialogLabel
									icon={<CalendarClockIcon className="size-4" />}
									label="Fecha Programada de Inicio"
									value={format(workOrder.programDate, "PPP", { locale: es })}
								/>

								{workOrder.estimatedEndDate && (
									<DialogLabel
										icon={<CalendarClockIcon className="size-4" />}
										label="Fecha Estimada de Fin."
										value={format(workOrder.estimatedEndDate, "PPP", { locale: es })}
									/>
								)}
							</div>

							<div className="grid grid-cols-2 gap-4">
								{workOrder.estimatedHours && (
									<DialogLabel
										icon={<ClockIcon className="size-4" />}
										label="Horas Estimadas"
										value={`${workOrder.estimatedHours} horas`}
									/>
								)}

								{workOrder.estimatedDays && (
									<DialogLabel
										icon={<CalendarIcon className="size-4" />}
										label="Días Estimados"
										value={`${workOrder.estimatedDays} días`}
									/>
								)}

								<DialogLabel
									icon={<ClipboardIcon className="size-4" />}
									label="Actividades Realizadas"
									value={workOrder._count.workEntries}
								/>
							</div>
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
