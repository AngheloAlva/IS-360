"use client"

import { useEffect, useState, Suspense, lazy } from "react"
import Link from "next/link"
import {
	CarIcon,
	InfoIcon,
	EarthIcon,
	FilesIcon,
	UsersIcon,
	WrenchIcon,
	DownloadIcon,
	BookTextIcon,
	PartyPopperIcon,
	FolderKanbanIcon,
	SquareActivityIcon,
} from "lucide-react"

import { DocumentCategory, StartupFolderStatus } from "@prisma/client"
import {
	useStartupFolder,
	type StartupFolder,
} from "@/project/startup-folder/hooks/use-startup-folder"
import {
	SAFETY_AND_HEALTH_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	ENVIRONMENT_STRUCTURE,
	EXTENDED_ENVIRONMENT_STRUCTURE,
	TECH_SPEC_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { CreateStartupFolder } from "../forms/CreateStartupFolder"
import { UpdateStartupFolder } from "../forms/UpdateStartupFolder"
import CompleteFolderDialog from "../dialogs/CompleteFolderDialog"
import VideoTutorials from "@/shared/components/VideoTutorials"
import RefreshButton from "@/shared/components/RefreshButton"
import ModuleHeader from "@/shared/components/ModuleHeader"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"

const StartupFolderDocuments = lazy(() => import("./StartupFolderDocuments"))
const StartupFolderTable = lazy(() => import("./StartupFolderTable"))
const VehicleFolder = lazy(() => import("./VehicleFolder"))
const WorkerFolder = lazy(() => import("./WorkerFolder"))
const BasicFolder = lazy(() => import("./BasicFolder"))

interface StartupFolderOverviewProps {
	userId: string
	companyId: string
	companyName?: string
	isOtcMember?: boolean
	hasPermission?: boolean
}

export default function StartupFolderOverview({
	userId,
	companyId,
	companyName,
	isOtcMember = false,
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

	const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null)
	const [selectedFolder, setSelectedFolder] = useState<StartupFolder | null>(
		startupFolders?.[0] || null
	)

	useEffect(() => {
		if (startupFolders) {
			setSelectedFolder(startupFolders[0])
		}
	}, [startupFolders])

	if (isLoadingFolders) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-28 w-full" />
				<div className="space-y-3">
					<Skeleton className="h-[36px] w-full" />
					<Skeleton className="h-[266px] w-full" />
				</div>
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
		<div className="w-full space-y-6">
			<ModuleHeader
				className="from-teal-600 to-cyan-700"
				title={companyName || "Carpeta de arranque"}
				backHref={isOtcMember ? "/admin/dashboard/carpetas-de-arranques" : undefined}
				description={
					isOtcMember
						? "Revisión de documentación de empresa contratista"
						: "En este módulo podrás gestionar la documentación de la empresa."
				}
			>
				<>
					<VideoTutorials
						className="text-teal-600"
						videos={
							isOtcMember
								? [
										{
											title: "Carpeta de Arranque Basica",
											description:
												"Tutorial de como revisar la documentación basica de la empresa contratista.",
											url: "https://youtube.com/embed/GrsgcxZuqUc",
										},
										{
											title: "Carpeta de Arranque Full",
											description:
												"Tutorial de como revisar la documentación completa de la empresa contratista.",
											url: "https://youtube.com/embed/qUXU_MNd2Q0",
										},
									]
								: selectedFolder?.type === "FULL"
									? [
											{
												title: "Carga de documentos",
												description: "Tutorial de como agregar documentos en la carpeta basica.",
												url: "https://youtube.com/embed/Ph2iFqBEmc4",
											},
											{
												title: "Agregar Colaborador",
												description: "Tutorial de como agregar un colaborador correctamente.",
												url: "https://youtube.com/embed/HQlXE2gNZDo",
											},
											{
												title: "Agregar Vehículo",
												description: "Tutorial de como agregar un vehiculo correctamente.",
												url: "https://youtube.com/embed/ngYgt8-RQ9k",
											},
										]
									: [
											{
												title: "Carga de documentos Basicos",
												description: "Tutorial de como agregar documentos en la carpeta basica.",
												url: "https://youtube.com/embed/Z5Ha0mmPVII",
											},
											{
												title: "Agregar Colaborador",
												description: "Tutorial de como agregar un colaborador correctamente.",
												url: "https://youtube.com/embed/j_UqQYTPpik",
											},
										]
						}
					/>

					{isOtcMember && hasPermission && <CreateStartupFolder companyId={companyId} />}

					<Link
						href={
							selectedFolder?.type === "FULL"
								? "/carpeta-de-arranque-otc.pdf"
								: "/carpeta-basica-otc.pdf"
						}
						target="_blank"
					>
						<Button className="gap-0 bg-white text-teal-600 transition-all hover:scale-105 hover:bg-white hover:text-teal-600">
							<DownloadIcon className="mr-2 h-4 w-4" />
							Documento base
						</Button>
					</Link>
				</>
			</ModuleHeader>

			{startupFolders && startupFolders.length > 0 ? (
				<>
					<Suspense fallback={<Skeleton className="h-96 w-full" />}>
						<Tabs defaultValue={startupFolders?.[0]?.id}>
							<div className="flex w-full items-center justify-end gap-2">
								{startupFolders && startupFolders.length > 1 && (
									<TabsList className="w-full" onClick={() => setSelectedCategory(null)}>
										{startupFolders.map((folder) => (
											<TabsTrigger value={folder.id} key={folder.id} className="p-0">
												<div
													onClick={() => {
														setSelectedFolder(folder)
													}}
													className="flex h-full w-full items-center justify-center"
												>
													{folder.name}
												</div>
											</TabsTrigger>
										))}
									</TabsList>
								)}

								<RefreshButton refetch={refetch} isFetching={isFetching} size="lg" />
							</div>

							{startupFolders && startupFolders.length > 0 ? (
								<TabsContents>
									{startupFolders.map((folder) => (
										<TabsContent key={folder.id} value={folder.id} className="space-y-2">
											<div className="bg-background flex items-center justify-between rounded-lg px-4 py-1">
												<h2 className="flex items-center gap-2 text-lg font-bold">
													<FolderKanbanIcon className="size-5" />
													{folder.name}
												</h2>

												{isOtcMember && hasPermission && (
													<UpdateStartupFolder
														type={folder.type}
														name={folder.name}
														companyId={companyId}
														startupFolderId={folder.id}
													/>
												)}
											</div>

											<div className="bg-background space-y-6 rounded-lg p-4">
												{selectedCategory ? (
													selectedCategory === DocumentCategory.PERSONNEL ? (
														<WorkerFolder
															userId={userId}
															companyId={companyId}
															isOtcMember={isOtcMember}
															startupFolderId={folder.id}
															onBack={() => setSelectedCategory(null)}
														/>
													) : selectedCategory === DocumentCategory.VEHICLES ? (
														<VehicleFolder
															userId={userId}
															companyId={companyId}
															isOtcMember={isOtcMember}
															startupFolderId={folder.id}
															onBack={() => setSelectedCategory(null)}
														/>
													) : (
														<StartupFolderDocuments
															userId={userId}
															companyId={companyId}
															isOtcMember={isOtcMember}
															category={selectedCategory}
															startupFolderId={folder.id}
															onBack={() => setSelectedCategory(null)}
															moreMonthDuration={folder.moreMonthDuration}
														/>
													)
												) : (
													<>
														{folder.type === "BASIC" ? (
															<BasicFolder
																userId={userId}
																companyId={companyId}
																isOtcMember={isOtcMember}
																startupFolderId={folder.id}
															/>
														) : (
															<StartupFolderTable
																subFolders={folder}
																startupFolderType={folder.type}
																onCategorySelect={setSelectedCategory}
																moreMonthDuration={selectedFolder?.moreMonthDuration || false}
															/>
														)}
													</>
												)}
											</div>
										</TabsContent>
									))}
								</TabsContents>
							) : (
								<div className="col-span-full flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
									<FilesIcon className="text-muted-foreground h-8 w-4" />
									<div>
										<p className="text-lg font-medium">No hay carpeta de arranque</p>
										<p className="text-muted-foreground text-sm">
											Su empresa aún no tiene una carpeta de arranque. Por favor contacte con
											soporte.
										</p>
									</div>
								</div>
							)}
						</Tabs>
					</Suspense>

					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Progreso de la carpeta</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2">
									{selectedFolder?.type === "BASIC" && (
										<li className="flex items-center justify-between">
											<div className="flex items-center gap-2 font-semibold">
												<div className="rounded-full bg-teal-500/20 p-1">
													<BookTextIcon className="size-5 text-teal-500" />
												</div>
												Documentación básica:{" "}
											</div>
											{selectedFolder.basicFolder.length > 0
												? selectedFolder.basicFolder.reduce((acc, wf) => {
														const approvedDocs = wf.isCompleted

														return acc + (approvedDocs ? 1 : 0)
													}, 0)
												: "0"}
											/ {selectedFolder.basicFolder.length} completados
										</li>
									)}

									{selectedFolder?.type === "FULL" && (
										<>
											<li className="flex items-center justify-between">
												<div className="flex items-center gap-2 font-semibold">
													<div className="rounded-full bg-teal-500/20 p-1">
														<SquareActivityIcon className="size-5 text-teal-500" />
													</div>
													Seguridad y Salud Ocupacional:{" "}
												</div>
												{(
													(selectedFolder?.safetyAndHealthFolders[0]?.documentCounts?.approved /
														SAFETY_AND_HEALTH_STRUCTURE.documents.length) *
													100
												).toFixed(0)}
												% completado
											</li>

											{selectedFolder.environmentalFolders.length > 0 ? (
												<li className="flex items-center justify-between">
													<div className="flex items-center gap-2 font-semibold">
														<div className="rounded-full bg-sky-500/20 p-1">
															<EarthIcon className="size-5 text-sky-500" />
														</div>
														Medio Ambiente:{" "}
													</div>
													{(
														(selectedFolder?.environmentalFolders[0]?.documentCounts?.approved /
															ENVIRONMENTAL_STRUCTURE.documents.length) *
														100
													).toFixed(0)}
													% completado
												</li>
											) : (
												<li className="flex items-center justify-between">
													<div className="flex items-center gap-2 font-semibold">
														<div className="rounded-full bg-sky-500/20 p-1">
															<EarthIcon className="size-5 text-sky-500" />
														</div>
														Medio Ambiente:{" "}
													</div>
													{(
														(Number(
															selectedFolder?.environmentFolders[0]?.documentCounts?.approved ||
																selectedFolder?.environmentFolders[0]?.approvedDocuments ||
																0
														) /
															(selectedFolder?.moreMonthDuration
																? EXTENDED_ENVIRONMENT_STRUCTURE.documents.length
																: ENVIRONMENT_STRUCTURE.documents.length)) *
														100
													).toFixed(0)}
													% completado
												</li>
											)}

											{selectedFolder.techSpecsFolders.length > 0 && (
												<li className="flex items-center justify-between">
													<div className="flex items-center gap-2 font-semibold">
														<div className="rounded-full bg-blue-500/20 p-1">
															<WrenchIcon className="size-5 text-blue-500" />
														</div>
														Especificaciones Técnicas:{" "}
													</div>
													{(
														(Number(
															selectedFolder?.techSpecsFolders[0]?.documentCounts?.approved ||
																selectedFolder?.techSpecsFolders[0]?.approvedDocuments ||
																0
														) /
															TECH_SPEC_STRUCTURE.documents.length) *
														100
													).toFixed(0)}
													% completado
												</li>
											)}

											<li className="flex items-center justify-between">
												<div className="flex items-center gap-2 font-semibold">
													<div className="rounded-full bg-emerald-500/20 p-1">
														<UsersIcon className="size-5 text-emerald-500" />
													</div>
													Trabajadores:{" "}
												</div>
												{selectedFolder.workersFolders.length > 0
													? selectedFolder.workersFolders.reduce((acc, wf) => {
															const approvedDocs = wf.isCompleted

															return acc + (approvedDocs ? 1 : 0)
														}, 0)
													: "0"}
												/ {selectedFolder.workersFolders.length} completados
											</li>

											<li className="flex items-center justify-between">
												<div className="flex items-center gap-2 font-semibold">
													<div className="rounded-full bg-cyan-500/20 p-1">
														<CarIcon className="size-5 text-cyan-500" />
													</div>
													Vehículos:{" "}
												</div>
												{selectedFolder.vehiclesFolders.length > 0
													? selectedFolder.vehiclesFolders.reduce((acc, wf) => {
															const approvedDocs = wf.isCompleted

															return acc + (approvedDocs ? 1 : 0)
														}, 0)
													: "0"}
												/ {selectedFolder.vehiclesFolders.length} completados
											</li>
										</>
									)}
								</ul>
							</CardContent>
						</Card>

						{selectedFolder?.basicFolder &&
							selectedFolder?.basicFolder?.length > 0 &&
							selectedFolder?.type === "BASIC" &&
							selectedFolder.basicFolder.every((wf) => wf.isCompleted) && (
								<Card className="gap-3">
									<CardHeader>
										<CardTitle className="flex items-center justify-between gap-2 text-lg">
											{!isOtcMember
												? "¡Felicidades! Carpeta completada"
												: "Carpeta de arranque completada"}

											<div className="rounded-lg bg-teal-500/20 p-2">
												<PartyPopperIcon className="size-7 text-teal-500" />
											</div>
										</CardTitle>
									</CardHeader>

									<CardContent>
										<div>
											{!isOtcMember ? (
												"Su carpeta de arranque ha sido completada exitosamente. Ahora puedes iniciar con los trabajos respectivos."
											) : (
												<div className="flex flex-wrap items-center justify-between gap-4">
													{selectedFolder.status === StartupFolderStatus.COMPLETED ? (
														<p className="w-fit">
															Carpeta aprobada. El contratista ya puede iniciar con los trabajos
															respectivos.
														</p>
													) : (
														<>
															<p className="w-fit">
																La carpeta esta lista para ser aprobada. Al aprobar la carpeta se
																notificara a la empresa que esta lista para iniciar con los trabajos
																respectivos.
															</p>

															{isOtcMember && hasPermission && (
																<CompleteFolderDialog
																	folderId={selectedFolder.id}
																	onSuccess={() => refetch()}
																/>
															)}
														</>
													)}
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)}

						{selectedFolder?.type === "FULL" &&
							selectedFolder.workersFolders.every((wf) => wf.isCompleted) &&
							selectedFolder.vehiclesFolders.every((vf) => vf.isCompleted) &&
							(selectedFolder.environmentalFolders[0]?.isCompleted ||
								selectedFolder.environmentFolders[0]?.isCompleted) &&
							selectedFolder.safetyAndHealthFolders[0]?.isCompleted && (
								<Card>
									<CardHeader>
										<CardTitle>
											{!isOtcMember
												? "¡Felicidades! Carpeta completada"
												: "Carpeta de arranque completada"}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div>
											{!isOtcMember ? (
												"Su carpeta de arranque ha sido completada exitosamente. Ahora puedes iniciar con los trabajos respectivos"
											) : (
												<div className="flex flex-wrap items-center justify-between gap-4">
													{selectedFolder.status === StartupFolderStatus.COMPLETED ? (
														<p className="w-fit">
															Carpeta aprobada. El contratista ya puede iniciar con los trabajos
															respectivos.
														</p>
													) : (
														<>
															<p className="w-fit">
																La carpeta esta lista para ser aprobada. Al aprobar la carpeta se
																notificara a la empresa que esta lista para iniciar con los trabajos
																respectivos.
															</p>

															{isOtcMember && hasPermission && (
																<CompleteFolderDialog
																	folderId={selectedFolder.id}
																	onSuccess={() => refetch()}
																/>
															)}
														</>
													)}
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)}
					</div>
				</>
			) : (
				<div className="bg-background col-span-full flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
					<InfoIcon className="text-muted-foreground size-8" />
					<div>
						<p className="text-lg font-medium">No hay carpeta de arranque</p>
						<p className="text-muted-foreground text-sm">
							Su empresa aún no tiene una carpeta de arranque. Por favor contacte con soporte.
						</p>
					</div>
				</div>
			)}
		</div>
	)
}
