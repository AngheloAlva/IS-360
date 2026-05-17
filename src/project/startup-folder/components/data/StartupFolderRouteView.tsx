"use client"

import { useEffect, useMemo, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ArchiveIcon, Loader2Icon } from "lucide-react"

import { getVehicleDocuments } from "@/lib/consts/vehicle-folder-structure"
import { DocumentCategory } from "@/generated/prisma/enums"
import {
	useStartupFolder,
	useArchivedFoldersCount,
} from "@/project/startup-folder/hooks/use-startup-folder"

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { ArchiveStartupFolderDialog } from "../dialogs/ArchiveStartupFolderDialog"
import DeleteStartupFolderDialog from "../dialogs/DeleteStartupFolderDialog"
import StartupFolderOverviewSummary from "./StartupFolderOverviewSummary"
import { CreateStartupFolder } from "../forms/CreateStartupFolder"
import { UpdateStartupFolder } from "../forms/UpdateStartupFolder"
import { GuideDocumentsDropdown } from "./GuideDocumentsDropdown"
import { VehicleFolderDocuments } from "./VehicleFolderDocuments"
import { WorkerFolderDocuments } from "./WorkerFolderDocuments"
import { BasicFolderDocuments } from "./BasicFolderDocuments"
import StartupFolderDocuments from "./StartupFolderDocuments"
import ModuleHeader from "@/shared/components/ModuleHeader"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import StartupFolderTable from "./StartupFolderTable"
import { Label } from "@/shared/components/ui/label"
import VehicleFolder from "./VehicleFolder"
import WorkerFolder from "./WorkerFolder"
import BasicFolder from "./BasicFolder"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/shared/components/ui/select"

type StartupFolderRouteViewMode =
	| "overview"
	| "environment"
	| "safety"
	| "techSpecs"
	| "workers"
	| "workerDocuments"
	| "vehicles"
	| "vehicleDocuments"

interface StartupFolderRouteViewProps {
	mode: StartupFolderRouteViewMode
	userId: string
	companyId: string
	companyPathParam?: string
	routeBasePath?: string
	folderPathPrefix?: string
	isArchivedView?: boolean
	backHref?: string
	startupFolderId: string
	workerId?: string
	vehicleId?: string
	isInternalMember?: boolean
	hasPermission?: boolean
}

// function getSuffixForFolderSwitch(
// 	pathname: string,
// 	routeBasePath: string,
// 	companyPathParam: string,
// 	folderPathPrefix: string
// ): string {
// 	const prefix = folderPathPrefix
// 		? `${routeBasePath}/${companyPathParam}/${folderPathPrefix}`
// 		: `${routeBasePath}/${companyPathParam}`
// 	const rest = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : ""
// 	const parts = rest.split("/").filter(Boolean)
// 	const suffix = parts.slice(1)

// 	console.log(suffix.length > 0 ? `/${suffix.join("/")}` : "")

// 	return suffix.length > 0 ? `/${suffix.join("/")}` : ""
// }

function categoryPath(category: DocumentCategory): string {
	switch (category) {
		case DocumentCategory.PERSONNEL:
			return "trabajadores"
		case DocumentCategory.VEHICLES:
			return "vehiculos"
		case DocumentCategory.SAFETY_AND_HEALTH:
			return "seguridad-salud"
		case DocumentCategory.TECHNICAL_SPECS:
			return "especificaciones-tecnicas"
		case DocumentCategory.ENVIRONMENT:
		case DocumentCategory.ENVIRONMENTAL:
			return "medio-ambiente"
		default:
			return ""
	}
}

export default function StartupFolderRouteView({
	mode,
	userId,
	companyId,
	backHref,
	routeBasePath = "/dashboard/carpetas-de-arranque",
	folderPathPrefix = "",
	isArchivedView = false,
	companyPathParam,
	startupFolderId,
	workerId,
	vehicleId,
	isInternalMember = false,
	hasPermission = false,
}: StartupFolderRouteViewProps) {
	const router = useRouter()
	const pathname = usePathname()
	const [isRoutePending, startRouteTransition] = useTransition()
	const {
		error,
		refetch,
		isFetching,
		isLoading,
		data: startupFolders,
	} = useStartupFolder({ companyId, showArchived: false, archivedOnly: isArchivedView })

	const { data: archivedCount = 0 } = useArchivedFoldersCount({ companyId })
	const hasArchivedFolders = archivedCount > 0

	const selectedFolder = useMemo(
		() =>
			startupFolders?.find((folder) => folder.id === startupFolderId) ??
			startupFolders?.[0] ??
			null,
		[startupFolderId, startupFolders]
	)

	const companyRouteSegment = companyPathParam ?? companyId

	const navigateTo = (href: string) => {
		startRouteTransition(() => {
			router.push(href)
		})
	}

	useEffect(() => {
		if (!selectedFolder || selectedFolder.id === startupFolderId) return

		// const suffix = getSuffixForFolderSwitch(
		// 	pathname,
		// 	routeBasePath,
		// 	companyRouteSegment,
		// 	folderPathPrefix
		// )
		const targetBase = folderPathPrefix
			? `${routeBasePath}/${companyRouteSegment}/${folderPathPrefix}`
			: `${routeBasePath}/${companyRouteSegment}`
		router.replace(`${targetBase}/${selectedFolder.id}`)
	}, [
		companyRouteSegment,
		folderPathPrefix,
		pathname,
		routeBasePath,
		router,
		selectedFolder,
		startupFolderId,
	])

	if (isLoading || (isFetching && !selectedFolder)) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-28 w-full" />
				<Skeleton className="h-96 w-full" />
			</div>
		)
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>Error al cargar las carpetas de arranque.</AlertDescription>
			</Alert>
		)
	}

	if (!selectedFolder) {
		return (
			<Alert>
				<AlertTitle>Sin carpetas</AlertTitle>
				<AlertDescription>Esta empresa no tiene carpetas de arranque disponibles.</AlertDescription>
			</Alert>
		)
	}

	const folderBasePath = folderPathPrefix
		? `${routeBasePath}/${companyRouteSegment}/${folderPathPrefix}/${selectedFolder.id}`
		: `${routeBasePath}/${companyRouteSegment}/${selectedFolder.id}`

	const sectionCategory =
		selectedFolder.environmentFolders.length > 0
			? DocumentCategory.ENVIRONMENT
			: DocumentCategory.ENVIRONMENTAL

	const workerName =
		selectedFolder.workersFolders.find(
			(folder) =>
				(folder as unknown as { workerId?: string }).workerId === workerId ||
				(folder as unknown as { worker?: { id?: string } }).worker?.id === workerId
		)?.worker?.name ??
		selectedFolder.basicFolder.find(
			(folder) =>
				(folder as unknown as { workerId?: string }).workerId === workerId ||
				(folder as unknown as { worker?: { id?: string } }).worker?.id === workerId
		)?.worker?.name ??
		workerId ??
		"Trabajador"

	const vehicleLabel =
		selectedFolder.vehiclesFolders.find(
			(folder) => (folder as unknown as { vehicleId?: string }).vehicleId === vehicleId
		)?.vehicle?.plate ??
		vehicleId ??
		"-"

	const locationLabel =
		mode === "workerDocuments"
			? `Trabajador: ${workerName}`
			: mode === "vehicleDocuments"
				? `Vehiculo: ${vehicleLabel}`
				: mode === "workers"
					? "Seccion: Trabajadores"
					: mode === "vehicles"
						? "Seccion: Vehiculos"
						: mode === "environment"
							? "Seccion: Medio Ambiente"
							: mode === "safety"
								? "Seccion: Seguridad y Salud"
								: mode === "techSpecs"
									? "Seccion: Especificaciones Tecnicas"
									: "Seccion: Resumen"

	const companyDisplayName = selectedFolder.company?.name ?? companyRouteSegment.split("_")[0]
	const headerTitle = `${companyDisplayName} - ${selectedFolder.name}`

	const { documents: vehicleDocuments } = getVehicleDocuments()

	const tutorialVideos = isInternalMember
		? [
				{
					title: "Carpeta de Arranque Basica",
					description:
						"Tutorial de como revisar la documentacion basica de la empresa contratista.",
					url: "https://youtube.com/embed/GrsgcxZuqUc",
				},
				{
					title: "Carpeta de Arranque Full",
					description:
						"Tutorial de como revisar la documentacion completa de la empresa contratista.",
					url: "https://youtube.com/embed/qUXU_MNd2Q0",
				},
			]
		: selectedFolder.type === "FULL"
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
						title: "Agregar Vehiculo",
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

	return (
		<div className="flex w-full flex-1 flex-col gap-4">
			<ModuleHeader
				backHref={backHref}
				title={headerTitle}
				description={"Administra las carpetas de arranque"}
				className="from-teal-600 to-cyan-700 dark:from-teal-700 dark:to-cyan-900"
				statusBadge={
					isArchivedView ? (
						<span className="rounded-full border border-amber-500/60 bg-amber-500/50 px-2 py-0.5 text-xs font-semibold tracking-wide text-amber-50">
							ARCHIVADA
						</span>
					) : undefined
				}
			>
				<div className="flex flex-wrap items-center gap-2">
					{(isRoutePending || isFetching) && (
						<div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs text-white">
							<Loader2Icon className="size-3 animate-spin" />
							Actualizando vista...
						</div>
					)}

					<GuideDocumentsDropdown
						hasPermission={hasPermission}
						folderType={selectedFolder.type}
						isAdmin={isInternalMember && hasPermission}
					/>
				</div>
			</ModuleHeader>

			<div className="flex items-center justify-between">
				<div className="space-y-1.5">
					<Label>Carpeta Seleccionada</Label>
					<Select
						value={selectedFolder.id}
						onValueChange={(nextFolderId) => {
							const targetBase = folderPathPrefix
								? `${routeBasePath}/${companyRouteSegment}/${folderPathPrefix}`
								: `${routeBasePath}/${companyRouteSegment}`
							navigateTo(`${targetBase}/${nextFolderId}`)
						}}
					>
						<SelectTrigger className="bg-background text-text dark:bg-background h-9! px-4 lg:min-w-sm">
							<SelectValue placeholder="Selecciona carpeta" />
						</SelectTrigger>
						<SelectContent>
							{startupFolders?.map((folder) => (
								<SelectItem key={folder.id} value={folder.id}>
									{folder.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="mt-5 flex items-center gap-2">
					{isInternalMember && hasPermission && mode === "overview" && (
						<>
							<UpdateStartupFolder
								type={selectedFolder.type}
								name={selectedFolder.name}
								companyId={companyId}
								startupFolderId={selectedFolder.id}
							/>
							<ArchiveStartupFolderDialog
								folderName={selectedFolder.name}
								isArchived={selectedFolder.isArchived}
								startupFolderId={selectedFolder.id}
							/>
							<DeleteStartupFolderDialog
								userId={userId}
								folderId={selectedFolder.id}
								folderName={selectedFolder.name}
								onSuccess={() => {
									void refetch()
								}}
							/>
						</>
					)}

					{isInternalMember && hasPermission && hasArchivedFolders && (
						<Button
							size={"lg"}
							variant={"outline"}
							className="bg-background border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white"
							onClick={() => {
								if (isArchivedView) {
									navigateTo(`${routeBasePath}/${companyRouteSegment}`)
									return
								}
								navigateTo(`${routeBasePath}/${companyRouteSegment}/archivadas`)
							}}
						>
							<ArchiveIcon className="mr-1 size-4" />
							{isArchivedView ? "Ver activas" : `Ver archivadas (${archivedCount})`}
						</Button>
					)}

					{isInternalMember && hasPermission && !isArchivedView && mode === "overview" && (
						<CreateStartupFolder companyId={companyId} />
					)}
				</div>
			</div>

			<div className="relative">
				{isRoutePending && (
					<div className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-xs">
						<div className="bg-background text-text inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
							<Loader2Icon className="size-4 animate-spin" />
							Cambiando carpeta...
						</div>
					</div>
				)}

				{mode === "overview" &&
					(selectedFolder.type === "BASIC" ? (
						<BasicFolder
							userId={userId}
							companyId={companyId}
							isInternalMember={isInternalMember}
							hasPermission={hasPermission}
							startupFolderId={selectedFolder.id}
							onSelectWorker={(id) => navigateTo(`${folderBasePath}/trabajadores/${id}`)}
						/>
					) : (
						<StartupFolderTable
							subFolders={selectedFolder}
							startupFolderType={selectedFolder.type}
							moreMonthDuration={selectedFolder.moreMonthDuration}
							onCategorySelect={(category) => {
								navigateTo(`${folderBasePath}/${categoryPath(category)}`)
							}}
						/>
					))}

				{mode === "environment" && (
					<StartupFolderDocuments
						userId={userId}
						companyId={companyId}
						isInternalMember={isInternalMember}
						hasPermission={hasPermission}
						startupFolderId={selectedFolder.id}
						category={sectionCategory}
						moreMonthDuration={selectedFolder.moreMonthDuration}
						onBack={() => navigateTo(folderBasePath)}
					/>
				)}

				{mode === "safety" && (
					<StartupFolderDocuments
						userId={userId}
						companyId={companyId}
						isInternalMember={isInternalMember}
						hasPermission={hasPermission}
						startupFolderId={selectedFolder.id}
						category={DocumentCategory.SAFETY_AND_HEALTH}
						moreMonthDuration={selectedFolder.moreMonthDuration}
						onBack={() => navigateTo(folderBasePath)}
					/>
				)}

				{mode === "techSpecs" && (
					<StartupFolderDocuments
						userId={userId}
						companyId={companyId}
						isInternalMember={isInternalMember}
						hasPermission={hasPermission}
						startupFolderId={selectedFolder.id}
						category={DocumentCategory.TECHNICAL_SPECS}
						moreMonthDuration={selectedFolder.moreMonthDuration}
						onBack={() => navigateTo(folderBasePath)}
					/>
				)}

				{mode === "workers" &&
					(selectedFolder.type === "BASIC" ? (
						<BasicFolder
							userId={userId}
							companyId={companyId}
							isInternalMember={isInternalMember}
							hasPermission={hasPermission}
							startupFolderId={selectedFolder.id}
							onSelectWorker={(id) => navigateTo(`${folderBasePath}/trabajadores/${id}`)}
						/>
					) : (
						<WorkerFolder
							userId={userId}
							companyId={companyId}
							isInternalMember={isInternalMember}
							hasPermission={hasPermission}
							startupFolderId={selectedFolder.id}
							onBack={() => navigateTo(folderBasePath)}
							onSelectWorker={(id) => navigateTo(`${folderBasePath}/trabajadores/${id}`)}
						/>
					))}

				{mode === "workerDocuments" &&
					workerId &&
					(selectedFolder.type === "BASIC" ? (
						<BasicFolderDocuments
							userId={userId}
							workerId={workerId}
							companyId={companyId}
							workerName={workerName}
							isInternalMember={isInternalMember}
							hasPermission={hasPermission}
							startupFolderId={selectedFolder.id}
							onBack={() => navigateTo(`${folderBasePath}/trabajadores`)}
						/>
					) : (
						<WorkerFolderDocuments
							userId={userId}
							workerId={workerId}
							companyId={companyId}
							workerName={workerName}
							isInternalMember={isInternalMember}
							hasPermission={hasPermission}
							startupFolderId={selectedFolder.id}
							onBack={() => navigateTo(`${folderBasePath}/trabajadores`)}
						/>
					))}

				{mode === "vehicles" && (
					<VehicleFolder
						userId={userId}
						companyId={companyId}
						isInternalMember={isInternalMember}
						hasPermission={hasPermission}
						startupFolderId={selectedFolder.id}
						onBack={() => navigateTo(folderBasePath)}
						onSelectVehicle={(id) => navigateTo(`${folderBasePath}/vehiculos/${id}`)}
					/>
				)}

				{mode === "vehicleDocuments" && vehicleId && (
					<VehicleFolderDocuments
						userId={userId}
						vehicleId={vehicleId}
						companyId={companyId}
						isInternalMember={isInternalMember}
						hasPermission={hasPermission}
						startupFolderId={selectedFolder.id}
						documents={vehicleDocuments}
						onBack={() => navigateTo(`${folderBasePath}/vehiculos`)}
					/>
				)}
			</div>

			{mode === "overview" && (
				<StartupFolderOverviewSummary
					folder={selectedFolder}
					isInternalMember={isInternalMember}
					hasPermission={hasPermission}
					isArchivedView={isArchivedView}
					onRefetch={refetch}
				/>
			)}
		</div>
	)
}
