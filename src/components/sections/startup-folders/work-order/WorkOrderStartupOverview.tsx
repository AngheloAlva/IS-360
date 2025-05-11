"use client"

import { useEffect, useState } from "react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import {
	X,
	Info,
	FileCheck,
	Briefcase,
	CheckCircle2,
	AlertTriangle,
	AlertCircleIcon,
} from "lucide-react"

import { useWorkOrderStartupFolder } from "@/hooks/startup-folders/use-work-order-startup-folder"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StartupFolderStatusBadge } from "@/components/ui/startup-folder-status-badge"
import { WorkOrderStartupFolderSubmitForm } from "./WorkOrderStartupFolderSubmitForm"
import { WorkOrderStartupFolderDocuments } from "./WorkOrderStartupFolderDocuments"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { WorkerDocumentsList } from "./WorkerDocumentsList"
import BackButton from "@/components/shared/BackButton"
import { Skeleton } from "@/components/ui/skeleton"

interface WorkOrderStartupOverviewProps {
	companyId: string
	folderId: string
	userId: string
}

export default function WorkOrderStartupOverview({
	folderId,
	companyId,
}: WorkOrderStartupOverviewProps): React.ReactElement {
	const {
		data: folder,
		isLoading,
		error,
	} = useWorkOrderStartupFolder({
		folderId,
	})

	const [statusInfo, setStatusInfo] = useState({
		title: "",
		description: "",
		icon: null as React.ReactNode,
		color: "",
	})

	useEffect(() => {
		if (folder) {
			if (folder.status === "DRAFT") {
				setStatusInfo({
					title: "Carpeta en borrador",
					description:
						"Complete los documentos requeridos y envíe la carpeta para revisión cuando esté lista.",
					icon: <Info className="h-5 w-5" />,
					color: "text-blue-500",
				})
			} else if (folder.status === "SUBMITTED") {
				setStatusInfo({
					title: "Carpeta enviada para revisión",
					description: "La carpeta está siendo revisada por el equipo de OTC.",
					icon: <FileCheck className="h-5 w-5" />,
					color: "text-amber-500",
				})
			} else if (folder.status === "APPROVED") {
				setStatusInfo({
					title: "Carpeta aprobada",
					description: "La documentación ha sido revisada y aprobada.",
					icon: <CheckCircle2 className="h-5 w-5" />,
					color: "text-green-500",
				})
			} else if (folder.status === "REJECTED") {
				setStatusInfo({
					title: "Carpeta rechazada",
					description:
						"La documentación requiere cambios. Por favor revise los comentarios y vuelva a enviar.",
					icon: <AlertTriangle className="h-5 w-5" />,
					color: "text-red-500",
				})
			}
		}
	}, [folder])

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-1/3" />
				<Skeleton className="h-20 w-full" />
				<Skeleton className="h-[400px] w-full" />
			</div>
		)
	}

	if (error || !folder) {
		return (
			<Alert variant="destructive">
				<AlertCircleIcon />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					No se pudo cargar la carpeta de arranque. Por favor intente nuevamente.
				</AlertDescription>
			</Alert>
		)
	}

	if (companyId !== folder.workOrder.company.id) {
		return (
			<Alert variant="destructive">
				<AlertCircleIcon />
				<AlertTitle>Acceso denegado</AlertTitle>
				<AlertDescription>
					No tiene permiso para acceder a esta carpeta de arranque.
				</AlertDescription>
			</Alert>
		)
	}

	const canSubmit = folder && (folder.status === "DRAFT" || folder.status === "REJECTED")

	const canEditDocuments =
		(folder && (folder.status === "DRAFT" || folder.status === "REJECTED")) || false

	return (
		<div className="w-full flex-1 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<BackButton href="/dashboard/carpetas-de-arranque" />
					<div>
						<h1 className="text-2xl font-bold tracking-tight">
							Carpeta para {folder.workOrder.otNumber}
						</h1>
						<p className="text-muted-foreground">
							Documentación específica para la orden de trabajo
						</p>
					</div>
				</div>

				<StartupFolderStatusBadge status={folder.status} />
			</div>

			<div className="mt-6">
				<Card>
					<CardHeader className="flex w-full flex-row items-center justify-between pb-3">
						<div>
							<CardTitle>Estado de la carpeta</CardTitle>
							<CardDescription>Información sobre la orden de trabajo</CardDescription>
						</div>

						{canSubmit && <WorkOrderStartupFolderSubmitForm folder={folder} />}
					</CardHeader>

					<CardContent>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<h3 className="flex items-center gap-2 text-sm font-medium">
									<Briefcase className="text-muted-foreground h-4 w-4" />
									Información del trabajo
								</h3>
								<div className="mt-2 space-y-2">
									<p className="text-sm">
										<span className="font-medium">Orden:</span> {folder.workOrder.otNumber}
									</p>
									<p className="text-sm">
										<span className="font-medium">Tipo:</span>{" "}
										{WorkOrderTypeLabels[folder.workOrder.type]}
									</p>
									{folder.workOrder.workName && (
										<p className="text-sm">
											<span className="font-medium">Trabajo:</span> {folder.workOrder.workName}
										</p>
									)}
									{folder.workOrder.workDescription && (
										<p className="text-sm">
											<span className="font-medium">Descripción:</span>{" "}
											{folder.workOrder.workDescription}
										</p>
									)}
								</div>
							</div>

							<div>
								<Alert>
									{statusInfo.icon}
									<AlertTitle>{statusInfo.title}</AlertTitle>
									<AlertDescription>{statusInfo.description}</AlertDescription>
								</Alert>
							</div>
						</div>

						{folder.reviewComments && folder.status === "REJECTED" && (
							<Alert className="mt-4 border-red-200 bg-red-50">
								<AlertTriangle className="h-4 w-4 text-red-500" />
								<AlertTitle>Comentarios de revisión</AlertTitle>
								<AlertDescription className="mt-2 text-sm">
									{folder.reviewComments}
								</AlertDescription>
							</Alert>
						)}

						{folder.reviewedAt && (
							<div className="bg-muted mt-4 flex items-center space-x-3 rounded-lg p-4">
								<div className="bg-muted-foreground/20 rounded-full p-2">
									{folder.status === "APPROVED" ? (
										<CheckCircle2 className="text-muted-foreground h-5 w-5" />
									) : (
										<X className="text-muted-foreground h-5 w-5" />
									)}
								</div>
								<div>
									<p className="text-muted-foreground text-sm">
										{folder.status === "APPROVED" ? "Aprobado" : "Rechazado"} por{" "}
										{folder.reviewer?.name || "Revisor OTC"}
									</p>
									<p className="font-medium">
										{format(new Date(folder.reviewedAt), "PPP", { locale: es })}
									</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<WorkOrderStartupFolderDocuments folder={folder} isEditable={canEditDocuments} />

			<WorkerDocumentsList folder={folder} isEditable={canEditDocuments} />
		</div>
	)
}
