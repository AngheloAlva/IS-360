"use client"

import { Files, Building2 } from "lucide-react"

import { useStartupFolder } from "@/hooks/startup-folders/use-startup-folder"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import SafetyAndHealthDocuments from "./documents/SafetyAndHealthDocuments"
import EnvironmentalDocuments from "./documents/EnvironmentalDocuments"
import VehicleDocuments from "./documents/VehicleDocuments"
import WorkerDocuments from "./documents/WorkerDocuments"
import { Accordion } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"

interface StartupFolderOverviewProps {
	userId: string
	companyId: string
	isOtcMember?: boolean
}

export default function StartupFolderOverview({
	userId,
	companyId,
	isOtcMember,
}: StartupFolderOverviewProps): React.ReactElement {
	const {
		data: startupFolder,
		isLoading: isLoadingFolders,
		error,
	} = useStartupFolder({
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

	return (
		<div className="w-full space-y-4">
			<div>
				<div className="space-y-6">
					<div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
						<div>
							<div className="flex items-center gap-2">
								<Building2 className="text-muted-foreground h-5 w-5" />
								<h2 className="text-2xl font-semibold tracking-tight">Carpeta de Arranque</h2>
							</div>
							<p className="text-muted-foreground mt-1">
								Esta carpeta contiene la documentación requerida de tu empresa
							</p>
						</div>

						<div className="flex flex-col items-end gap-2">
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
					</div>

					{startupFolder ? (
						<div className="space-y-6">
							<Accordion type="multiple">
								<SafetyAndHealthDocuments
									userId={userId}
									companyId={companyId}
									isOtcMember={isOtcMember ?? false}
									folder={startupFolder.safetyAndHealthFolders[0]}
								/>

								<EnvironmentalDocuments
									userId={userId}
									companyId={companyId}
									isOtcMember={isOtcMember ?? false}
									folder={startupFolder.environmentalFolders[0]}
								/>

								{startupFolder.vehiclesFolders.length > 0 && (
									<VehicleDocuments
										userId={userId}
										companyId={companyId}
										isOtcMember={isOtcMember ?? false}
										startupFolderId={startupFolder.id}
										folders={startupFolder.vehiclesFolders}
									/>
								)}

								<WorkerDocuments
									userId={userId}
									companyId={companyId}
									isOtcMember={isOtcMember ?? false}
									startupFolderId={startupFolder.id}
									folders={startupFolder.workersFolders}
								/>
							</Accordion>
						</div>
					) : (
						<div className="col-span-full flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
							<Files className="text-muted-foreground h-8 w-8" />
							<div>
								<p className="text-lg font-medium">No hay carpeta de arranque</p>
								<p className="text-muted-foreground text-sm">
									Su empresa aún no tiene una carpeta de arranque. Por favor contacte con soporte.
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
