"use client"

import { Files, Building2, LayoutList } from "lucide-react"

import { useGeneralStartupFolder } from "@/hooks/startup-folders/use-general-startup-folder"

import { WorkOrderStartupFoldersList } from "@/components/sections/startup-folders/work-order/WorkOrderStartupFoldersList"
import { GeneralStartupFolderDocuments } from "./general/GeneralStartupFolderDocuments"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface StartupFolderOverviewProps {
	userId: string
	companyId: string
}

export default function StartupFolderOverview({
	companyId,
}: StartupFolderOverviewProps): React.ReactElement {
	const {
		data: folders,
		isLoading: isLoadingFolders,
		error,
	} = useGeneralStartupFolder({
		companyId,
	})

	if (isLoadingFolders) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-1/3" />
				<Skeleton className="h-20 w-full" />
				<Skeleton className="h-[400px] w-full" />
			</div>
		)
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					Error al cargar las carpetas de arranque. Por favor, inténtelo de nuevo más tarde.
				</AlertDescription>
			</Alert>
		)
	}

	const canEditDocuments =
		(folders && (folders.status === "DRAFT" || folders.status === "REJECTED")) || false

	return (
		<Tabs defaultValue="general" className="w-full space-y-4">
			<TabsList className="h-11 w-full">
				<TabsTrigger value="general" className="flex h-9 items-center gap-2">
					<Building2 className="h-4 w-4" />
					<span>Carpeta General</span>
				</TabsTrigger>
				<TabsTrigger value="ordenes" className="flex h-9 items-center gap-2">
					<LayoutList className="h-4 w-4" />
					<span>Órdenes de Trabajo</span>
				</TabsTrigger>
			</TabsList>

			<TabsContent value="general" className="w-full">
				<div>
					<div className="space-y-6">
						<div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
							<div>
								<div className="flex items-center gap-2">
									<Building2 className="text-muted-foreground h-5 w-5" />
									<h2 className="text-xl font-semibold tracking-tight">
										Carpeta de Arranque General
									</h2>
								</div>
								<p className="text-muted-foreground mt-1">
									Esta carpeta contiene documentación general de tu empresa que aplica a todas las
									órdenes de trabajo
								</p>
							</div>

							<div className="text-muted-foreground flex min-w-fit flex-wrap items-start gap-1 gap-x-4 text-sm lg:flex-col lg:flex-nowrap lg:items-center xl:flex-row">
								<div className="flex items-center text-nowrap lg:w-full">
									<div className="mr-2 size-3 rounded-full bg-green-500"></div>
									<span>Completados</span>
								</div>
								<div className="flex items-center text-nowrap lg:w-full">
									<div className="mr-2 size-3 rounded-full bg-amber-500"></div>
									<span>Pendientes (opcionales)</span>
								</div>
								<div className="flex items-center text-nowrap lg:w-full">
									<div className="mr-2 size-3 rounded-full bg-red-500"></div>
									<span>Pendientes (requeridos)</span>
								</div>
							</div>
						</div>

						{folders && folders.documents?.length > 0 ? (
							<GeneralStartupFolderDocuments folder={folders} isEditable={canEditDocuments} />
						) : (
							<div className="col-span-full flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
								<Files className="text-muted-foreground h-8 w-8" />
								<div>
									<p className="text-lg font-medium">No hay carpeta de arranque general</p>
									<p className="text-muted-foreground text-sm">
										Su empresa aún no tiene una carpeta de arranque general. Por favor contacte con
										soporte.
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</TabsContent>

			<TabsContent value="ordenes">
				<div>
					<div>
						<div className="flex items-center gap-2">
							<LayoutList className="text-muted-foreground h-5 w-5" />
							<h2 className="text-xl font-semibold tracking-tight">
								Carpetas de Órdenes de Trabajo
							</h2>
						</div>
						<p className="text-muted-foreground mt-1 mb-6">
							Cada orden de trabajo tiene una carpeta específica con los documentos necesarios para
							ese trabajo
						</p>

						<WorkOrderStartupFoldersList />
					</div>
				</div>
			</TabsContent>
		</Tabs>
	)
}
