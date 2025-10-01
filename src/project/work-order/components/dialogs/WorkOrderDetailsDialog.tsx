"use client"

import { getImageProps } from "next/image"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import {
	UserIcon,
	LinkIcon,
	UsersIcon,
	ClockIcon,
	CheckCircle,
	SettingsIcon,
	CalendarIcon,
	FileTextIcon,
	Building2Icon,
	ClipboardIcon,
	CalendarClockIcon,
	AlertTriangleIcon,
} from "lucide-react"

import { extractFilenameFromUrl, openDocumentSecurely } from "@/lib/view-document"
import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"
import { useWorkOrderDetails } from "../../hooks/use-work-order-details"
import { MILESTONE_STATUS_LABELS } from "@/lib/consts/milestone-status"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WorkOrderCAPEXLabels } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { DialogLabel } from "@/shared/components/ui/dialog-label"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Progress } from "@/shared/components/ui/progress"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

import type {
	WORK_ORDER_TYPE,
	MILESTONE_STATUS,
	WORK_ORDER_STATUS,
	WORK_ORDER_PRIORITY,
} from "@prisma/client"

interface WorkOrderDetailsDialogProps {
	open: boolean
	workOrderId: string
	setOpen: (open: boolean) => void
}

export default function WorkOrderDetailsDialog({
	workOrderId,
	open,
	setOpen,
}: WorkOrderDetailsDialogProps) {
	const { data, isLoading, error } = useWorkOrderDetails(workOrderId)
	const [isLoadingInitReport, setIsLoadingInitReport] = useState(false)
	const [isLoadingEndReport, setIsLoadingEndReport] = useState(false)

	const handleViewInitReport = async () => {
		if (!data?.initReport?.url) return

		const filename = extractFilenameFromUrl(data.initReport.url)
		if (!filename) {
			toast.error("No se pudo determinar el nombre del archivo")
			return
		}

		setIsLoadingInitReport(true)
		await openDocumentSecurely(filename, "files")
		setIsLoadingInitReport(false)
	}

	const handleViewEndReport = async () => {
		if (!data?.endReport?.url) return

		const filename = extractFilenameFromUrl(data.endReport.url)
		if (!filename) {
			toast.error("No se pudo determinar el nombre del archivo")
			return
		}

		setIsLoadingEndReport(true)
		await openDocumentSecurely(filename, "files")
		setIsLoadingEndReport(false)
	}

	const { props } = getImageProps({
		width: 64,
		height: 64,
		alt: data?.company?.name || "",
		src: data?.company?.image || "",
	})

	if (error) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="overflow-hidden p-0">
					<div className="h-2 w-full bg-orange-600"></div>

					<DialogHeader className="px-4">
						<DialogTitle className="flex items-center gap-2">
							<ClipboardIcon className="size-5" />
							Detalles de la Orden de Trabajo
						</DialogTitle>

						<DialogDescription className="py-4">
							<Alert variant={"destructive"}>
								<AlertTriangleIcon />
								<AlertTitle>Error</AlertTitle>
								<AlertDescription>
									Ocurrio un error al cargar los detalles de la orden de trabajo.
								</AlertDescription>
							</Alert>
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="overflow-hidden p-0">
				<div className="h-2 w-full bg-orange-600"></div>

				<DialogHeader className="px-4">
					<DialogTitle className="flex items-center justify-start gap-2">
						<ClipboardIcon className="size-5" />
						Detalles de la Orden de Trabajo
					</DialogTitle>
					<DialogDescription className="text-left" asChild>
						<div>
							Información general de la
							{isLoading ? <Skeleton className="inline-flex h-3 w-24" /> : data?.otNumber}
						</div>
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="h-full max-h-[calc(90vh-8rem)] px-6 pb-6">
					<div className="flex flex-col gap-6">
						<div className="flex items-start gap-4">
							<Avatar className="size-16">
								<AvatarImage {...props} />
								<AvatarFallback className="text-lg">
									{data?.company?.name?.slice(0, 2) ?? "NA"}
								</AvatarFallback>
							</Avatar>

							<div className="flex flex-col gap-2">
								<div>
									<h3 className="text-lg font-semibold">
										{isLoading ? <Skeleton className="h-7 w-36" /> : data?.otNumber}
									</h3>
									<div className="text-muted-foreground flex items-center gap-2 text-sm">
										<Building2Icon className="size-4" />
										<span>
											{isLoading ? (
												<Skeleton className="h-5 w-24" />
											) : (
												(data?.company?.name ?? "Interno")
											)}
										</span>
									</div>
								</div>

								<div className="flex flex-wrap gap-2">
									{isLoading ? (
										<>
											<Skeleton className="h-6 w-20" />
											<Skeleton className="h-6 w-20" />
											<Skeleton className="h-6 w-20" />
										</>
									) : (
										<>
											<Badge className="bg-rose-600/10 text-rose-600">
												{WorkOrderTypeLabels[data?.type as WORK_ORDER_TYPE]}
											</Badge>
											<Badge className="bg-yellow-500/10 text-yellow-500" variant="secondary">
												{WorkOrderPriorityLabels[data?.priority as WORK_ORDER_PRIORITY]}
											</Badge>
											{data?.capex && (
												<Badge className="bg-orange-600/10 text-orange-600">
													{WorkOrderCAPEXLabels[data?.capex]}
												</Badge>
											)}
										</>
									)}
								</div>
							</div>
						</div>

						<Separator />

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Badge className="bg-yellow-500/10 text-yellow-500" variant="secondary">
									{isLoading ? (
										<Skeleton className="h-6 w-24" />
									) : (
										WorkOrderStatusLabels[data?.status as WORK_ORDER_STATUS]
									)}
								</Badge>
								<span className="text-muted-foreground text-sm">
									{data?.progress || 0}% completado
								</span>
							</div>
							<Progress
								value={data?.progress || 0}
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
								<DialogLabel
									isLoading={isLoading}
									label="Trabajo Solicitado"
									value={data?.workRequest}
								/>
								<DialogLabel
									isLoading={isLoading}
									label="Descripción del Trabajo"
									value={data?.workDescription}
								/>
							</div>
						</div>

						{(data?.initReport || data?.endReport) && (
							<div className="flex flex-col gap-4">
								<h2 className="flex items-center gap-2 text-lg font-semibold">
									<FileTextIcon className="size-5" />
									Informes
								</h2>

								<div className="grid gap-2">
									{data?.initReport && (
										<Button
											variant="ghost"
											onClick={handleViewInitReport}
											disabled={isLoadingInitReport}
											className="flex w-fit items-center gap-2 rounded-lg bg-orange-600/10 px-2 py-1 font-medium text-orange-600 hover:bg-orange-600 hover:text-white"
										>
											{isLoadingInitReport ? <Spinner /> : <LinkIcon className="h-4 w-4" />}
											Reporte Inicial
										</Button>
									)}

									{data?.endReport && (
										<Button
											variant="ghost"
											onClick={handleViewEndReport}
											disabled={isLoadingEndReport}
											className="flex w-fit items-center gap-2 rounded-lg bg-orange-600/10 px-2 py-1 font-medium text-orange-600 hover:bg-orange-600 hover:text-white"
										>
											{isLoadingEndReport ? <Spinner /> : <LinkIcon className="h-4 w-4" />}
											Reporte Final
										</Button>
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
								{isLoading ? (
									<Skeleton className="h-12 w-full" />
								) : (
									data?.equipments.map((item) => (
										<Badge
											key={item.id}
											className="rounded-lg bg-orange-600 whitespace-normal text-white"
										>
											{item.name}
										</Badge>
									))
								)}
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
									label="Supervisor"
									isLoading={isLoading}
									value={data?.supervisor.name}
									icon={<UserIcon className="size-4" />}
								/>
								<DialogLabel
									isLoading={isLoading}
									label="Responsable IS 360"
									value={data?.responsible.name}
									icon={<UserIcon className="size-4" />}
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
										isLoading={isLoading}
										label="Fecha y Hora de Solicitud"
										icon={<CalendarIcon className="size-4" />}
										value={
											<div className="flex items-center gap-4">
												<span>
													{format(data?.solicitationDate || new Date(), "PPP", { locale: es })}
												</span>
												<div className="flex items-center gap-2">
													<ClockIcon className="text-muted-foreground size-4" />
													<span>{data?.solicitationTime}</span>
												</div>
											</div>
										}
									/>
								</div>

								<DialogLabel
									isLoading={isLoading}
									label="Fecha Programada de Inicio"
									icon={<CalendarClockIcon className="size-4" />}
									value={format(data?.programDate || new Date(), "PPP", { locale: es })}
								/>

								{data?.estimatedEndDate && (
									<DialogLabel
										isLoading={isLoading}
										label="Fecha Estimada de Fin."
										icon={<CalendarClockIcon className="size-4" />}
										value={format(data?.estimatedEndDate || new Date(), "PPP", { locale: es })}
									/>
								)}
							</div>

							<div className="grid grid-cols-2 gap-4">
								{data?.estimatedHours && (
									<DialogLabel
										isLoading={isLoading}
										label="Horas Estimadas"
										icon={<ClockIcon className="size-4" />}
										value={`${data?.estimatedHours} horas`}
									/>
								)}

								{data?.estimatedDays && (
									<DialogLabel
										isLoading={isLoading}
										label="Días Estimados"
										value={`${data?.estimatedDays} días`}
										icon={<CalendarIcon className="size-4" />}
									/>
								)}

								<DialogLabel
									isLoading={isLoading}
									label="Actividades Realizadas"
									value={data?._count.workBookEntries}
									icon={<ClipboardIcon className="size-4" />}
								/>
							</div>
						</div>

						{data?.milestones && data?.milestones?.length > 0 && (
							<>
								<Separator />
								<div className="space-y-4">
									<h3 className="flex items-center gap-2 text-lg font-semibold">
										<CheckCircle className="h-5 w-5" />
										Hitos ({data?.milestones.length})
									</h3>

									<div className="space-y-3">
										{isLoading ? (
											<>
												<Skeleton className="h-24 w-full" />
												<Skeleton className="h-24 w-full" />
											</>
										) : (
											data?.milestones.map((milestone) => (
												<div
													key={milestone.id}
													className="flex items-center justify-between rounded-lg border p-3"
												>
													<div className="flex items-center gap-3">
														<div>
															<p className="font-medium">{milestone.name}</p>
															<p className="text-sm text-gray-600">Peso: {milestone.weight}%</p>
														</div>
													</div>
													<Badge className="bg-secondary-background">
														{MILESTONE_STATUS_LABELS[milestone.status as MILESTONE_STATUS]}
													</Badge>
												</div>
											))
										)}
									</div>
								</div>
							</>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
