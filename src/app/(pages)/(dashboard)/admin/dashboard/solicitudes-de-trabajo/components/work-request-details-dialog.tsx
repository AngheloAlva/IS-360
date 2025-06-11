"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import { WORK_REQUEST_STATUS } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { WorkRequest } from "@/hooks/work-request/use-work-request"

interface WorkRequestDetailsDialogProps {
	workRequest: WorkRequest
	open: boolean
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

	const locationText = (location: string) => {
		switch (location) {
			case "PRS":
				return "PRS"
			case "TRM":
				return "TRM"
			case "OTHER":
				return workRequest.customLocation || "Otro"
			default:
				return location
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-2xl font-bold">
						Solicitud #{workRequest.requestNumber}
						{workRequest.isUrgent && (
							<Badge variant="destructive" className="ml-2">
								Urgente
							</Badge>
						)}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Estado</p>
							<Badge variant={statusBadgeVariant(workRequest.status)}>
								{statusText(workRequest.status)}
							</Badge>
						</div>
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Fecha de solicitud</p>
							<p>{format(new Date(workRequest.requestDate), "dd/MM/yyyy HH:mm", { locale: es })}</p>
						</div>
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Solicitante</p>
							<p>{workRequest.user?.name || "Usuario desconocido"}</p>
						</div>
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Empresa</p>
							<p>{workRequest.user?.company?.name || "N/A"}</p>
						</div>
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Ubicación</p>
							<p>{locationText(workRequest.location)}</p>
						</div>
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Fecha de creación</p>
							<p>{format(new Date(workRequest.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}</p>
						</div>
					</div>

					<div className="space-y-2">
						<p className="font-medium">Descripción</p>
						<p className="rounded-md">{workRequest.description}</p>
					</div>

					{workRequest.observations && (
						<div className="space-y-2">
							<p className="font-medium">Observaciones</p>
							<p className="rounded-md">{workRequest.observations}</p>
						</div>
					)}

					<Tabs defaultValue="attachments">
						<TabsList>
							<TabsTrigger value="attachments">
								Archivos adjuntos ({workRequest.attachments.length})
							</TabsTrigger>
							<TabsTrigger value="comments">
								Comentarios ({workRequest.comments.length})
							</TabsTrigger>
						</TabsList>
						<TabsContent value="attachments" className="py-4">
							{workRequest.attachments.length === 0 ? (
								<p className="text-muted-foreground py-8 text-center">No hay archivos adjuntos</p>
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
												<AvatarFallback>{comment.user?.name || "Usuario"}</AvatarFallback>
											</Avatar>
											<div className="flex-1 space-y-1">
												<div className="flex items-center justify-between">
													<p className="text-sm font-medium">{comment.user?.name || "Usuario"}</p>
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
			</DialogContent>
		</Dialog>
	)
}
