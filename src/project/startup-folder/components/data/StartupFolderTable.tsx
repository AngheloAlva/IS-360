"use client"

import { MoreHorizontal, ChevronRight, FolderIcon } from "lucide-react"

import { DocumentCategory } from "@prisma/client"
import { cn } from "@/lib/utils"

import { Button } from "@/shared/components/ui/button"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuContent,
} from "@/shared/components/ui/dropdown-menu"

import type { StartupFolder } from "../../hooks/use-startup-folder"
import { useMemo } from "react"

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
				documentsCount: subFolders.safetyAndHealthFolders[0].totalDocuments,
				completedCount: subFolders.safetyAndHealthFolders[0].approvedDocuments,
				rejectedCount: subFolders.safetyAndHealthFolders[0].rejectedDocuments,
			},
			{
				title: "Medio Ambiente",
				category: DocumentCategory.ENVIRONMENTAL,
				description: "Documentación relacionada con gestión ambiental y manejo de residuos.",
				documentsCount: subFolders.environmentalFolders[0].totalDocuments,
				completedCount: subFolders.environmentalFolders[0].approvedDocuments,
				rejectedCount: subFolders.environmentalFolders[0].rejectedDocuments,
			},
			{
				title: "Vehículos y Equipos",
				category: DocumentCategory.VEHICLES,
				description:
					"Documentación requerida para vehículos y equipos utilizados en trabajos de OTC.",
				documentsCount: subFolders.vehiclesFolders[0].totalDocuments,
				completedCount: subFolders.vehiclesFolders[0].approvedDocuments,
				rejectedCount: subFolders.vehiclesFolders[0].rejectedDocuments,
			},
			{
				title: "Documentación Personal",
				category: DocumentCategory.PERSONNEL,
				description:
					"Documentación de trabajadores, incluyendo capacitaciones, certificados y autorizaciones.",
				documentsCount: subFolders.workersFolders[0].totalDocuments,
				completedCount: subFolders.workersFolders[0].approvedDocuments,
				rejectedCount: subFolders.workersFolders[0].rejectedDocuments,
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
					<TableHead className="w-[100px] text-right">Total</TableHead>
					<TableHead className="w-[70px]"></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{categories.map((category) => (
					<TableRow
						key={category.category}
						className="hover:bg-muted/50 cursor-pointer transition-colors"
						onClick={() => onCategorySelect(category.category)}
					>
						<TableCell className="font-semibold">
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
							<span className="rounded-lg bg-gray-500/10 px-2 py-1 text-xs font-medium">
								{category.documentsCount}
							</span>
						</TableCell>
						<TableCell>
							<div className="flex justify-end">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className="h-8 w-8 p-0">
											<span className="sr-only">Abrir menú</span>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											className="cursor-pointer"
											onClick={(e) => {
												e.stopPropagation()
												onCategorySelect(category.category)
											}}
										>
											<ChevronRight className="mr-2 h-4 w-4" />
											Ver documentos
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
