"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle2, X, FileCheck, AlertTriangle, Info } from "lucide-react"

import { useGeneralStartupFolder } from "@/hooks/startup-folders/use-general-startup-folder"
import { StartupFolderStatusBadge } from "@/components/ui/startup-folder-status-badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { GeneralStartupFolderSubmitForm } from "@/components/forms/startup-folders/GeneralStartupFolderSubmitForm"
import { GeneralStartupFolderDocuments } from "@/components/sections/startup-folders/GeneralStartupFolderDocuments"

export default function GeneralStartupFolderPage() {
	const params = useParams()
	const router = useRouter()
	const searchParams = useSearchParams()
	const { data: session } = authClient.useSession()
	const tab = searchParams.get("tab") || "documentos"
	const folderId = params.id as string

	const {
		data: folder,
		isLoading,
		error,
	} = useGeneralStartupFolder({
		folderId,
		enabled: Boolean(folderId),
	})

	const [statusInfo, setStatusInfo] = useState({
		title: "",
		description: "",
		icon: null as React.ReactNode,
		color: "",
	})

	useEffect(() => {
		if (folder) {
			// Configurar la información de estado según el status de la carpeta
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

	// Verificar si el usuario puede editar los documentos (en estado DRAFT o REJECTED)
	const canEditDocuments =
		(folder && (folder.status === "DRAFT" || folder.status === "REJECTED")) || false

	// Verificar si el usuario puede enviar la carpeta para revisión (es supervisor de empresa y está en DRAFT o REJECTED)
	const canSubmit =
		folder &&
		session?.user?.role === "PARTNER_COMPANY" &&
		session?.user?.isSupervisor === true &&
		(folder.status === "DRAFT" || folder.status === "REJECTED")

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
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					No se pudo cargar la carpeta de arranque. Por favor intente nuevamente.
				</AlertDescription>
			</Alert>
		)
	}

	// Verificar que esta carpeta pertenece a la empresa del usuario
	if (session?.user?.companyId && session.user.companyId !== folder.companyId) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Acceso denegado</AlertTitle>
				<AlertDescription>
					No tiene permiso para acceder a esta carpeta de arranque.
				</AlertDescription>
			</Alert>
		)
	}

	return (
		<div>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Carpeta de Arranque - {folder.company.name}
					</h1>
					<p className="text-muted-foreground">Gestione la documentación general de su empresa</p>
				</div>

				<StartupFolderStatusBadge status={folder.status} />
			</div>

			<div className="mt-6">
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Estado de la carpeta</CardTitle>
								<CardDescription>Información sobre el estado actual</CardDescription>
							</div>
							<div className={`${statusInfo.color}`}>{statusInfo.icon}</div>
						</div>
					</CardHeader>
					<CardContent>
						<Alert>
							<div className={statusInfo.color}>{statusInfo.icon}</div>
							<AlertTitle>{statusInfo.title}</AlertTitle>
							<AlertDescription>{statusInfo.description}</AlertDescription>
						</Alert>

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

			<Tabs
				defaultValue={tab}
				className="mt-8"
				onValueChange={(value) => {
					router.push(`/dashboard/carpetas-de-arranque/general/${params.id}?tab=${value}`)
				}}
			>
				<TabsList>
					<TabsTrigger value="documentos">Documentos</TabsTrigger>
					{canSubmit && <TabsTrigger value="enviar">Enviar para revisión</TabsTrigger>}
				</TabsList>

				<TabsContent value="documentos" className="mt-6">
					<GeneralStartupFolderDocuments folder={folder} isEditable={canEditDocuments} />
				</TabsContent>

				{canSubmit && (
					<TabsContent value="enviar" className="mt-6">
						<GeneralStartupFolderSubmitForm folder={folder} />
					</TabsContent>
				)}
			</Tabs>
		</div>
	)
}
