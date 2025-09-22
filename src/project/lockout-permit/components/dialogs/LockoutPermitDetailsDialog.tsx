"use client"

import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import {
	UserIcon,
	LockIcon,
	ClockIcon,
	Loader2Icon,
	XCircleIcon,
	CalendarIcon,
	FileTextIcon,
	SettingsIcon,
	Building2Icon,
	CheckCircleIcon,
} from "lucide-react"

import { useLockoutPermitDetails } from "../../hooks/use-lockout-permit-details"
import { LOCKOUT_PERMIT_STATUS, LOCKOUT_TYPE } from "@prisma/client"
import { cn } from "@/lib/utils"

import LockoutPermitAttachmentButton from "@/project/lockout-permit/components/data/LockoutPermitAttachmentButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Badge } from "@/shared/components/ui/badge"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
} from "@/shared/components/ui/dialog"

interface LockoutPermitDetailsDialogProps {
	lockoutPermitId: string
	children: React.ReactNode
}

const LockoutPermitStatusLabels = {
	[LOCKOUT_PERMIT_STATUS.REVIEW_PENDING]: "Pendiente de Revisión",
	[LOCKOUT_PERMIT_STATUS.ACTIVE]: "Activo",
	[LOCKOUT_PERMIT_STATUS.COMPLETED]: "Completado",
	[LOCKOUT_PERMIT_STATUS.REJECTED]: "Rechazado",
}

const LockoutPermitTypeLabels = {
	[LOCKOUT_TYPE.CORRECTIVE]: "Correctivo",
	[LOCKOUT_TYPE.PREVENTIVE]: "Preventivo",
	[LOCKOUT_TYPE.EMERGENCY]: "Emergencia",
	[LOCKOUT_TYPE.OTHER]: "Otro",
}

export default function LockoutPermitDetailsDialog({
	lockoutPermitId,
	children,
}: LockoutPermitDetailsDialogProps) {
	const [open, setOpen] = useState(false)
	const { data: lockoutPermit, isLoading, error } = useLockoutPermitDetails(lockoutPermitId)

	if (error) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent>
					<div className="flex items-center justify-center p-8">
						<p className="text-red-500">Error al cargar los detalles del permiso</p>
					</div>
				</DialogContent>
			</Dialog>
		)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="max-h-[90vh] max-w-3xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<LockIcon className="h-7 w-7 rounded bg-yellow-100 p-1.5 text-yellow-600" />
						Detalles del Permiso de Bloqueo
					</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center p-8">
						<Loader2Icon className="h-8 w-8 animate-spin text-orange-600" />
						<span className="ml-2">Cargando detalles...</span>
					</div>
				) : (
					lockoutPermit && (
						<ScrollArea className="max-h-[calc(90vh-120px)]">
							<div className="space-y-3">
								<Card>
									<CardHeader>
										<CardTitle>Información General</CardTitle>
									</CardHeader>

									<CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<div className="flex flex-col space-y-2">
											<label className="text-muted-foreground text-sm font-medium">Estado</label>
											<Badge
												className={cn("bg-purple-500/10 text-purple-500", {
													"bg-red-500/10 text-red-500":
														lockoutPermit.status === LOCKOUT_PERMIT_STATUS.REJECTED,
													"bg-fuchsia-500/10 text-fuchsia-500":
														lockoutPermit.status === LOCKOUT_PERMIT_STATUS.ACTIVE,
													"bg-green-500/10 text-green-500":
														lockoutPermit.status === LOCKOUT_PERMIT_STATUS.COMPLETED,
												})}
											>
												{
													LockoutPermitStatusLabels[
														lockoutPermit.status as keyof typeof LockoutPermitStatusLabels
													]
												}
											</Badge>
										</div>

										{lockoutPermit.otNumberRef && (
											<div className="space-y-2">
												<label className="text-muted-foreground text-sm font-medium">
													Orden de Trabajo
												</label>
												<div className="flex items-center gap-2">
													<FileTextIcon className="text-muted-foreground h-4 w-4 min-w-4" />
													{lockoutPermit.otNumberRef.otNumber}
												</div>
											</div>
										)}

										<div className="space-y-2">
											<label className="text-muted-foreground text-sm font-medium">
												Tipo de Bloqueo
											</label>
											<div className="flex items-center gap-2">
												<Badge variant="outline">
													{
														LockoutPermitTypeLabels[
															lockoutPermit.lockoutType as keyof typeof LockoutPermitTypeLabels
														]
													}
												</Badge>
												{lockoutPermit.lockoutTypeOther && (
													<span className="text-muted-foreground text-sm">
														({lockoutPermit.lockoutTypeOther})
													</span>
												)}
											</div>
										</div>

										<div className="space-y-2">
											<label className="text-muted-foreground text-sm font-medium">Empresa</label>
											<div className="flex items-center gap-2">
												<Building2Icon className="text-muted-foreground h-4 w-4 min-w-4" />
												<span>{lockoutPermit.company.name}</span>
											</div>
										</div>

										<div className="space-y-2">
											<label className="text-muted-foreground text-sm font-medium">
												Solicitado por
											</label>
											<div className="flex items-center gap-2">
												<UserIcon className="text-muted-foreground h-4 w-4 min-w-4" />
												<span>{lockoutPermit.requestedBy.name}</span>
											</div>
										</div>

										<div className="space-y-2">
											<label className="text-muted-foreground text-sm font-medium">
												Responsable de Área
											</label>
											<div className="flex items-center gap-2">
												<UserIcon className="text-muted-foreground h-4 w-4 min-w-4" />
												<span>{lockoutPermit.areaResponsible.name}</span>
											</div>
										</div>

										<div className="space-y-2">
											<label className="text-muted-foreground text-sm font-medium">
												Fecha de Inicio
											</label>
											<div className="flex items-center gap-2">
												<CalendarIcon className="text-muted-foreground h-4 w-4 min-w-4" />
												<span>
													{format(new Date(lockoutPermit.startDate), "dd/MM/yyyy", {
														locale: es,
													})}
												</span>
											</div>
										</div>

										<div className="space-y-2">
											<label className="text-muted-foreground text-sm font-medium">
												Fecha de Fin
											</label>
											<div className="flex items-center gap-2">
												<CalendarIcon className="text-muted-foreground h-4 w-4 min-w-4" />
												<span>
													{format(new Date(lockoutPermit.endDate), "dd/MM/yyyy", { locale: es })}
												</span>
											</div>
										</div>

										{lockoutPermit.supervisor && (
											<div className="space-y-2">
												<label className="text-muted-foreground text-sm font-medium">
													Supervisor
												</label>
												<div className="flex items-center gap-2">
													<UserIcon className="text-muted-foreground h-4 w-4 min-w-4" />
													<span>{lockoutPermit.supervisor.name}</span>
												</div>
											</div>
										)}

										{lockoutPermit.operator && (
											<div className="space-y-2">
												<label className="text-muted-foreground text-sm font-medium">
													Operador
												</label>
												<div className="flex items-center gap-2">
													<UserIcon className="text-muted-foreground h-4 w-4 min-w-4" />
													<span>{lockoutPermit.operator.name}</span>
												</div>
											</div>
										)}
									</CardContent>
								</Card>

								{lockoutPermit.equipments.length > 0 && (
									<Card className="gap-2">
										<CardHeader>
											<CardTitle>Equipos ({lockoutPermit.equipments.length})</CardTitle>
										</CardHeader>

										<CardContent>
											<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
												{lockoutPermit.equipments.map((equipment) => (
													<div key={equipment.id} className="flex items-center gap-2 rounded p-2">
														<SettingsIcon className="text-muted-foreground h-4 w-4 min-w-4" />
														<div>
															<p className="font-medium">{equipment.name}</p>
															{equipment.tag && (
																<p className="text-muted-foreground text-sm">
																	Tag: {equipment.tag}
																</p>
															)}
														</div>
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								)}

								{lockoutPermit.activitiesToExecute.length > 0 && (
									<Card className="gap-2">
										<CardHeader>
											<CardTitle>Actividades a Ejecutar</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-2">
												{lockoutPermit.activitiesToExecute.map((activity, index) => (
													<div key={index} className="flex items-center gap-2">
														<Badge variant="outline" className="justify-center text-xs">
															{index + 1}
														</Badge>
														<span className="text-sm">{activity}</span>
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								)}

								{lockoutPermit.lockoutRegistrations.length > 0 && (
									<Card className="gap-4">
										<CardHeader>
											<CardTitle>
												Registros de Bloqueo ({lockoutPermit.lockoutRegistrations.length})
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-4">
												{lockoutPermit.lockoutRegistrations.map((registration, index) => (
													<div key={registration.id} className="rounded-lg border p-4">
														<div className="mb-3 flex items-center justify-between">
															<Badge variant="secondary">Registro #{index + 1}</Badge>
															<div className="text-muted-foreground text-sm">
																Candado:{" "}
																<span className="font-medium">{registration.lockNumber}</span>
															</div>
														</div>

														<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
															<div>
																<label className="text-muted-foreground text-sm font-medium">
																	Nombre
																</label>
																<p className="text-sm">{registration.name}</p>
															</div>
															<div>
																<label className="text-muted-foreground text-sm font-medium">
																	RUT
																</label>
																<p className="text-sm">{registration.rut}</p>
															</div>
														</div>

														<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
															<div className="space-y-2">
																<h5 className="font-medium text-green-700">Instalación</h5>
																<div className="grid grid-cols-2 gap-2 text-sm">
																	<div>
																		<span className="text-muted-foreground">Fecha:</span>
																		<p>
																			{registration.installDate
																				? format(new Date(registration.installDate), "dd/MM/yyyy")
																				: "-"}
																		</p>
																	</div>
																	<div>
																		<span className="text-muted-foreground">Hora:</span>
																		<p>{registration.installTime || "-"}</p>
																	</div>
																</div>
															</div>

															<div className="space-y-2">
																<h5 className="font-medium text-red-700">Retiro</h5>
																<div className="grid grid-cols-2 gap-2 text-sm">
																	<div>
																		<span className="text-muted-foreground">Fecha:</span>
																		<p>
																			{registration.removeDate
																				? format(new Date(registration.removeDate), "dd/MM/yyyy")
																				: "-"}
																		</p>
																	</div>
																	<div>
																		<span className="text-muted-foreground">Hora:</span>
																		<p>{registration.removeTime || "-"}</p>
																	</div>
																</div>
															</div>
														</div>
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								)}

								{lockoutPermit.zeroEnergyReviews.length > 0 && (
									<Card className="gap-4">
										<CardHeader>
											<CardTitle>
												Revisiones de Energía Cero ({lockoutPermit.zeroEnergyReviews.length})
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-4">
												{lockoutPermit.zeroEnergyReviews.map((review, index) => (
													<div key={review.id} className="rounded-lg border p-4">
														<div className="mb-3 flex items-center justify-between">
															<Badge variant="secondary">Revisión #{index + 1}</Badge>
															{review.reviewedZero !== null && (
																<div className="flex items-center gap-1">
																	{review.reviewedZero ? (
																		<CheckCircleIcon className="h-4 w-4 min-w-4 text-green-500" />
																	) : (
																		<XCircleIcon className="h-4 w-4 min-w-4 text-red-500" />
																	)}
																	<span className="text-sm">
																		{review.reviewedZero ? "Revisado" : "No revisado"}
																	</span>
																</div>
															)}
														</div>

														<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
															<div>
																<label className="text-muted-foreground text-sm font-medium">
																	Equipo
																</label>
																<p className="text-sm">{review.equipment.name}</p>
																{review.equipment.tag && (
																	<p className="text-muted-foreground text-xs">
																		Tag: {review.equipment.tag}
																	</p>
																)}
															</div>
															<div>
																<label className="text-muted-foreground text-sm font-medium">
																	Ubicación
																</label>
																<p className="text-sm">{review.equipment.location || "-"}</p>
															</div>
															<div>
																<label className="text-muted-foreground text-sm font-medium">
																	Acción Realizada
																</label>
																<p className="text-sm">{review.action}</p>
															</div>
															<div>
																<label className="text-muted-foreground text-sm font-medium">
																	Realizado por
																</label>
																<p className="text-sm">{review.performedBy.name}</p>
															</div>
															{review.reviewer && (
																<div>
																	<label className="text-muted-foreground text-sm font-medium">
																		Revisor
																	</label>
																	<p className="text-sm">{review.reviewer.name}</p>
																</div>
															)}
														</div>
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								)}

								{(lockoutPermit.observations ||
									lockoutPermit.finalObservations ||
									lockoutPermit.approvalNotes) && (
									<Card className="gap-2">
										<CardHeader>
											<CardTitle>Observaciones</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											{lockoutPermit.observations && (
												<div>
													<label className="text-muted-foreground text-sm font-medium">
														Observaciones Generales
													</label>
													<p className="mt-1 rounded bg-gray-50 p-3 text-sm">
														{lockoutPermit.observations}
													</p>
												</div>
											)}
											{lockoutPermit.finalObservations && (
												<div>
													<label className="text-muted-foreground text-sm font-medium">
														Observaciones Finales
													</label>
													<p className="mt-1 rounded bg-gray-50 p-3 text-sm">
														{lockoutPermit.finalObservations}
													</p>
												</div>
											)}
											{lockoutPermit.approvalNotes && (
												<div>
													<label className="text-muted-foreground text-sm font-medium">
														Notas de Aprobación
													</label>
													<p className="mt-1 rounded bg-blue-50 p-3 text-sm">
														{lockoutPermit.approvalNotes}
													</p>
												</div>
											)}
										</CardContent>
									</Card>
								)}

								{lockoutPermit.attachments.length > 0 && (
									<Card className="gap-2">
										<CardHeader>
											<CardTitle>Archivos Adjuntos ({lockoutPermit.attachments.length})</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-2">
												{lockoutPermit.attachments.map((attachment) => (
													<div
														key={attachment.id}
														className="flex items-center justify-between rounded border p-2"
													>
														<div className="flex items-center gap-2">
															<FileTextIcon className="text-muted-foreground h-4 w-4 min-w-4" />
															<span className="text-sm">{attachment.name}</span>
														</div>
														<div className="flex items-center gap-2">
															<span className="text-muted-foreground text-xs">
																{format(new Date(attachment.createdAt), "dd/MM/yyyy")}
															</span>
															<LockoutPermitAttachmentButton url={attachment.url} />
														</div>
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								)}

								{lockoutPermit.approved !== null && (
									<Card className="gap-4">
										<CardHeader>
											<CardTitle>Estado de Aprobación</CardTitle>
										</CardHeader>

										<CardContent>
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												{lockoutPermit.approvalDate && (
													<div>
														<label className="text-muted-foreground text-sm font-medium">
															Fecha de Aprobación
														</label>

														<div className="flex items-center gap-2">
															<CalendarIcon className="text-muted-foreground h-4 w-4 min-w-4" />
															<span className="text-sm">
																{format(new Date(lockoutPermit.approvalDate), "dd/MM/yyyy", {
																	locale: es,
																})}
															</span>
														</div>
													</div>
												)}

												{lockoutPermit.approvalTime && (
													<div>
														<label className="text-muted-foreground text-sm font-medium">
															Hora de Aprobación
														</label>
														<div className="flex items-center gap-2">
															<ClockIcon className="text-muted-foreground h-4 w-4 min-w-4" />
															<span className="text-sm">{lockoutPermit.approvalTime}</span>
														</div>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						</ScrollArea>
					)
				)}
			</DialogContent>
		</Dialog>
	)
}
