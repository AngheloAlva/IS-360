"use client"

import {
	CarIcon,
	UserIcon,
	InfoIcon,
	UsersIcon,
	EarthIcon,
	WrenchIcon,
	BookTextIcon,
	CircleEqualIcon,
	PartyPopperIcon,
	ShieldCheckIcon,
	CircleDotDashedIcon,
} from "lucide-react"

import { getDocumentsByWorkerIsDriver } from "@/lib/consts/worker-folder-structure"
import { getBasicDocuments } from "@/lib/consts/basic-startup-folders-structure"
import { getVehicleDocuments } from "@/lib/consts/vehicle-folder-structure"
import { StartupFolderStatus } from "@/generated/prisma/enums"
import {
	TECH_SPEC_STRUCTURE,
	ENVIRONMENT_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
	EXTENDED_ENVIRONMENT_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import CompleteFolderDialog from "../dialogs/CompleteFolderDialog"
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/shared/components/ui/accordion"

import type { StartupFolder } from "../../hooks/use-startup-folder"
import { cn } from "@/lib/utils"

interface StartupFolderOverviewSummaryProps {
	folder: StartupFolder
	isOtcMember: boolean
	hasPermission: boolean
	isArchivedView?: boolean
	onRefetch: () => Promise<unknown>
}

const getPercent = (approved: number, total: number): number => {
	if (!total) return 0
	return Math.min((approved / total) * 100, 100)
}

export default function StartupFolderOverviewSummary({
	folder,
	isOtcMember,
	hasPermission,
	isArchivedView = false,
	onRefetch,
}: StartupFolderOverviewSummaryProps): React.ReactElement {
	const basicExpected = getBasicDocuments().documents.length
	const basicWorkersPercentages = folder.basicFolder.map((workerFolder) =>
		getPercent(workerFolder.documentCounts.approved, basicExpected)
	)
	const basicTotalPercent = basicWorkersPercentages.length
		? basicWorkersPercentages.reduce((acc, current) => acc + current, 0) /
			basicWorkersPercentages.length
		: 0

	const safetyPercent = getPercent(
		folder.safetyAndHealthFolders[0]?.documentCounts?.approved ?? 0,
		SAFETY_AND_HEALTH_STRUCTURE.documents.length
	)

	const environmentExpected =
		folder.environmentalFolders.length > 0
			? ENVIRONMENTAL_STRUCTURE.documents.length
			: folder.moreMonthDuration
				? EXTENDED_ENVIRONMENT_STRUCTURE.documents.length
				: ENVIRONMENT_STRUCTURE.documents.length

	const environmentApproved =
		folder.environmentalFolders[0]?.documentCounts?.approved ??
		folder.environmentFolders[0]?.documentCounts?.approved ??
		0

	const environmentPercent = getPercent(environmentApproved, environmentExpected)

	const techSpecsPercent = folder.techSpecsFolders.length
		? getPercent(
				folder.techSpecsFolders[0]?.documentCounts?.approved ?? 0,
				TECH_SPEC_STRUCTURE.documents.length
			)
		: 0

	const workersPercentages = folder.workersFolders.map((workerFolder) => {
		const expected = getDocumentsByWorkerIsDriver("PERSONNEL", workerFolder.isDriver).documents
			.length
		return getPercent(workerFolder.documentCounts.approved, expected)
	})

	const workersPercent = workersPercentages.length
		? workersPercentages.reduce((acc, current) => acc + current, 0) / workersPercentages.length
		: 0

	const vehiclesExpected = getVehicleDocuments().documents.length
	const vehiclesPercentages = folder.vehiclesFolders.map((vehicleFolder) =>
		getPercent(vehicleFolder.documentCounts.approved, vehiclesExpected)
	)
	const vehiclesPercent = vehiclesPercentages.length
		? vehiclesPercentages.reduce((acc, current) => acc + current, 0) / vehiclesPercentages.length
		: 0

	const totalComponents: number[] =
		folder.type === "BASIC"
			? [basicTotalPercent]
			: [
					safetyPercent,
					environmentPercent,
					...(folder.techSpecsFolders.length > 0 ? [techSpecsPercent] : []),
					...(folder.workersFolders.length > 0 ? [workersPercent] : []),
					...(folder.vehiclesFolders.length > 0 ? [vehiclesPercent] : []),
				]

	const totalPercent = totalComponents.length
		? totalComponents.reduce((acc, current) => acc + current, 0) / totalComponents.length
		: 0

	const isBasicCompleted =
		folder.type === "BASIC" &&
		folder.basicFolder.length > 0 &&
		folder.basicFolder.every((basicFolder) => basicFolder.isCompleted)

	const isFullCompleted =
		folder.type === "FULL" &&
		folder.workersFolders.every((workerFolder) => workerFolder.isCompleted) &&
		folder.vehiclesFolders.every((vehicleFolder) => vehicleFolder.isCompleted) &&
		(folder.environmentalFolders[0]?.isCompleted || folder.environmentFolders[0]?.isCompleted) &&
		folder.safetyAndHealthFolders[0]?.isCompleted &&
		(folder.techSpecsFolders.length === 0 || folder.techSpecsFolders[0]?.isCompleted)

	const canComplete =
		isOtcMember &&
		hasPermission &&
		!isArchivedView &&
		folder.status !== StartupFolderStatus.COMPLETED &&
		(isBasicCompleted || isFullCompleted)

	const cardToneClass = isArchivedView
		? "border-amber-300/60 bg-amber-50/20 dark:border-amber-700/60 dark:bg-amber-950/20"
		: ""

	return (
		<div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
			<Card className={cn(cardToneClass, "gap-2")}>
				<CardHeader>
					<CardTitle className="flex items-center justify-between gap-2">
						Progreso de la carpeta
						<div className="rounded-lg bg-blue-500/20 p-1">
							<CircleDotDashedIcon className="size-5 text-blue-500" />
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent className="">
					{folder.type === "BASIC" ? (
						<>
							<div className="flex items-center justify-between py-4">
								<div className="flex items-center gap-2 font-semibold">
									<BookTextIcon className="size-4 text-emerald-500" />
									Documentacion basica
								</div>
								<span className="font-semibold">{basicTotalPercent.toFixed(0)}% completado</span>
							</div>
							{folder.basicFolder.map((basicFolder, index) => (
								<div
									key={basicFolder.id}
									className="text-muted-foreground flex items-center justify-between text-sm"
								>
									<div className="flex items-center gap-1 font-semibold">
										<UserIcon className="size-3.5 text-emerald-600" />
										{basicFolder.worker?.name}
									</div>
									<span>{basicWorkersPercentages[index]?.toFixed(0)}%</span>
								</div>
							))}
						</>
					) : (
						<>
							<div className="flex items-center justify-between py-2">
								<div className="flex items-center gap-2 font-semibold">
									<ShieldCheckIcon className="size-4 text-teal-500" />
									Seguridad y Salud Ocupacional
								</div>
								<span className="font-semibold">{safetyPercent.toFixed(0)}% completado</span>
							</div>

							<div className="flex items-center justify-between py-2">
								<div className="flex items-center gap-2 font-semibold">
									<EarthIcon className="size-4 text-sky-500" />
									Medio Ambiente
								</div>
								<span className="font-semibold">{environmentPercent.toFixed(0)}% completado</span>
							</div>

							{folder.techSpecsFolders.length > 0 && (
								<div className="flex items-center justify-between py-2">
									<div className="flex items-center gap-2 font-semibold">
										<WrenchIcon className="size-4 text-blue-500" />
										Especificaciones Tecnicas
									</div>
									<span className="font-semibold">{techSpecsPercent.toFixed(0)}% completado</span>
								</div>
							)}

							<Accordion type="multiple" className="w-full">
								<AccordionItem value="workers">
									<AccordionTrigger className="py-3">
										<div className="flex items-center gap-2 font-semibold">
											<UsersIcon className="size-4 text-emerald-500" />
											Trabajadores ({workersPercent.toFixed(0)}%)
										</div>
									</AccordionTrigger>
									<AccordionContent className="space-y-1 pl-2">
										{folder.workersFolders.map((workerFolder, index) => (
											<div
												key={workerFolder.id}
												className="text-muted-foreground flex items-center justify-between text-sm"
											>
												<div className="flex items-center gap-1">
													<UserIcon className="size-3.5 text-emerald-600" />
													{workerFolder.worker?.name}
												</div>
												<span>{workersPercentages[index]?.toFixed(0)}%</span>
											</div>
										))}
									</AccordionContent>
								</AccordionItem>

								{folder.vehiclesFolders.length > 0 && (
									<AccordionItem value="vehicles">
										<AccordionTrigger className="py-2">
											<div className="flex items-center gap-2 font-semibold">
												<CarIcon className="size-4 text-emerald-500" />
												Vehiculos ({vehiclesPercent.toFixed(0)}%)
											</div>
										</AccordionTrigger>
										<AccordionContent className="space-y-1 pl-2">
											{folder.vehiclesFolders.map((vehicleFolder, index) => (
												<div
													key={vehicleFolder.id}
													className="text-muted-foreground flex items-center justify-between text-sm"
												>
													<div className="flex items-center gap-1 font-semibold">
														<CarIcon className="size-3.5 text-emerald-600" />
														{vehicleFolder.vehicle?.plate}
													</div>
													<span>{vehiclesPercentages[index]?.toFixed(0)}%</span>
												</div>
											))}
										</AccordionContent>
									</AccordionItem>
								)}
							</Accordion>
						</>
					)}

					<div className="flex items-center justify-between pt-5 font-bold">
						<div className="flex items-center gap-2">
							<CircleEqualIcon className="size-4 text-purple-500" />
							Progreso Total
						</div>
						<span>{totalPercent.toFixed(0)}% completado</span>
					</div>
				</CardContent>
			</Card>

			<Card className={cn("h-fit gap-2", cardToneClass)}>
				<CardHeader>
					<CardTitle className="flex items-center justify-between gap-2">
						Como se calcula el progreso
						<div className="rounded-lg bg-amber-500/20 p-1">
							<InfoIcon className="size-5 text-amber-500" />
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<ol className="list-decimal space-y-2 pl-5 text-sm">
						<li>
							Cada porcentaje de seccion usa la formula:{" "}
							<strong>(Aprobados + No Aplica) / Requeridos</strong>.
						</li>
						<li>
							Trabajadores y Vehiculos se calculan por entidad y luego se promedian dentro del
							bloque.
						</li>
						<li>
							El progreso total es el promedio simple de los bloques habilitados para esa carpeta.
						</li>
						<li>Una vez el progreso llega al 100% se puede completar la carpeta.</li>
					</ol>

					{(isBasicCompleted || isFullCompleted) && (
						<div className="rounded-lg border p-3">
							<div className="mb-2 flex items-center gap-2 font-semibold">
								<PartyPopperIcon className="size-4 text-teal-500" />
								{folder.status === StartupFolderStatus.COMPLETED
									? "Carpeta completada"
									: "Carpeta lista para completar"}
							</div>
							{folder.status === StartupFolderStatus.COMPLETED ? (
								<p className="text-sm">La carpeta ya fue completada y notificada al contratista.</p>
							) : canComplete ? (
								<div className="flex flex-wrap items-center justify-between gap-2">
									<p className="text-sm">
										Puedes marcar la carpeta como completada para notificar a la empresa.
									</p>
									<CompleteFolderDialog
										folderId={folder.id}
										onSuccess={() => {
											void onRefetch()
										}}
									/>
								</div>
							) : (
								<p className="text-sm">
									La carpeta esta lista, pero solo un admin OTC con permisos puede completarla.
								</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
