"use client"

import { Files, DownloadIcon } from "lucide-react"
import Link from "next/link"

import { useStartupFolder } from "@/hooks/startup-folders/use-startup-folder"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import SafetyAndHealthDocuments from "./documents/SafetyAndHealthDocuments"
import EnvironmentalDocuments from "./documents/EnvironmentalDocuments"
import RefreshButton from "@/components/shared/RefreshButton"
import { CreateStartupFolder } from "./CreateStartupFolder"
import VehicleDocuments from "./documents/VehicleDocuments"
import WorkerDocuments from "./documents/WorkerDocuments"
import { Accordion } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface StartupFolderOverviewProps {
	userId: string
	companyId: string
	isOtcMember?: boolean
	hasPermission?: boolean
}

export default function StartupFolderOverview({
	userId,
	companyId,
	isOtcMember,
	hasPermission = false,
}: StartupFolderOverviewProps): React.ReactElement {
	const {
		error,
		refetch,
		isFetching,
		data: startupFolders,
		isLoading: isLoadingFolders,
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
					<div className="rounded-lg bg-gradient-to-r from-teal-600 to-cyan-700 p-6 shadow-lg">
						<div className="flex items-center justify-between">
							<div className="text-white">
								<h1 className="text-3xl font-bold tracking-tight">Carpetas de Arranque</h1>
								<p className="opacity-90">
									En este módulo podrás gestionar la documentación de la empresa. En el caso de que
									un documento no aplique a tu trabajo, deberas subir un documento indicando que no
									aplica.
								</p>
							</div>

							<div className="flex items-center gap-2">
								{hasPermission && <CreateStartupFolder companyId={companyId} />}

								<Link href={"/carpeta-de-arranque-otc.pdf"} target="_blank">
									<Button className="gap-0 bg-white text-teal-600 transition-all hover:scale-105 hover:bg-white hover:text-teal-600">
										<DownloadIcon className="mr-2 h-4 w-4" />
										Documento base
									</Button>
								</Link>
							</div>
						</div>
					</div>

					<Tabs defaultValue={startupFolders?.[0].id}>
						<div className="flex w-full items-center justify-end gap-2">
							{startupFolders && startupFolders.length > 1 && (
								<TabsList className="w-full">
									{startupFolders.map((folder) => (
										<TabsTrigger value={folder.id} key={folder.id}>
											{folder.name}
										</TabsTrigger>
									))}
								</TabsList>
							)}

							<RefreshButton refetch={refetch} isFetching={isFetching} />
						</div>

						{startupFolders && startupFolders.length > 0 ? (
							startupFolders.map((folder) => (
								<TabsContent value={folder.id} key={folder.id}>
									<div className="space-y-6">
										<Accordion type="multiple">
											<SafetyAndHealthDocuments
												userId={userId}
												companyId={companyId}
												isOtcMember={isOtcMember ?? false}
												folder={folder.safetyAndHealthFolders[0]}
											/>

											<EnvironmentalDocuments
												userId={userId}
												companyId={companyId}
												isOtcMember={isOtcMember ?? false}
												folder={folder.environmentalFolders[0]}
											/>

											{folder.vehiclesFolders.length > 0 && (
												<VehicleDocuments
													userId={userId}
													companyId={companyId}
													isOtcMember={isOtcMember ?? false}
													startupFolderId={folder.id}
													folders={folder.vehiclesFolders}
												/>
											)}

											<WorkerDocuments
												userId={userId}
												companyId={companyId}
												isOtcMember={isOtcMember ?? false}
												startupFolderId={folder.id}
												folders={folder.workersFolders}
											/>
										</Accordion>
									</div>
								</TabsContent>
							))
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
					</Tabs>
				</div>
			</div>
		</div>
	)
}
