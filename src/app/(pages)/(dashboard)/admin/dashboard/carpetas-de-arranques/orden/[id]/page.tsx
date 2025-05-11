"use client"

import { useWorkOrderStartupFolder } from "@/hooks/startup-folders/use-work-order-startup-folder"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, ChevronLeft } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"

import { WorkOrderStartupFolderReviewForm } from "@/components/sections/startup-folders/work-order/WorkOrderStartupFolderReviewForm"
import { WorkOrderStartupFolderDocuments } from "@/components/sections/startup-folders/work-order/WorkOrderStartupFolderDocuments"
import { StartupFolderStatusBadge } from "@/components/ui/startup-folder-status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import BackButton from "@/components/shared/BackButton"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function WorkOrderStartupFolderPage() {
	const params = useParams()
	const { data: session } = authClient.useSession()
	const router = useRouter()
	const searchParams = useSearchParams()
	const tab = searchParams.get("tab") || "documentos"

	const {
		data: folder,
		isLoading,
		error,
	} = useWorkOrderStartupFolder({
		folderId: params.id as string,
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
						<Link href="/admin/dashboard/carpetas-de-arranques">
							<ChevronLeft className="mr-2 h-4 w-4" />
							Volver
						</Link>
					</Button>
				</div>
			</div>
		)
	}

	const isOTC =
		session?.user?.role === "OTC_RESPONSIBLE" || session?.user?.role === "OTC_SUPERVISOR"
	const canReview = isOTC && folder.status === "SUBMITTED"

	return (
		<div className="w-full flex-1">
			<div className="mb-6 flex items-center gap-4">
				<BackButton href="/admin/dashboard/carpetas-de-arranques" />

				<div className="flex-1">
					<div className="flex w-full items-center justify-between">
						<h1 className="text-2xl font-bold tracking-tight">
							Carpeta de Arranque: {folder.workOrder.otNumber}
						</h1>

						<StartupFolderStatusBadge status={folder.status} />
					</div>
					<p className="text-muted-foreground">{folder.workOrder.company.name}</p>
				</div>
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

			<Tabs
				defaultValue={tab}
				className="mb-8"
				onValueChange={(value) => {
					router.push(`/dashboard/carpetas-de-arranque/orden/${"params.id"}?tab=${value}`)
				}}
			>
				<TabsList className={cn("h-12 w-full", !canReview && "hidden")}>
					<TabsTrigger value="documentos" className="h-9">
						Documentos
					</TabsTrigger>
					{canReview && (
						<TabsTrigger value="revisar" className="h-9">
							Revisar carpeta
						</TabsTrigger>
					)}
				</TabsList>

				<TabsContent value="documentos" className="mt-6">
					<WorkOrderStartupFolderDocuments folder={folder} isEditable={false} />
				</TabsContent>

				{canReview && (
					<TabsContent value="revisar" className="mt-6">
						<WorkOrderStartupFolderReviewForm folder={folder} userId={session?.user?.id || ""} />
					</TabsContent>
				)}
			</Tabs>
		</div>
	)
}
