"use client"

import { es } from "date-fns/locale"
import { format } from "date-fns"
import Image from "next/image"
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
} from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { DialogLabel } from "@/shared/components/ui/dialog-label"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import { Badge } from "@/shared/components/ui/badge"

import type { WorkRequest } from "@/project/work-request/hooks/use-work-request"
import type { WORK_REQUEST_STATUS } from "@prisma/client"

interface WorkRequestDetailsDialogProps {
	open: boolean
	workRequest: WorkRequest
	onOpenChange: (open: boolean) => void
}

export default function WorkRequestDetailsDialog({
	workRequest,
	open,
	onOpenChange,
}: WorkRequestDetailsDialogProps) {
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
				return "outline" // Cambiado de warning a outline
			case "ATTENDED":
				return "default" // Cambiado de success a default
			case "CANCELLED":
				return "destructive"
			default:
				return "secondary"
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="overflow-hidden p-0">
				<div className="h-2 w-full bg-cyan-500"></div>

				<DialogHeader className="px-4">
					<DialogTitle className="flex items-center gap-2 text-2xl font-bold">
						Solicitud #{workRequest.requestNumber}
						{workRequest.isUrgent && (
							<Badge variant="destructive" className="ml-2">
								Urgente
							</Badge>
						)}
					</DialogTitle>
				</DialogHeader>

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
									value={workRequest.user?.name || "Usuario desconocido"}
								/>
								<DialogLabel
									icon={<BuildingIcon className="size-4" />}
									label="Empresa"
									value={workRequest.user?.company?.name || "N/A"}
								/>
								<DialogLabel
									icon={<SettingsIcon className="size-4" />}
									label="Equipo / Ubicación"
									value={
										workRequest.equipments[0].name + " - " + workRequest.equipments[0].location
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
										Archivos adjuntos ({workRequest.attachments.length})
									</TabsTrigger>
									<TabsTrigger value="comments" className="flex items-center gap-2">
										<MessageSquareIcon className="size-4" />
										Comentarios ({workRequest.comments.length})
									</TabsTrigger>
								</TabsList>

								<TabsContent value="attachments" className="py-4">
									{workRequest.attachments.length === 0 ? (
										<p className="text-muted-foreground py-8 text-center">
											No hay archivos adjuntos
										</p>
									) : (
										<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
											{workRequest.attachments.map((attachment) => (
												<div key={attachment.id} className="overflow-hidden rounded-md border">
													<div className="relative h-32 w-full">
														<Image
															src={attachment.url}
															alt={attachment.name}
															fill
															className="object-cover"
														/>
													</div>
													<div className="truncate p-2 text-sm">{attachment.name}</div>
												</div>
											))}
										</div>
									)}
								</TabsContent>

								<TabsContent value="comments" className="py-4">
									{workRequest.comments.length === 0 ? (
										<p className="text-muted-foreground py-8 text-center">No hay comentarios</p>
									) : (
										<div className="space-y-4">
											{workRequest.comments.map((comment) => (
												<div key={comment.id} className="flex gap-3">
													<Avatar className="h-8 w-8">
														<AvatarImage src={comment.user?.image || undefined} />
														<AvatarFallback>
															{comment.user?.name?.slice(0, 2) || "U"}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1 space-y-1">
														<div className="flex items-center justify-between">
															<p className="text-sm font-medium">
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
											))}
										</div>
									)}
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
