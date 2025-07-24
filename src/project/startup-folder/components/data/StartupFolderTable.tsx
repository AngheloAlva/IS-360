"use client"

import { FolderIcon } from "lucide-react"
import { useMemo } from "react"

import { VEHICLE_STRUCTURE } from "@/lib/consts/vehicle-folder-structure"
import { DocumentCategory, StartupFolderType } from "@prisma/client"
import { cn } from "@/lib/utils"
import {
	TECH_SPEC_STRUCTURE,
	ENVIRONMENT_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"
import {
	BASE_WORKER_STRUCTURE,
	DRIVER_WORKER_STRUCTURE,
} from "@/lib/consts/worker-folder-structure"

import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

import type { StartupFolder } from "../../hooks/use-startup-folder"

interface StartupFolderTableProps {
	subFolders: StartupFolder
	startupFolderType: StartupFolderType
	onCategorySelect: (category: DocumentCategory) => void
}

export default function StartupFolderTable({
	onCategorySelect,
	subFolders,
}: StartupFolderTableProps) {
	interface CategoryItem {
		title: string
		category: DocumentCategory
		totalDocsToUpload: number
		description: string
		documentsCount: number
		completedCount: number
		rejectedCount: number
		pendingCount: number
		draftCount: number
	}

	const categories = useMemo<CategoryItem[]>(() => {
		const baseCategories: CategoryItem[] = [
			{
				title: "Seguridad y Salud Ocupacional",
				category: DocumentCategory.SAFETY_AND_HEALTH,
				description: "Documentación relacionada con seguridad y salud ocupacional.",
				totalDocsToUpload: SAFETY_AND_HEALTH_STRUCTURE.documents.length,
				documentsCount:
					subFolders.safetyAndHealthFolders[0]?.documentCounts?.total ??
					subFolders.safetyAndHealthFolders[0]?.totalDocuments ??
					0,
				completedCount:
					subFolders.safetyAndHealthFolders[0]?.documentCounts?.approved ??
					subFolders.safetyAndHealthFolders[0]?.approvedDocuments ??
					0,
				rejectedCount:
					subFolders.safetyAndHealthFolders[0]?.documentCounts?.rejected ??
					subFolders.safetyAndHealthFolders[0]?.rejectedDocuments ??
					0,
				pendingCount:
					subFolders.safetyAndHealthFolders[0]?.documentCounts?.submitted ??
					subFolders.safetyAndHealthFolders[0]?.submittedDocuments ??
					0,
				draftCount:
					subFolders.safetyAndHealthFolders[0]?.documentCounts?.draft ??
					subFolders.safetyAndHealthFolders[0]?.draftDocuments ??
					0,
			},
			{
				title: "Vehículos y Equipos",
				category: DocumentCategory.VEHICLES,
				description:
					"Documentación requerida para vehículos y equipos utilizados en trabajos de OTC.",
				totalDocsToUpload: subFolders.vehiclesFolders.length * VEHICLE_STRUCTURE.documents.length,
				documentsCount: subFolders.vehiclesFolders
					.map((vf) => vf.documentCounts?.total ?? vf.totalDocuments ?? 0)
					.reduce((a, b) => a + b, 0),
				completedCount: subFolders.vehiclesFolders
					.map((vf) => vf.documentCounts?.approved ?? vf.approvedDocuments ?? 0)
					.reduce((a, b) => a + b, 0),
				rejectedCount: subFolders.vehiclesFolders
					.map((vf) => vf.documentCounts?.rejected ?? vf.rejectedDocuments ?? 0)
					.reduce((a, b) => a + b, 0),
				pendingCount: subFolders.vehiclesFolders
					.map((vf) => vf.documentCounts?.submitted ?? vf.submittedDocuments ?? 0)
					.reduce((a, b) => a + b, 0),
				draftCount: subFolders.vehiclesFolders
					.map((vf) => vf.documentCounts?.draft ?? vf.draftDocuments ?? 0)
					.reduce((a, b) => a + b, 0),
			},
			{
				title: "Documentación Personal",
				category: DocumentCategory.PERSONNEL,
				description:
					"Documentación de trabajadores, incluyendo capacitaciones, certificados y más.",
				totalDocsToUpload: subFolders.workersFolders
					.map((wf) =>
						wf.isDriver
							? DRIVER_WORKER_STRUCTURE.documents.length
							: BASE_WORKER_STRUCTURE.documents.length
					)
					.reduce((a, b) => a + b, 0),
				documentsCount: subFolders.workersFolders
					.map((wf) => wf.documentCounts?.total ?? wf.totalDocuments ?? 0)
					.reduce((a, b) => a + b, 0),
				completedCount: subFolders.workersFolders
					.map((wf) => wf.documentCounts?.approved ?? wf.approvedDocuments ?? 0)
					.reduce((a, b) => a + b, 0),
				rejectedCount: subFolders.workersFolders
					.map((wf) => wf.documentCounts?.rejected ?? wf.rejectedDocuments ?? 0)
					.reduce((a, b) => a + b, 0),
				pendingCount: subFolders.workersFolders
					.map((wf) => wf.documentCounts?.submitted ?? wf.submittedDocuments ?? 0)
					.reduce((a, b) => a + b, 0),
				draftCount: subFolders.workersFolders
					.map((wf) => wf.documentCounts?.draft ?? wf.draftDocuments ?? 0)
					.reduce((a, b) => a + b, 0),
			},
		]

		if (subFolders.environmentalFolders.length > 0) {
			baseCategories.splice(1, 0, {
				title: "Medio Ambiente",
				category: DocumentCategory.ENVIRONMENTAL,
				description: "Documentación relacionada con gestión ambiental y manejo de residuos.",
				totalDocsToUpload: ENVIRONMENTAL_STRUCTURE.documents.length,
				documentsCount:
					subFolders.environmentalFolders[0]?.documentCounts?.total ??
					subFolders.environmentalFolders[0]?.totalDocuments ??
					0,
				completedCount:
					subFolders.environmentalFolders[0]?.documentCounts?.approved ??
					subFolders.environmentalFolders[0]?.approvedDocuments ??
					0,
				rejectedCount:
					subFolders.environmentalFolders[0]?.documentCounts?.rejected ??
					subFolders.environmentalFolders[0]?.rejectedDocuments ??
					0,
				pendingCount:
					subFolders.environmentalFolders[0]?.documentCounts?.submitted ??
					subFolders.environmentalFolders[0]?.submittedDocuments ??
					0,
				draftCount:
					subFolders.environmentalFolders[0]?.documentCounts?.draft ??
					subFolders.environmentalFolders[0]?.draftDocuments ??
					0,
			})
		}

		if (subFolders.environmentFolders.length > 0) {
			baseCategories.splice(1, 0, {
				title: "Medio Ambiente (nuevo)",
				category: DocumentCategory.ENVIRONMENT,
				description: "Documentación relacionada con gestión ambiental y manejo de residuos.",
				totalDocsToUpload: ENVIRONMENT_STRUCTURE.documents.length,
				documentsCount:
					subFolders.environmentFolders[0]?.documentCounts?.total ??
					subFolders.environmentFolders[0]?.totalDocuments ??
					0,
				completedCount:
					subFolders.environmentFolders[0]?.documentCounts?.approved ??
					subFolders.environmentFolders[0]?.approvedDocuments ??
					0,
				rejectedCount:
					subFolders.environmentFolders[0]?.documentCounts?.rejected ??
					subFolders.environmentFolders[0]?.rejectedDocuments ??
					0,
				pendingCount:
					subFolders.environmentFolders[0]?.documentCounts?.submitted ??
					subFolders.environmentFolders[0]?.submittedDocuments ??
					0,
				draftCount:
					subFolders.environmentFolders[0]?.documentCounts?.draft ??
					subFolders.environmentFolders[0]?.draftDocuments ??
					0,
			})
		}

		if (subFolders.techSpecsFolders.length > 0) {
			baseCategories.splice(2, 0, {
				title: "Especificaciones Técnicas",
				category: DocumentCategory.TECHNICAL_SPECS,
				description: "Documentación técnica.",
				totalDocsToUpload: TECH_SPEC_STRUCTURE.documents.length,
				documentsCount:
					subFolders.techSpecsFolders[0]?.documentCounts?.total ??
					subFolders.techSpecsFolders[0]?.totalDocuments ??
					0,
				completedCount:
					subFolders.techSpecsFolders[0]?.documentCounts?.approved ??
					subFolders.techSpecsFolders[0]?.approvedDocuments ??
					0,
				rejectedCount:
					subFolders.techSpecsFolders[0]?.documentCounts?.rejected ??
					subFolders.techSpecsFolders[0]?.rejectedDocuments ??
					0,
				pendingCount:
					subFolders.techSpecsFolders[0]?.documentCounts?.submitted ??
					subFolders.techSpecsFolders[0]?.submittedDocuments ??
					0,
				draftCount:
					subFolders.techSpecsFolders[0]?.documentCounts?.draft ??
					subFolders.techSpecsFolders[0]?.draftDocuments ??
					0,
			})
		}

		return baseCategories
	}, [subFolders])

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Categoría</TableHead>
					<TableHead>Descripción</TableHead>
					<TableHead>En borrador</TableHead>
					<TableHead>Completados</TableHead>
					<TableHead>Rechazados</TableHead>
					<TableHead>En revisión</TableHead>
					<TableHead>Total docs.</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{categories.map((category) => (
					<TableRow
						key={category.category}
						className="hover:bg-muted/50 h-12 cursor-pointer transition-colors"
						onClick={() => onCategorySelect(category.category)}
					>
						<TableCell className="my-2 font-semibold">
							<div
								className={cn("flex items-center gap-2", {
									"text-yellow-500": category.pendingCount > 0,
								})}
							>
								<FolderIcon
									className={cn("h-4 w-4 text-teal-500", {
										"text-yellow-500": category.pendingCount > 0,
									})}
								/>
								{category.title}
							</div>
						</TableCell>
						<TableCell>{category.description}</TableCell>
						<TableCell>
							<span className="rounded-lg bg-neutral-500/10 px-2 py-1 text-xs font-medium text-neutral-500">
								{category.draftCount} Docs.
							</span>
						</TableCell>
						<TableCell>
							<span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
								{category.completedCount} Docs.
							</span>
						</TableCell>
						<TableCell>
							<span
								className={cn(
									"rounded-lg bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500"
								)}
							>
								{category.rejectedCount} Docs.
							</span>
						</TableCell>
						<TableCell>
							<span className="rounded-lg bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
								{category.pendingCount} Docs.
							</span>
						</TableCell>
						<TableCell>
							<span className="rounded-lg bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-500">
								{category.totalDocsToUpload} Docs.
							</span>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
