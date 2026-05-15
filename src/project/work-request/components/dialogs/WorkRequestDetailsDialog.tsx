"use client"

import { getImageProps } from "next/image"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"
import {
	UserIcon,
	ZoomInIcon,
	SettingsIcon,
	BuildingIcon,
	CalendarIcon,
	FileTextIcon,
	PaperclipIcon,
	AlertCircleIcon,
	MessageSquareIcon,
	ListOrderedIcon,
	ClipboardListIcon,
} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import WorkRequestAttachmentLink from "@/project/work-request/components/data/WorkRequestAttachmentLink"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { useWorkRequestById } from "@/project/work-request/hooks/use-work-request"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { DialogLabel } from "@/shared/components/ui/dialog-label"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import { Badge } from "@/shared/components/ui/badge"
import Spinner from "@/shared/components/Spinner"

import type { WORK_REQUEST_STATUS, WORK_REQUEST_TYPE } from "@/generated/prisma/enums"

interface WorkRequestDetailsDialogProps {
	open: boolean
	workRequestId: string
	onOpenChange: (open: boolean) => void
}

export default function WorkRequestDetailsDialog({
	workRequestId,
	open,
	onOpenChange,
}: WorkRequestDetailsDialogProps) {
	const { data: workRequest, isLoading } = useWorkRequestById({
		id: workRequestId,
		enabled: open,
	})

	const statusText = (status: WORK_REQUEST_STATUS) => {
		switch (status) {
			case "REPORTED":
				return "Reportada"
			case "ATTENDED":
				return "Atendida"
			case "CANCELLED":
				return "Cancelada"
			default:
				return status
		}
	}

	const statusBadgeVariant = (status: WORK_REQUEST_STATUS) => {
		switch (status) {
			case "REPORTED":
				return "outline"
			case "ATTENDED":
				return "default"
			case "CANCELLED":
				return "destructive"
			default:
				return "secondary"
		}
	}

	const workTypeText = (workType: WORK_REQUEST_TYPE) => {
		switch (workType) {
			case "ELECTRIC":
				return "Eléctrico"
			case "MECHANIC":
				return "Mecánico"
			default:
				return workType
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="overflow-hidden p-0 sm:max-w-xl">
				<div className="h-2 w-full bg-cyan-500"></div>

				<DialogHeader className="px-4">
					<DialogTitle className="flex items-center gap-2 text-2xl font-bold">
						Solicitud #{workRequest?.requestNumber ?? "..."}
						{workRequest?.isUrgent && (
							<Badge variant="destructive" className="ml-2">
								Urgente
							</Badge>
						)}
					</DialogTitle>
				</DialogHeader>

				{isLoading || !workRequest ? (
					<div className="flex h-48 items-center justify-center">
						<Spinner className="size-5" />
					</div>
				) : (
					<ScrollArea className="h-full max-h-[calc(90vh-8rem)] px-6 pb-6">
						<div className="flex flex-col gap-6">
							<div className="flex flex-col gap-4">
								<h2 className="flex items-center gap-2 text-lg font-semibold">
									<FileTextIcon className="size-5" />
									Información de la Solicitud
								</h2>

								<div className="grid grid-cols-2 gap-4">
									<DialogLabel
										icon={<AlertCircleIcon className="size-4" />}
										label="Estado"
										value={
											<Badge variant={statusBadgeVariant(workRequest.status)}>
												{statusText(workRequest.status)}
											</Badge>
										}
									/>
									<DialogLabel
										icon={<CalendarIcon className="size-4" />}
										label="Fecha de solicitud"
										value={format(new Date(workRequest.requestDate), "dd/MM/yyyy HH:mm", {
											locale: es,
										})}
									/>
									<DialogLabel
										icon={<UserIcon className="size-4" />}
										label="Solicitante"
										value={
											workRequest.operator ? workRequest.operator.name : workRequest.user?.name
										}
									/>
									<DialogLabel
										icon={<BuildingIcon className="size-4" />}
										label="Empresa"
										value={workRequest.user?.company?.name || "N/A"}
									/>
									<DialogLabel
										label="Tipo de Trabajo"
										value={workTypeText(workRequest.workType as WORK_REQUEST_TYPE)}
										icon={<ListOrderedIcon className="size-4" />}
									/>
									<DialogLabel
										label="Equipo / Ubicación"
										icon={<SettingsIcon className="size-4" />}
										className="col-span-2"
										value={
											(workRequest.equipments?.[0]?.name ?? "N/A") +
											" - " +
											(workRequest.equipments?.[0]?.location?.path ?? "N/A")
										}
									/>
								</div>
							</div>

							<Separator />

							<div className="flex flex-col gap-4">
								<DialogLabel
									icon={<FileTextIcon className="size-4" />}
									label="Descripción"
									value={workRequest.description}
								/>

								{workRequest.observations && (
									<DialogLabel
										icon={<ZoomInIcon className="size-4" />}
										label="Observaciones"
										value={workRequest.observations}
									/>
								)}
							</div>

							<Separator />

							<div className="flex flex-col gap-4">
								<Tabs defaultValue="attachments" className="w-full">
									<TabsList>
										<TabsTrigger value="attachments" className="flex items-center gap-2">
											<PaperclipIcon className="size-4" />
											Archivos adjuntos ({workRequest.attachments?.length ?? 0})
										</TabsTrigger>
										<TabsTrigger value="comments" className="flex items-center gap-2">
											<MessageSquareIcon className="size-4" />
											Comentarios ({workRequest.comments?.length ?? 0})
										</TabsTrigger>
										<TabsTrigger value="workOrders" className="flex items-center gap-2">
											<ClipboardListIcon className="size-4" />
											OTs ({workRequest.workOrders?.length ?? 0})
										</TabsTrigger>
									</TabsList>

									<TabsContent value="attachments" className="py-4">
										{(workRequest.attachments?.length ?? 0) === 0 ? (
											<p className="text-muted-foreground py-8 text-center">
												No hay archivos adjuntos
											</p>
										) : (
											<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
												{(workRequest.attachments ?? []).map((attachment) => (
													<WorkRequestAttachmentLink
														key={attachment.id}
														url={attachment.url}
														name={attachment.name}
													/>
												))}
											</div>
										)}
									</TabsContent>

									<TabsContent value="comments" className="py-4">
										{(workRequest.comments?.length ?? 0) === 0 ? (
											<p className="text-muted-foreground py-8 text-center">No hay comentarios</p>
										) : (
											<div className="space-y-4">
												{(workRequest.comments ?? []).map((comment) => {
													const { props } = getImageProps({
														width: 32,
														height: 32,
														alt: comment.user.name || "",
														src: comment.user.image || "",
													})

													return (
														<div key={comment.id} className="flex gap-3">
															<Avatar className="h-8 w-8">
																<AvatarImage {...props} />
																<AvatarFallback>
																	{comment.user?.name?.slice(0, 2) || "U"}
																</AvatarFallback>
															</Avatar>
															<div className="flex-1 space-y-1">
																<div className="flex items-center justify-between">
																	<p className="text-sm font-semibold">
																		{comment.user?.name || "Usuario"}
																	</p>
																	<p className="text-muted-foreground text-xs">
																		{format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm", {
																			locale: es,
																		})}
																	</p>
																</div>
																<p className="text-sm">{comment.content}</p>
															</div>
														</div>
													)
												})}
											</div>
										)}
									</TabsContent>

									<TabsContent value="workOrders" className="py-4">
										{(workRequest.workOrders?.length ?? 0) === 0 ? (
											<p className="text-muted-foreground py-8 text-center">
												No hay órdenes de trabajo vinculadas
											</p>
										) : (
											<div className="space-y-2">
												{(workRequest.workOrders ?? []).map((wo) => (
													<Link
														key={wo.id}
														href={`/admin/dashboard/ordenes-de-trabajo/${wo.id}`}
														target="_blank"
														className="bg-muted/30 flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/60"
													>
														<div className="space-y-1">
															<p className="text-sm font-semibold">{wo.otNumber}</p>
															<div className="text-muted-foreground flex gap-3 text-xs">
																<span>
																	{WorkOrderTypeLabels[wo.type]}
																</span>
																<span>
																	{format(new Date(wo.programDate), "dd/MM/yyyy", {
																		locale: es,
																	})}
																</span>
																<span>{wo.estimatedHours}h estimadas</span>
															</div>
														</div>
														<Badge variant="outline">
															{WorkOrderStatusLabels[wo.status]}
														</Badge>
													</Link>
												))}
											</div>
										)}
									</TabsContent>
								</Tabs>
							</div>
						</div>
					</ScrollArea>
				)}
			</DialogContent>
		</Dialog>
	)
}
