"use client"

import { FolderIcon } from "lucide-react"
import { useMemo } from "react"

import { DocumentCategory } from "@prisma/client"
import { cn } from "@/lib/utils"

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
	onCategorySelect: (category: DocumentCategory) => void
}

export function StartupFolderTable({ onCategorySelect, subFolders }: StartupFolderTableProps) {
	const categories = useMemo(
		() => [
			{
				title: "Seguridad y Salud Ocupacional",
				category: DocumentCategory.SAFETY_AND_HEALTH,
				description: "Documentación relacionada con seguridad y salud ocupacional.",
				documentsCount: subFolders.safetyAndHealthFolders[0]?.totalDocuments ?? 0,
				completedCount: subFolders.safetyAndHealthFolders[0]?.approvedDocuments ?? 0,
				rejectedCount: subFolders.safetyAndHealthFolders[0]?.rejectedDocuments ?? 0,
				pendingCount: subFolders.safetyAndHealthFolders[0]?.submittedDocuments ?? 0,
			},
			{
				title: "Medio Ambiente",
				category: DocumentCategory.ENVIRONMENTAL,
				description: "Documentación relacionada con gestión ambiental y manejo de residuos.",
				documentsCount: subFolders.environmentalFolders[0]?.totalDocuments ?? 0,
				completedCount: subFolders.environmentalFolders[0]?.approvedDocuments ?? 0,
				rejectedCount: subFolders.environmentalFolders[0]?.rejectedDocuments ?? 0,
				pendingCount: subFolders.environmentalFolders[0]?.submittedDocuments ?? 0,
			},
			{
				title: "Vehículos y Equipos",
				category: DocumentCategory.VEHICLES,
				description:
					"Documentación requerida para vehículos y equipos utilizados en trabajos de OTC.",
				documentsCount: subFolders.vehiclesFolders[0]?.totalDocuments ?? 0,
				completedCount: subFolders.vehiclesFolders[0]?.approvedDocuments ?? 0,
				rejectedCount: subFolders.vehiclesFolders[0]?.rejectedDocuments ?? 0,
				pendingCount: subFolders.vehiclesFolders[0]?.submittedDocuments ?? 0,
			},
			{
				title: "Documentación Personal",
				category: DocumentCategory.PERSONNEL,
				description:
					"Documentación de trabajadores, incluyendo capacitaciones, certificados y autorizaciones.",
				documentsCount: subFolders.workersFolders[0]?.totalDocuments ?? 0,
				completedCount: subFolders.workersFolders[0]?.approvedDocuments ?? 0,
				rejectedCount: subFolders.workersFolders[0]?.rejectedDocuments ?? 0,
				pendingCount: subFolders.workersFolders[0]?.submittedDocuments ?? 0,
			},
		],
		[subFolders]
	)

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Categoría</TableHead>
					<TableHead>Descripción</TableHead>
					<TableHead className="w-[100px] text-right">Completados</TableHead>
					<TableHead className="w-[100px] text-right">Rechazados</TableHead>
					<TableHead className="w-[100px] text-right">En revisión</TableHead>
					<TableHead className="w-[100px] text-right">Total</TableHead>
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
							<div className="flex items-center gap-2">
								<FolderIcon className="h-4 w-4 text-teal-500" />
								{category.title}
							</div>
						</TableCell>
						<TableCell>{category.description}</TableCell>
						<TableCell className="text-right">
							<span className="rounded-lg bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
								{category.completedCount}
							</span>
						</TableCell>
						<TableCell className="text-right">
							<span
								className={cn(
									"rounded-lg bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500"
								)}
							>
								{category.rejectedCount}
							</span>
						</TableCell>
						<TableCell className="text-right">
							<span className="rounded-lg bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
								{category.pendingCount}
							</span>
						</TableCell>
						<TableCell className="text-right">
							<span className="rounded-lg bg-gray-500/10 px-2 py-1 text-xs font-medium">
								{category.documentsCount}
							</span>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
