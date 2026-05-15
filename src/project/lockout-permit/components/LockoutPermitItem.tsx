"use client"

import { CheckCircle2Icon, PrinterIcon, XCircleIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"

import { updateLockoutPermitStatus } from "../actions/update-lockout-permit-status"
import { LOCKOUT_PERMIT_STATUS, LOCKOUT_TYPE } from "@/generated/prisma/enums"
import { queryClient } from "@/lib/queryClient"

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion"
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Label } from "@/shared/components/ui/label"

interface LockoutPermitItemProps {
	permit: {
		id: string
		startDate: Date
		endDate: Date | null
		approved: boolean | null
		approvalDate: Date | null
		lockoutType: LOCKOUT_TYPE
		approvalNotes: string | null
		activitiesToExecute: string[]
		status: LOCKOUT_PERMIT_STATUS
		lockoutTypeOther: string | null
		finalObservations: string | null
		areaResponsible: { id: string; name: string }
		equipments: { id: string; name: string; tag: string }[]
		lockoutRegistrations: {
			id: string
			rut: string
			name: string
			order: number
			contractorLockNumber: string | null
		}[]
	}
	index: number
	workPermitId: string
	isInternalMember: boolean
}

const statusConfig = {
	[LOCKOUT_PERMIT_STATUS.REVIEW_PENDING]: {
		label: "Pendiente de Revisión",
		variant: "secondary" as const,
		className: "bg-yellow-100 text-yellow-800 border-yellow-200",
	},
	[LOCKOUT_PERMIT_STATUS.ACTIVE]: {
		label: "Aprobado",
		variant: "default" as const,
		className: "bg-green-100 text-green-800 border-green-200",
	},
	[LOCKOUT_PERMIT_STATUS.REJECTED]: {
		label: "Rechazado",
		variant: "destructive" as const,
		className: "bg-red-100 text-red-800 border-red-200",
	},
	[LOCKOUT_PERMIT_STATUS.COMPLETED]: {
		label: "Completado",
		variant: "outline" as const,
		className: "bg-blue-100 text-blue-800 border-blue-200",
	},
}

const lockoutTypeLabels = {
	[LOCKOUT_TYPE.PREVENTIVE]: "Preventivo",
	[LOCKOUT_TYPE.CORRECTIVE]: "Correctivo",
	[LOCKOUT_TYPE.EMERGENCY]: "Emergencia",
	[LOCKOUT_TYPE.OTHER]: "Otro",
}

export function LockoutPermitItem({
	permit,
	workPermitId,
	isInternalMember,
	index,
}: LockoutPermitItemProps) {
	const [isUpdating, setIsUpdating] = useState(false)
	const [approvalNotes, setApprovalNotes] = useState(permit.approvalNotes || "")

	const statusInfo = statusConfig[permit.status]
	const canApprove = isInternalMember && permit.status === LOCKOUT_PERMIT_STATUS.REVIEW_PENDING

	const handleUpdateStatus = async (status: LOCKOUT_PERMIT_STATUS) => {
		try {
			setIsUpdating(true)

			const result = await updateLockoutPermitStatus({
				lockoutPermitId: permit.id,
				status,
				approvalNotes: approvalNotes || undefined,
			})

			if (!result.ok) {
				toast.error(result.message)
				return
			}

			toast.success(result.message)
			await queryClient.invalidateQueries({ queryKey: ["work-permits"] })
		} catch (error) {
			console.error("Error al actualizar estado:", error)
			toast.error("Error al actualizar el estado del permiso")
		} finally {
			setIsUpdating(false)
		}
	}

	return (
		<AccordionItem value={`permit-${index}`} className="mb-2 rounded-lg border">
			<AccordionTrigger className="hover:bg-accent/50 px-4 py-3 hover:no-underline">
				<div className="flex w-full items-center justify-between pr-4">
					<span className="font-semibold">Permiso de Bloqueo #{index + 1}</span>

					<div className="text-muted-foreground flex items-center gap-2 text-sm">
						<Badge className={statusInfo.className}>{statusInfo.label}</Badge>
					</div>
				</div>
			</AccordionTrigger>

			<AccordionContent className="px-4 pb-4">
				<div className="space-y-4 pt-2">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label className="text-muted-foreground text-xs">Fecha de Inicio</Label>
							<p className="text-sm font-semibold">
								{format(new Date(permit.startDate), "PPP", { locale: es })}
							</p>
						</div>
						{permit.endDate && (
							<div>
								<Label className="text-muted-foreground text-xs">Fecha de Término</Label>
								<p className="text-sm font-semibold">
									{format(new Date(permit.endDate), "PPP", { locale: es })}
								</p>
							</div>
						)}
						<div className="col-span-2">
							<Label className="text-muted-foreground text-xs">Responsable del Área</Label>
							<p className="text-sm font-semibold">{permit.areaResponsible.name}</p>
						</div>

						<div className="col-span-2 flex items-center justify-between gap-2">
							<div>
								<Label className="text-muted-foreground text-xs">Tipo de Bloqueo</Label>
								<p className="text-sm font-semibold">{lockoutTypeLabels[permit.lockoutType]}</p>
							</div>

							{permit.lockoutType === LOCKOUT_TYPE.OTHER && permit.lockoutTypeOther && (
								<span className="italic">({permit.lockoutTypeOther})</span>
							)}
						</div>
					</div>

					{permit.equipments.length > 0 && (
						<div>
							<Label className="text-muted-foreground text-xs">
								Equipos ({permit.equipments.length})
							</Label>
							<div className="mt-2 flex flex-wrap gap-2">
								{permit.equipments.map((equipment) => (
									<Badge key={equipment.id} variant="outline" className="text-xs">
										{equipment.tag} - {equipment.name}
									</Badge>
								))}
							</div>
						</div>
					)}

					<div>
						<Label className="text-muted-foreground text-xs">
							Actividades a Ejecutar ({permit.activitiesToExecute.length})
						</Label>
						<ul className="mt-2 list-inside list-disc space-y-1">
							{permit.activitiesToExecute.map((activity, idx) => (
								<li key={idx} className="text-sm">
									{activity}
								</li>
							))}
						</ul>
					</div>

					{permit.lockoutRegistrations.length > 0 && (
						<div>
							<Label className="text-muted-foreground text-xs">
								Registros de Bloqueo ({permit.lockoutRegistrations.length})
							</Label>
							<div className="mt-2 space-y-2">
								{permit.lockoutRegistrations.map((reg) => (
									<div
										key={reg.id}
										className="bg-muted/50 flex items-center justify-between rounded p-2"
									>
										<div>
											<p className="text-sm font-semibold">{reg.name}</p>
											<p className="text-muted-foreground text-xs">{reg.rut}</p>
										</div>
										{reg.contractorLockNumber && (
											<Badge variant="outline" className="text-xs">
												Candado #{reg.contractorLockNumber}
											</Badge>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					{permit.finalObservations && (
						<div>
							<Label className="text-muted-foreground text-xs">Observaciones Finales</Label>
							<p className="bg-muted/50 mt-1 rounded p-2 text-sm">{permit.finalObservations}</p>
						</div>
					)}

					{permit.approved !== null && permit.approvalDate && (
						<div className="bg-muted/30 rounded-lg p-3">
							<Label className="text-muted-foreground text-xs">Estado de Aprobación</Label>
							<p className="mt-1 text-sm">
								{permit.approved ? "✓ Aprobado" : "✗ Rechazado"} el{" "}
								{format(new Date(permit.approvalDate), "PPP", { locale: es })}
							</p>
							{permit.approvalNotes && (
								<p className="text-muted-foreground mt-2 text-sm italic">
									Notas: {permit.approvalNotes}
								</p>
							)}
						</div>
					)}

					{canApprove && (
						<div className="space-y-3 border-t pt-4">
							<div>
								<Label htmlFor={`notes-${permit.id}`} className="text-sm">
									Notas de Aprobación/Rechazo (opcional)
								</Label>
								<Textarea
									id={`notes-${permit.id}`}
									value={approvalNotes}
									onChange={(e) => setApprovalNotes(e.target.value)}
									placeholder="Agregue comentarios sobre la aprobación o rechazo..."
									className="mt-1"
									rows={3}
								/>
							</div>

							<div className="flex gap-2">
								<Button
									size="sm"
									variant="default"
									disabled={isUpdating}
									onClick={() => handleUpdateStatus(LOCKOUT_PERMIT_STATUS.ACTIVE)}
									className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700"
								>
									<CheckCircle2Icon className="mr-2 h-4 w-4" />
									Aprobar
								</Button>
								<Button
									size="sm"
									variant="destructive"
									disabled={isUpdating}
									className="flex-1 bg-red-600 hover:bg-red-700"
									onClick={() => handleUpdateStatus(LOCKOUT_PERMIT_STATUS.REJECTED)}
								>
									<XCircleIcon className="mr-2 h-4 w-4" />
									Rechazar
								</Button>
							</div>
						</div>
					)}

					<div className="pt-2">
						<Button variant="outline" size="lg" asChild className="w-full">
							<Link
								href={`/admin/dashboard/permisos-de-trabajo/${workPermitId}/bloqueo/${permit.id}/pdf`}
							>
								<PrinterIcon className="mr-2 h-4 w-4" />
								Imprimir este Permiso de Bloqueo
							</Link>
						</Button>
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	)
}
