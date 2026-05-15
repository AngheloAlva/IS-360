"use client"

import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import {
	DotIcon,
	ZapIcon,
	FileIcon,
	UserIcon,
	LockIcon,
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

import { useWorkPermitLockoutPermits } from "@/project/work-permit/hooks/use-work-permit-lockout-permits"
import { WorkPermitStatus, WorkPermitStatusLabels } from "@/lib/consts/work-permit-status"
import { getMedidaDeControlLabel } from "@/lib/consts/medidas-de-control"
import { getPeligroLabel } from "@/lib/consts/peligros"
import { getRiesgoLabel } from "@/lib/consts/riesgos"
import { Badge } from "@/shared/components/ui/badge"
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
	children?: React.ReactNode
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export default function WorkPermitDetailsDialog({
	children,
	className,
	workPermit,
	open,
	onOpenChange,
}: WorkPermitDetailsDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false)
	const isControlled = typeof open === "boolean"
	const isOpen = isControlled ? open : internalOpen
	const setIsOpen = onOpenChange ?? setInternalOpen
	const { data: lockoutPermitsData, isLoading: isLockoutPermitsLoading } =
		useWorkPermitLockoutPermits(workPermit.id, isOpen)
	const lockoutPermits = lockoutPermitsData?.lockoutPermits ?? []

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			{children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}

			<DialogContent className="overflow-hidden p-0 sm:max-w-2xl">
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
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
									<UserIcon className="h-4 w-4" />
									Solicitante PT
								</p>
								<p className="font-semibold">{workPermit.user.name}</p>
							</div>
							<div>
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
									<BuildingIcon className="h-4 w-4" />
									Empresa ejecutora
								</p>
								<p className="font-semibold">{workPermit.company.name}</p>
							</div>
							<div>
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
									<ShieldIcon className="h-4 w-4" />
									Mutualidad
								</p>
								<p className="font-semibold">{workPermit.otherMutuality || workPermit.mutuality}</p>
							</div>
						</div>

						<div>
							<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
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
									<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
										<FileIcon className="h-4 w-4" />
										OT
									</p>
									<p className="font-semibold">{workPermit.otNumber?.otNumber}</p>
								</div>
								<div>
									<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
										<ShieldIcon className="h-4 w-4" />
										Estado
									</p>
									<p className="font-semibold">
										{WorkPermitStatusLabels[workPermit.status as WorkPermitStatus]}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
										<CalendarIcon className="h-4 w-4" />
										Fecha de inicio
									</p>
									<p className="font-semibold">
										{format(workPermit.startDate, "dd/MM/yyyy", { locale: es })}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
										<CalendarIcon className="h-4 w-4" />
										Fecha de término
									</p>
									<p className="font-semibold">
										{format(workPermit.endDate, "dd/MM/yyyy", { locale: es })}
									</p>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
									<ClipboardListIcon className="h-4 w-4" />
									Trabajo a realizar
								</p>
								<p className="font-semibold">
									{workPermit.otNumber?.workBookName || workPermit.otNumber?.workRequest}
								</p>
							</div>

							<div>
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
									<MapPinIcon className="h-4 w-4" />
									Lugar exacto
								</p>
								<p className="font-semibold">{workPermit.exactPlace}</p>
							</div>

							<div>
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
									<WrenchIcon className="h-4 w-4" />
									Tipo de trabajo
								</p>
								<p className="font-semibold">
									{workPermit.workWillBeOther || workPermit.workWillBe}
								</p>
							</div>

							<div className="col-span-2">
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
									<WrenchIcon className="h-4 w-4" />
									Descripción del trabajo
								</p>
								<p className="font-semibold">
									{workPermit.otNumber?.workDescription || "Sin descripción"}
								</p>
							</div>

							<div className="col-span-2">
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
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

						{(workPermit.activities?.length ?? 0) > 0 ? (
							<>
								<Separator className="my-4" />

								<h2 className="flex items-center gap-2 text-lg font-semibold">
									<CheckCircle2Icon className="h-5 w-5" />
									Detalle de actividades
								</h2>

								<div className="space-y-3">
									{workPermit.activities
										?.sort((a, b) => a.order - b.order)
										.map((activity, index) => (
											<div key={activity.id} className="space-y-2 rounded-lg border p-3">
												<h3 className="text-sm font-semibold">
													Actividad {index + 1}: {activity.activity}
												</h3>

												<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
													<div>
														<p className="text-muted-foreground text-xs font-semibold">
															Peligros
														</p>
														<div className="mt-1 flex flex-wrap gap-1">
															{activity.peligros.map((id) => (
																<span
																	key={id}
																	className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800"
																>
																	{getPeligroLabel(id)}
																</span>
															))}
															{activity.otroPeligro && (
																<span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
																	Otra: {activity.otroPeligro}
																</span>
															)}
														</div>
													</div>

													<div>
														<p className="text-muted-foreground text-xs font-semibold">
															Riesgos
														</p>
														<div className="mt-1 flex flex-wrap gap-1">
															{activity.riesgos.map((id) => (
																<span
																	key={id}
																	className="rounded bg-rose-100 px-1.5 py-0.5 text-xs text-rose-800"
																>
																	{getRiesgoLabel(id)}
																</span>
															))}
															{activity.otroRiesgo && (
																<span className="rounded bg-rose-100 px-1.5 py-0.5 text-xs text-rose-800">
																	Otra: {activity.otroRiesgo}
																</span>
															)}
														</div>
													</div>

													<div>
														<p className="text-muted-foreground text-xs font-semibold">
															Medidas de control
														</p>
														<div className="mt-1 flex flex-wrap gap-1">
															{activity.medidasDeControl.map((id) => (
																<span
																	key={id}
																	className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800"
																>
																	{getMedidaDeControlLabel(id)}
																</span>
															))}
															{activity.otraMedidaDeControl && (
																<span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800">
																	Otra: {activity.otraMedidaDeControl}
																</span>
															)}
														</div>
													</div>
												</div>
											</div>
										))}
								</div>
							</>
						) : workPermit.activityDetails.length > 0 ? (
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
						) : null}

						<Separator className="my-4" />

						<h2 className="flex items-center gap-2 text-lg font-semibold">
							<ClipboardListIcon className="h-5 w-5" />
							Gestión de residuos
						</h2>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
									<DotIcon className="h-4 w-4" />
									¿Genera residuos?
								</p>
								<p className="font-semibold">{workPermit.generateWaste ? "Sí" : "No"}</p>
							</div>

							{workPermit.generateWaste && (
								<>
									<div>
										<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
											<DotIcon className="h-4 w-4" />
											Tipo de residuos
										</p>
										<p className="font-semibold">{workPermit.wasteType || "No especificado"}</p>
									</div>

									<div className="col-span-2">
										<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
											<MapPinIcon className="h-4 w-4" />
											Lugar de disposición
										</p>
										<p className="font-semibold">
											{workPermit.wasteDisposalLocation === "Otra"
												? `Otra: ${workPermit.otherWasteDisposalLocation || "No especificado"}`
												: workPermit.wasteDisposalLocation || "No especificado"}
										</p>
									</div>
								</>
							)}
						</div>

						{isLockoutPermitsLoading ? (
							<>
								<Separator className="my-4" />
								<p className="text-muted-foreground text-sm">Cargando permisos de bloqueo...</p>
							</>
						) : lockoutPermits.length > 0 ? (
							<>
								<Separator className="my-4" />

								<h2 className="flex items-center gap-2 text-lg font-semibold">
									<LockIcon className="h-5 w-5 text-yellow-600" />
									Permisos de Bloqueo ({lockoutPermits.length})
								</h2>

								<div className="space-y-4">
									{lockoutPermits.map((lockoutPermit, idx) => (
										<div key={lockoutPermit.id} className="space-y-3 rounded-lg border p-4">
											<div className="flex items-center justify-between">
												<h3 className="font-semibold">Permiso de Bloqueo #{idx + 1}</h3>
												<Badge
													variant={
														lockoutPermit.status === "ACTIVE"
															? "default"
															: lockoutPermit.status === "REVIEW_PENDING"
																? "secondary"
																: "outline"
													}
												>
													{lockoutPermit.status}
												</Badge>
											</div>

											<div className="grid grid-cols-2 gap-3">
												<div>
													<p className="text-muted-foreground text-xs font-semibold">
														Tipo de Bloqueo
													</p>
													<p className="text-sm font-semibold">
														{lockoutPermit.lockoutTypeOther ||
															(lockoutPermit.lockoutType === "PREVENTIVE"
																? "Preventivo"
																: lockoutPermit.lockoutType === "CORRECTIVE"
																	? "Correctivo"
																	: lockoutPermit.lockoutType === "EMERGENCY"
																		? "Emergencia"
																		: "Otro")}
													</p>
												</div>

												<div>
													<p className="text-muted-foreground text-xs font-semibold">
														Responsable del Área
													</p>
													<p className="text-sm font-semibold">
														{lockoutPermit.areaResponsible?.name || "N/A"}
													</p>
												</div>

												<div>
													<p className="text-muted-foreground text-xs font-semibold">
														Fecha de Inicio
													</p>
													<p className="text-sm font-semibold">
														{format(lockoutPermit.startDate, "dd/MM/yyyy", { locale: es })}
													</p>
												</div>

												{lockoutPermit.endDate && (
													<div>
														<p className="text-muted-foreground text-xs font-semibold">
															Fecha de Fin
														</p>
														<p className="text-sm font-semibold">
															{format(lockoutPermit.endDate, "dd/MM/yyyy", { locale: es })}
														</p>
													</div>
												)}
											</div>

											{lockoutPermit.equipments && lockoutPermit.equipments.length > 0 && (
												<div>
													<p className="text-muted-foreground mb-2 text-xs font-semibold">
														Equipos a Bloquear
													</p>
													<div className="flex flex-wrap gap-2">
														{lockoutPermit.equipments.map((equipment) => (
															<Badge key={equipment.id} variant="outline" className="bg-white">
																{equipment.name} ({equipment.tag})
															</Badge>
														))}
													</div>
												</div>
											)}

											{lockoutPermit.activitiesToExecute &&
												lockoutPermit.activitiesToExecute.length > 0 && (
													<div>
														<p className="text-muted-foreground mb-2 text-xs font-semibold">
															Actividades a Ejecutar
														</p>
														<ul className="space-y-1">
															{lockoutPermit.activitiesToExecute.map((activity, actIdx) => (
																<li key={actIdx} className="flex items-start gap-2 text-sm">
																	<DotIcon className="mt-0.5 size-4 shrink-0" />
																	{activity}
																</li>
															))}
														</ul>
													</div>
												)}

											{lockoutPermit.zeroEnergyReviews &&
												lockoutPermit.zeroEnergyReviews.length > 0 && (
													<div>
														<p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-semibold">
															<ZapIcon className="h-3.5 w-3.5" />
															Revisiones de Energía Cero
														</p>
														<div className="space-y-2">
															{lockoutPermit.zeroEnergyReviews.map((review) => (
																<div
																	key={review.id}
																	className="rounded border bg-white p-2 text-xs"
																>
																	<div className="grid grid-cols-2 gap-2">
																		<div>
																			<span className="text-muted-foreground font-semibold">
																				Equipo:
																			</span>{" "}
																			{review.equipment.name}
																		</div>
																		<div>
																			<span className="text-muted-foreground font-semibold">
																				Acción:
																			</span>{" "}
																			{review.action}
																		</div>
																		{review.location && (
																			<div>
																				<span className="text-muted-foreground font-semibold">
																					Ubicación:
																				</span>{" "}
																				{review.location}
																			</div>
																		)}
																		<div>
																			<span className="text-muted-foreground font-semibold">
																				Realizado por:
																			</span>{" "}
																			{review.performedBy.name}
																		</div>
																		<div className="col-span-2">
																			<Badge
																				variant={review.reviewedZero ? "default" : "secondary"}
																				className="text-xs"
																			>
																				{review.reviewedZero
																					? "✓ Energía cero verificada"
																					: "Pendiente verificación"}
																			</Badge>
																		</div>
																	</div>
																</div>
															))}
														</div>
													</div>
												)}

											{lockoutPermit.lockoutRegistrations &&
												lockoutPermit.lockoutRegistrations.length > 0 && (
													<div>
														<p className="text-muted-foreground mb-2 text-xs font-semibold">
															Registros de Bloqueo
														</p>
														<div className="space-y-2">
															{lockoutPermit.lockoutRegistrations.map((registration) => (
																<div
																	key={registration.id}
																	className="rounded border bg-white p-2 text-xs"
																>
																	<div className="mb-1 font-semibold">{registration.name}</div>
																	<div className="text-muted-foreground grid grid-cols-2 gap-1">
																		<div>RUT: {registration.rut}</div>
																		{registration.contractorLockNumber && (
																			<div>
																				Candado Contratista: {registration.contractorLockNumber}
																			</div>
																		)}
																		{registration.otcLockNumber && (
																			<div>Candado OTC: {registration.otcLockNumber}</div>
																		)}
																		{registration.otcOperator && (
																			<div>Operador OTC: {registration.otcOperator.name}</div>
																		)}
																	</div>
																</div>
															))}
														</div>
													</div>
												)}

											{lockoutPermit.finalObservations && (
												<div>
													<p className="text-muted-foreground mb-1 text-xs font-semibold">
														Observaciones Finales
													</p>
													<p className="text-sm">{lockoutPermit.finalObservations}</p>
												</div>
											)}
										</div>
									))}
								</div>
							</>
						) : null}

						{workPermit.approvalBy?.name && workPermit.approvalDate && (
							<>
								<Separator className="my-4" />

								<h2 className="flex items-center gap-2 text-lg font-semibold">
									<ShieldUserIcon className="h-5 w-5" />
									Aprobación y cierre
								</h2>

								<div className="grid grid-cols-2 gap-2">
									<div>
										<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
											<UserIcon className="h-4 w-4" />
											Aprobado por
										</p>
										<p className="font-semibold">{workPermit.approvalBy?.name}</p>
									</div>

									<div>
										<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
											<CalendarIcon className="h-4 w-4" />
											Fecha de aprobación
										</p>
										<p className="font-semibold">
											{format(workPermit.approvalDate, "dd/MM/yyyy HH:mm", { locale: es })}
										</p>
									</div>
								</div>

								<div>
									<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
										<UserIcon className="h-4 w-4" />
										Cerrado por
									</p>
									<p className="font-semibold">
										{workPermit.closingBy?.name || (
											<span className="font-semibold text-orange-600">
												Sistema (Cierre Automático)
											</span>
										)}
									</p>
								</div>

								<div>
									<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
										<CalendarIcon className="h-4 w-4" />
										Fecha de cierre
									</p>
									<p className="font-semibold">
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
