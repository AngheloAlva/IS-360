"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
	CarIcon,
	InfoIcon,
	EarthIcon,
	FilesIcon,
	UsersIcon,
	DownloadIcon,
	BookTextIcon,
	PartyPopperIcon,
	FolderKanbanIcon,
	SquareActivityIcon,
	WrenchIcon,
} from "lucide-react"

import { DocumentCategory, StartupFolderStatus } from "@prisma/client"
import {
	useStartupFolder,
	type StartupFolder,
} from "@/project/startup-folder/hooks/use-startup-folder"

import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { UpdateStartupFolder } from "../forms/UpdateStartupFolder"
import { CreateStartupFolder } from "../forms/CreateStartupFolder"
import CompleteFolderDialog from "../dialogs/CompleteFolderDialog"
import { StartupFolderDocuments } from "./StartupFolderDocuments"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { StartupFolderTable } from "./StartupFolderTable"
import BackButton from "@/shared/components/BackButton"
import { Button } from "@/shared/components/ui/button"

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
			<div className="rounded-lg bg-gradient-to-r from-teal-600 to-cyan-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<BackButton
							href="/admin/dashboard/carpetas-de-arranques"
							className="bg-white/20 text-white hover:bg-white/50 hover:text-white"
						/>

						<div className="text-white">
							<h1 className="text-2xl font-bold tracking-tight capitalize">
								{companyName || "Carpeta de arranque"}
							</h1>
							<p className="flex flex-col opacity-90">
								{isOtcMember
									? "Revisión de documentación de empresa contratista"
									: "En este módulo podrás gestionar la documentación de la empresa."}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{isOtcMember && hasPermission && <CreateStartupFolder companyId={companyId} />}

						<Link href={"/carpeta-de-arranque-otc.pdf"} target="_blank">
							<Button className="gap-0 bg-white text-teal-600 transition-all hover:scale-105 hover:bg-white hover:text-teal-600">
								<DownloadIcon className="mr-2 h-4 w-4" />
								Documento base
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{startupFolders && startupFolders.length > 0 ? (
				<>
					<Tabs defaultValue={startupFolders?.[0].id}>
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
									<TabsContent
										key={folder.id}
										value={folder.id}
										className="bg-background rounded-lg p-4"
									>
										<div className="space-y-6">
											{selectedCategory ? (
												<StartupFolderDocuments
													userId={userId}
													companyId={companyId}
													isOtcMember={isOtcMember}
													category={selectedCategory}
													startupFolderId={folder.id}
													onBack={() => setSelectedCategory(null)}
													moreMonthDuration={folder.moreMonthDuration}
												/>
											) : (
												<div className="space-y-4">
													<div className="flex items-center justify-between">
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

													{folder.type === "BASIC" ? (
														<StartupFolderDocuments
															userId={userId}
															onBack={() => {}}
															companyId={companyId}
															isOtcMember={isOtcMember}
															startupFolderId={folder.id}
															category={DocumentCategory.BASIC}
															moreMonthDuration={folder.moreMonthDuration}
														/>
													) : (
														<StartupFolderTable
															subFolders={folder}
															startupFolderType={folder.type}
															onCategorySelect={setSelectedCategory}
														/>
													)}
												</div>
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
										Su empresa aún no tiene una carpeta de arranque. Por favor contacte con soporte.
									</p>
								</div>
							</div>
						)}
					</Tabs>

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
											{selectedFolder.basicFolder.reduce(
												(acc, wf) => acc + (wf.isCompleted ? 1 : 0),
												0
											)}{" "}
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
													((selectedFolder?.safetyAndHealthFolders[0].approvedDocuments || 0) /
														(selectedFolder?.safetyAndHealthFolders[0].totalDocuments || 0)) *
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
														((selectedFolder?.environmentalFolders[0].approvedDocuments || 0) /
															(selectedFolder?.environmentalFolders[0].totalDocuments || 0)) *
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
														((selectedFolder?.environmentFolders[0].approvedDocuments || 0) /
															(selectedFolder?.environmentFolders[0].totalDocuments || 0)) *
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
														((selectedFolder?.techSpecsFolders[0].approvedDocuments || 0) /
															(selectedFolder?.techSpecsFolders[0].totalDocuments || 0)) *
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
												{selectedFolder.workersFolders.reduce(
													(acc, wf) => acc + (wf.isCompleted ? 1 : 0),
													0
												)}{" "}
												/ {selectedFolder.workersFolders.length} completados
											</li>

											<li className="flex items-center justify-between">
												<div className="flex items-center gap-2 font-semibold">
													<div className="rounded-full bg-cyan-500/20 p-1">
														<CarIcon className="size-5 text-cyan-500" />
													</div>
													Vehículos:{" "}
												</div>
												{selectedFolder.vehiclesFolders.reduce(
													(acc, vf) => acc + (vf.isCompleted ? 1 : 0),
													0
												)}{" "}
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
													<p className="w-fit">
														La carpeta esta lista para ser aprobada. Al aprovar la carpeta se
														notificara a la empresa que esta lista para iniciar con los trabajos
														respectivos.
													</p>

													{isOtcMember &&
														hasPermission &&
														selectedFolder.status !== StartupFolderStatus.COMPLETED && (
															<CompleteFolderDialog
																folderId={selectedFolder.id}
																onSuccess={() => refetch()}
															/>
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
							selectedFolder.safetyAndHealthFolders[0].isCompleted && (
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
													<p className="w-fit">
														La carpeta esta lista para ser aprobada. Al aprovar la carpeta se
														notificara a la empresa que esta lista para iniciar con los trabajos
														respectivos.
													</p>

													{isOtcMember &&
														hasPermission &&
														selectedFolder.status !== StartupFolderStatus.COMPLETED && (
															<CompleteFolderDialog
																folderId={selectedFolder.id}
																onSuccess={() => refetch()}
															/>
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
