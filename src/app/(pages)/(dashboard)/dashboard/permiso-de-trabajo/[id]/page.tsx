"use client"

import { useEffect, useState } from "react"

import { getWorkPermit } from "@/actions/work-permit/getWorkPermit"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BackButton from "@/components/shared/BackButton"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import type { WorkPermit, WorkOrder, User } from "@prisma/client"

interface WorkPermitDetailsProps {
	params: Promise<{
		id: string
	}>
}

type WorkPermitDetails = WorkPermit & {
	participants: User[]
	otNumber: WorkOrder
}

const getWorkPermitStatus = (workPermit: WorkPermitDetails) => {
	const now = new Date()
	const initDate = new Date(workPermit.initDate)

	if (workPermit.workCompleted && workPermit.cleanAndTidyWorkArea) {
		return { label: "Completado", variant: "default" as const }
	}

	if (initDate > now) {
		return { label: "Programado", variant: "secondary" as const }
	}

	return { label: "En Progreso", variant: "default" as const }
}

export default function WorkPermitDetails({ params }: WorkPermitDetailsProps) {
	const [workPermit, setWorkPermit] = useState<
		| (WorkPermitDetails & {
				preventionOfficerUser: User
		  })
		| undefined
		| null
	>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchWorkPermit = async () => {
			const { id } = await params

			const response = await getWorkPermit(id)
			if (response.ok) {
				setWorkPermit(response.data)
			}
			setLoading(false)
		}

		fetchWorkPermit()
	}, [params])

	if (loading) {
		return (
			<div className="space-y-6 p-6">
				<Skeleton className="h-12 w-[250px]" />
				<div className="grid gap-6 md:grid-cols-2">
					<Skeleton className="h-[200px]" />
					<Skeleton className="h-[200px]" />
				</div>
			</div>
		)
	}

	if (!workPermit) {
		return (
			<div className="p-6">
				<h1 className="text-2xl font-bold text-red-600">Permiso de trabajo no encontrado</h1>
			</div>
		)
	}

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<BackButton href={"/dashboard/permiso-de-trabajo"} />
					<h1 className="text-3xl font-bold">Permiso de Trabajo</h1>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant={getWorkPermitStatus(workPermit).variant}>
						{getWorkPermitStatus(workPermit).label}
					</Badge>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Información General</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-6 md:grid-cols-3">
						<div className="space-y-4">
							<div>
								<p className="text-muted-foreground text-sm">Aplicante PT</p>
								<p className="font-medium">{workPermit.aplicantPt}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Responsable PT</p>
								<p className="font-medium">{workPermit.responsiblePt}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Empresa Ejecutora</p>
								<p className="font-medium">{workPermit.executanCompany}</p>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<p className="text-muted-foreground text-sm">Número OT</p>
								<p className="font-medium">{workPermit.otNumber.otNumber}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Mutualidad</p>
								<p className="font-medium">{workPermit.mutuality}</p>
								{workPermit.otherMutuality && (
									<p className="text-muted-foreground text-sm">
										Otra mutualidad: {workPermit.otherMutuality}
									</p>
								)}
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Número de Trabajadores</p>
								<p className="font-medium">{workPermit.workersNumber}</p>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<p className="text-muted-foreground text-sm">Fecha de Inicio</p>
								<p className="font-medium">
									{new Date(workPermit.initDate).toLocaleDateString()} - {workPermit.hour}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Lugar Exacto</p>
								<p className="font-medium">{workPermit.exactPlace}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Descripción del Trabajo</p>
								<p className="font-medium">{workPermit.workDescription}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Tipo de Trabajo</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="text-muted-foreground text-sm">Trabajo a Realizar</p>
							<div className="flex flex-wrap gap-2">
								<p>{workPermit.workWillBe}</p>
								{workPermit.workWillBeOther && (
									<>
										<p className="text-muted-foreground text-sm">Otro tipo: </p>
										<span>{workPermit.workWillBeOther}</span>
									</>
								)}
							</div>
						</div>
						<div>
							<p className="text-muted-foreground text-sm">Detalles de Actividad</p>
							<ul className="mt-2 gap-2">
								{workPermit.activityDetails.map((activity: string, index) => (
									<li key={activity}>
										<span className="text-muted-foreground mr-1 text-sm">{index + 1}.</span>
										{activity}
									</li>
								))}
							</ul>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Herramientas y Equipos</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="mb-4 flex flex-wrap gap-2">
							{workPermit.tools.map((tool: string) => (
								<Badge key={tool} variant="outline">
									{tool}
								</Badge>
							))}
						</div>

						{workPermit.otherTools && (
							<>
								<p className="text-muted-foreground text-sm">Otras herramientas</p>
								<span>{workPermit.otherTools}</span>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Verificaciones Previas</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="mb-4 flex flex-wrap gap-2">
							{workPermit.preChecks.map((check: string) => (
								<Badge key={check} variant="outline">
									{check}
								</Badge>
							))}
						</div>

						{workPermit.otherPreChecks && (
							<>
								<p className="text-muted-foreground text-sm">Otras verificaciones</p>
								<span>{workPermit.otherPreChecks}</span>
							</>
						)}
					</CardContent>
				</Card>

				{workPermit.generateWaste && (
					<Card>
						<CardHeader>
							<CardTitle>Tipos de Residuos</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">Tipo de Residuo</p>
							<div className="flex flex-wrap gap-2">
								<Badge variant="outline">{workPermit.wasteType}</Badge>
							</div>

							<p className="text-muted-foreground mt-4 text-sm">Lugar de Desecho</p>
							<div className="flex flex-wrap gap-2">
								<span>{workPermit.wasteDisposalLocation}</span>
							</div>
						</CardContent>
					</Card>
				)}

				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Riesgos y Medidas de Control</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div>
							<h3 className="mb-3 font-semibold">Riesgos Identificados</h3>
							<div className="mb-4 flex flex-wrap gap-2">
								{workPermit.riskIdentification.map((risk: string) => (
									<Badge
										key={risk}
										variant="destructive"
										className="border-red-300 bg-red-50 text-black"
									>
										{risk}
									</Badge>
								))}
							</div>
							{workPermit.otherRisk && (
								<>
									<p className="text-muted-foreground text-sm">Otro riesgo: </p>
									<span>{workPermit.otherRisk}</span>
								</>
							)}
						</div>
						<Separator />
						<div>
							<h3 className="mb-3 font-semibold">Medidas de Control</h3>
							<div className="mb-4 flex flex-wrap gap-2">
								{workPermit.preventiveControlMeasures.map((measure: string) => (
									<Badge key={measure} variant="outline" className="border-green-300 bg-green-50">
										{measure}
									</Badge>
								))}
							</div>
							{workPermit.otherPreventiveControlMeasures && (
								<>
									<p className="text-muted-foreground text-sm">Otras medidas de control: </p>
									<span>{workPermit.otherPreventiveControlMeasures}</span>
								</>
							)}
						</div>
					</CardContent>
				</Card>

				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Estado del Trabajo</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-6 md:grid-cols-2">
						<div className="space-y-4">
							<div>
								<p className="text-muted-foreground text-sm">Quien Entrega Área de Trabajo (Op)</p>
								<p className="font-medium">{workPermit.whoDeliversWorkAreaOp}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Trabajador Ejecutor</p>
								<p className="font-medium">{workPermit.workerExecutor}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Prevencionista</p>
								<p className="font-medium">{workPermit.preventionOfficerUser.name}</p>
							</div>
							{workPermit.whoReceives && (
								<div>
									<p className="text-muted-foreground text-sm">Quien Recibe</p>
									<p className="font-medium">{workPermit.whoReceives}</p>
								</div>
							)}
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<p className="text-muted-foreground text-sm">Área de Trabajo Limpia y Ordenada:</p>
								<Badge variant={workPermit.cleanAndTidyWorkArea ? "default" : "secondary"}>
									{workPermit.cleanAndTidyWorkArea ? "Sí" : "No"}
								</Badge>
							</div>
							<div className="flex items-center gap-2">
								<p className="text-muted-foreground text-sm">Trabajo Completado:</p>
								<Badge variant={workPermit.workCompleted ? "default" : "secondary"}>
									{workPermit.workCompleted ? "Sí" : "No"}
								</Badge>
							</div>
							{workPermit.observations && (
								<div>
									<p className="text-muted-foreground text-sm">Observaciones:</p>
									<p className="font-medium">{workPermit.observations}</p>
								</div>
							)}
							{workPermit.additionalObservations && (
								<div>
									<p className="text-muted-foreground text-sm">Observaciones Adicionales:</p>
									<p className="font-medium">{workPermit.additionalObservations}</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Participantes</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{workPermit.participants.map((participant) => (
								<div key={participant.id} className="w-full space-y-2 rounded-lg border p-3">
									<div className="flex w-full items-center justify-between font-medium">
										<p>{participant.name}</p>
									</div>
									<p className="text-muted-foreground text-sm">RUT: {participant.rut}</p>
									{/* <p className="text-muted-foreground text-sm">Empresa: {participant.company}</p> */}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
