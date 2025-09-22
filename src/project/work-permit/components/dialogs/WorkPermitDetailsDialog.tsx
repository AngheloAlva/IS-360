"use client"

import { es } from "date-fns/locale"
import { format } from "date-fns"
import {
	DotIcon,
	FileIcon,
	UserIcon,
	UsersIcon,
	WrenchIcon,
	ShieldIcon,
	MapPinIcon,
	BuildingIcon,
	CalendarIcon,
	ShieldUserIcon,
	CloudUploadIcon,
	CheckCircle2Icon,
	ClipboardListIcon,
} from "lucide-react"

import { WorkPermitStatus, WorkPermitStatusLabels } from "@/lib/consts/work-permit-status"
import { cn } from "@/lib/utils"

import WorkPermitAttachmentLink from "@/project/work-permit/components/data/WorkPermitAttachmentLink"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

import type { WorkPermit } from "@/project/work-permit/hooks/use-work-permit"

interface WorkPermitDetailsDialogProps {
	className?: string
	workPermit: WorkPermit
	children: React.ReactNode
}

export default function WorkPermitDetailsDialog({
	children,
	className,
	workPermit,
}: WorkPermitDetailsDialogProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="overflow-hidden p-0">
				<div className={cn("h-2 w-full bg-rose-500", className)}></div>

				<DialogHeader className="px-4">
					<DialogTitle className="flex items-center gap-2">
						<ClipboardListIcon className="h-5 w-5" />
						Detalles del Permiso de Trabajo
					</DialogTitle>
					<DialogDescription>
						Información general del permiso de trabajo de la {workPermit.otNumber?.otNumber}
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[80vh] px-6 pb-6">
					<div className="grid gap-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
									<UserIcon className="h-4 w-4" />
									Solicitante PT
								</p>
								<p className="font-medium">{workPermit.user.name}</p>
							</div>
							<div>
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
									<BuildingIcon className="h-4 w-4" />
									Empresa ejecutora
								</p>
								<p className="font-medium">{workPermit.company.name}</p>
							</div>
							<div>
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
									<ShieldIcon className="h-4 w-4" />
									Mutualidad
								</p>
								<p className="font-medium">{workPermit.otherMutuality || workPermit.mutuality}</p>
							</div>
						</div>

						<div>
							<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
								<UsersIcon className="h-4 w-4" />
								Participantes ({workPermit._count.participants})
							</p>

							<div className="mt-2 flex flex-wrap gap-2">
								{workPermit.participants.map((participant) => (
									<span className="rounded-lg bg-neutral-500/20 px-2 py-1" key={participant.id}>
										{participant.name}
									</span>
								))}
							</div>
						</div>
					</div>

					<Separator className="my-4" />

					<div className="flex flex-col gap-4">
						<div className="grid gap-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
										<FileIcon className="h-4 w-4" />
										OT
									</p>
									<p className="font-medium">{workPermit.otNumber?.otNumber}</p>
								</div>
								<div>
									<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
										<ShieldIcon className="h-4 w-4" />
										Estado
									</p>
									<p className="font-medium">
										{WorkPermitStatusLabels[workPermit.status as WorkPermitStatus]}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
										<CalendarIcon className="h-4 w-4" />
										Fecha de inicio
									</p>
									<p className="font-medium">
										{format(workPermit.startDate, "dd/MM/yyyy", { locale: es })}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
										<CalendarIcon className="h-4 w-4" />
										Fecha de término
									</p>
									<p className="font-medium">
										{format(workPermit.endDate, "dd/MM/yyyy", { locale: es })}
									</p>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
									<ClipboardListIcon className="h-4 w-4" />
									Trabajo a realizar
								</p>
								<p className="font-medium">
									{workPermit.otNumber?.workBookName || workPermit.otNumber?.workRequest}
								</p>
							</div>

							<div>
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
									<MapPinIcon className="h-4 w-4" />
									Lugar exacto
								</p>
								<p className="font-medium">{workPermit.exactPlace}</p>
							</div>

							<div>
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
									<WrenchIcon className="h-4 w-4" />
									Tipo de trabajo
								</p>
								<p className="font-medium">{workPermit.workWillBeOther || workPermit.workWillBe}</p>
							</div>

							<div className="col-span-2">
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
									<WrenchIcon className="h-4 w-4" />
									Descripción del trabajo
								</p>
								<p className="font-medium">
									{workPermit.otNumber?.workDescription || "Sin descripción"}
								</p>
							</div>

							<div className="col-span-2">
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
									<WrenchIcon className="h-4 w-4" />
									Herramientas
								</p>

								<div className="mt-2 flex flex-wrap gap-2">
									{workPermit.tools.map((tool) => (
										<span className="rounded-lg bg-neutral-500/20 px-2 py-1" key={tool}>
											{tool}
										</span>
									))}

									{workPermit.otherTools && (
										<span className="rounded-lg bg-neutral-500/20 px-2 py-1">
											{workPermit.otherTools}
										</span>
									)}
								</div>
							</div>
						</div>

						{workPermit.activityDetails.length > 0 && (
							<>
								<Separator className="my-4" />

								<h2 className="flex items-center gap-2 text-lg font-semibold">
									<CheckCircle2Icon className="h-5 w-5" />
									Detalle de actividades
								</h2>

								<ul className="space-y-1">
									{workPermit.activityDetails.map((activityDetail, index) => (
										<li key={index} className="flex items-center gap-2">
											<DotIcon className="size-4" />
											{activityDetail}
										</li>
									))}
								</ul>
							</>
						)}

						{workPermit.approvalBy?.name && workPermit.approvalDate && (
							<>
								<Separator className="my-4" />

								<h2 className="flex items-center gap-2 text-lg font-semibold">
									<ShieldUserIcon className="h-5 w-5" />
									Aprobación y cierre
								</h2>

								<div className="grid grid-cols-2 gap-2">
									<div>
										<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
											<UserIcon className="h-4 w-4" />
											Aprobado por
										</p>
										<p className="font-medium">{workPermit.approvalBy?.name}</p>
									</div>

									<div>
										<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
											<CalendarIcon className="h-4 w-4" />
											Fecha de aprobación
										</p>
										<p className="font-medium">
											{format(workPermit.approvalDate, "dd/MM/yyyy HH:mm", { locale: es })}
										</p>
									</div>
								</div>

								<div>
									<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
										<UserIcon className="h-4 w-4" />
										Cerrado por
									</p>
									<p className="font-medium">{workPermit.closingBy?.name || "-"}</p>
								</div>

								<div>
									<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
										<CalendarIcon className="h-4 w-4" />
										Fecha de cierre
									</p>
									<p className="font-medium">
										{workPermit.closingDate
											? format(workPermit.closingDate, "dd/MM/yyyy HH:mm", { locale: es })
											: "-"}
									</p>
								</div>
							</>
						)}

						<Separator className="my-4" />

						<h2 className="flex items-center gap-2 text-lg font-semibold">
							<CloudUploadIcon className="h-5 w-5" />
							Archivos Adjuntos{" "}
							<span className="text-muted-foreground text-sm">
								({workPermit._count.attachments})
							</span>
						</h2>

						<ul className="space-y-1">
							{workPermit.attachments.map((attachment) => (
								<li key={attachment.id} className="flex flex-col">
									<WorkPermitAttachmentLink
										url={attachment.url}
										name={attachment.name}
										attachmentId={attachment.id}
									/>

									<p className="text-muted-foreground text-sm">
										Subido por {attachment.uploadedBy.name} el{" "}
										{format(new Date(attachment.uploadedAt), "dd/MM/yyyy HH:mm", { locale: es })}
									</p>
								</li>
							))}
						</ul>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
