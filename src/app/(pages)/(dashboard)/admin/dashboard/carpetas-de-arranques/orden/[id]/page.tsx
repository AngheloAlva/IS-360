"use client"

import { useWorkOrderStartupFolder } from "@/hooks/startup-folders/use-work-order-startup-folder"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { WorkOrderStartupFolderReviewForm } from "@/components/sections/startup-folders/WorkOrderStartupFolderReviewForm"
import { WorkOrderStartupFolderSubmitForm } from "@/components/sections/startup-folders/WorkOrderStartupFolderSubmitForm"
import { WorkOrderStartupFolderDocuments } from "@/components/sections/startup-folders/WorkOrderStartupFolderDocuments"
import { X, Clock, FileText, AlertCircle, ChevronLeft, CheckCircle2 } from "lucide-react"
import { StartupFolderStatusBadge } from "@/components/ui/startup-folder-status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

// TODO: Implementar uso de params
export default function WorkOrderStartupFolderPage() {
	const { data: session } = authClient.useSession()
	const router = useRouter()
	const searchParams = useSearchParams()
	const tab = searchParams.get("tab") || "documentos"

	const {
		data: folder,
		isLoading,
		error,
	} = useWorkOrderStartupFolder({
		folderId: "params.id",
	})

	if (isLoading) {
		return (
			<div className="container space-y-6 py-6">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<Skeleton className="h-8 w-64" />
						<Skeleton className="h-4 w-48" />
					</div>
					<Skeleton className="h-10 w-24" />
				</div>
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-[400px] w-full" />
			</div>
		)
	}

	if (error || !folder) {
		return (
			<div className="container py-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						No se pudo cargar la información de la carpeta. Por favor, inténtalo de nuevo.
					</AlertDescription>
				</Alert>
				<div className="mt-4">
					<Button asChild variant="outline">
						<Link href="/dashboard/carpetas-de-arranque">
							<ChevronLeft className="mr-2 h-4 w-4" />
							Volver
						</Link>
					</Button>
				</div>
			</div>
		)
	}

	// Determinar si el usuario puede editar la carpeta
	const isOTC =
		session?.user?.role === "OTC_RESPONSIBLE" || session?.user?.role === "OTC_SUPERVISOR"
	const isCompanySupervisor =
		session?.user?.role === "COMPANY_SUPERVISOR" &&
		session?.user?.companyId === folder.workOrder.companyId
	const canEditDocuments =
		(isOTC || isCompanySupervisor) && (folder.status === "DRAFT" || folder.status === "REJECTED")
	const canSubmit =
		(isOTC || isCompanySupervisor) && (folder.status === "DRAFT" || folder.status === "REJECTED")
	const canReview = isOTC && folder.status === "SUBMITTED"

	return (
		<div className="container py-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<div className="flex items-center space-x-2">
						<h1 className="text-2xl font-bold tracking-tight">
							Carpeta de Arranque: {folder.workOrder.otNumber}
						</h1>
						<StartupFolderStatusBadge status={folder.status} />
					</div>
					<p className="text-muted-foreground">
						{folder.workOrder.company.name} •{" "}
						{folder.workOrder.workDescription || "Sin descripción"}
					</p>
				</div>

				<Button asChild variant="outline">
					<Link href="/dashboard/carpetas-de-arranque">
						<ChevronLeft className="mr-2 h-4 w-4" />
						Volver
					</Link>
				</Button>
			</div>

			{folder.reviewComments && folder.status === "REJECTED" && (
				<Alert className="mb-6" variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Carpeta rechazada</AlertTitle>
					<AlertDescription>
						<div className="font-medium">Comentarios del revisor:</div>
						<p className="mt-1">{folder.reviewComments}</p>
					</AlertDescription>
				</Alert>
			)}

			<div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
				<div className="bg-muted flex items-center space-x-3 rounded-lg p-4">
					<div className="bg-muted-foreground/20 rounded-full p-2">
						<Clock className="text-muted-foreground h-5 w-5" />
					</div>
					<div>
						<p className="text-muted-foreground text-sm">Fecha de creación</p>
						<p className="font-medium">
							{format(new Date(folder.createdAt), "PPP", { locale: es })}
						</p>
					</div>
				</div>

				<div className="bg-muted flex items-center space-x-3 rounded-lg p-4">
					<div className="bg-muted-foreground/20 rounded-full p-2">
						<FileText className="text-muted-foreground h-5 w-5" />
					</div>
					<div>
						<p className="text-muted-foreground text-sm">Estado actual</p>
						<p className="font-medium">
							{folder.status === "DRAFT" && "Borrador"}
							{folder.status === "SUBMITTED" && "Enviado para revisión"}
							{folder.status === "APPROVED" && "Aprobado"}
							{folder.status === "REJECTED" && "Rechazado"}
						</p>
					</div>
				</div>

				{folder.submittedAt && (
					<div className="bg-muted flex items-center space-x-3 rounded-lg p-4">
						<div className="bg-muted-foreground/20 rounded-full p-2">
							<CheckCircle2 className="text-muted-foreground h-5 w-5" />
						</div>
						<div>
							<p className="text-muted-foreground text-sm">Enviado para revisión</p>
							<p className="font-medium">
								{format(new Date(folder.submittedAt), "PPP", { locale: es })}
							</p>
						</div>
					</div>
				)}

				{folder.reviewedAt && (
					<div className="bg-muted flex items-center space-x-3 rounded-lg p-4">
						<div className="bg-muted-foreground/20 rounded-full p-2">
							{folder.status === "APPROVED" ? (
								<CheckCircle2 className="text-muted-foreground h-5 w-5" />
							) : (
								<X className="text-muted-foreground h-5 w-5" />
							)}
						</div>
						<div>
							<p className="text-muted-foreground text-sm">
								{folder.status === "APPROVED" ? "Aprobado" : "Rechazado"}
							</p>
							<p className="font-medium">
								{format(new Date(folder.reviewedAt), "PPP", { locale: es })}
							</p>
						</div>
					</div>
				)}
			</div>

			<Tabs
				defaultValue={tab}
				className="mb-8"
				onValueChange={(value) => {
					router.push(`/dashboard/carpetas-de-arranque/orden/${"params.id"}?tab=${value}`)
				}}
			>
				<TabsList>
					<TabsTrigger value="documentos">Documentos</TabsTrigger>
					{canSubmit && <TabsTrigger value="enviar">Enviar para revisión</TabsTrigger>}
					{canReview && <TabsTrigger value="revisar">Revisar carpeta</TabsTrigger>}
				</TabsList>

				<TabsContent value="documentos" className="mt-6">
					<WorkOrderStartupFolderDocuments folder={folder} isEditable={canEditDocuments} />
				</TabsContent>

				{canSubmit && (
					<TabsContent value="enviar" className="mt-6">
						<WorkOrderStartupFolderSubmitForm folder={folder} />
					</TabsContent>
				)}

				{canReview && (
					<TabsContent value="revisar" className="mt-6">
						<WorkOrderStartupFolderReviewForm folder={folder} userId={session?.user?.id || ""} />
					</TabsContent>
				)}
			</Tabs>
		</div>
	)
}
