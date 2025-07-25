"use client"

import { Wrench, Plus, Activity, AlertCircle } from "lucide-react"
import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ToolActivityForm } from "../forms/ToolActivityForm"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
} from "@/shared/components/ui/dialog"

import type { Tool, ToolActivity } from "../../types"

interface CompanyToolsTableProps {
	tools: Tool[]
	onActivityAdd: (activity: Omit<ToolActivity, "id" | "timestamp" | "createdBy">) => void
}

const getStatusBadge = (status: string) => {
	switch (status) {
		case "AVAILABLE":
			return <Badge className="bg-green-500/20 text-green-500">Disponible</Badge>
		case "IN_USE":
			return <Badge className="bg-orange-500/20 text-orange-500">En Uso</Badge>
		case "MAINTENANCE":
			return <Badge className="bg-yellow-500/20 text-yellow-500">Mantenimiento</Badge>
		case "OUT_OF_SERVICE":
			return <Badge className="bg-red-500/20 text-red-500">Fuera de Servicio</Badge>
		case "LOST":
			return <Badge className="bg-gray-500/20 text-gray-500">Perdida</Badge>
		default:
			return <Badge>{status}</Badge>
	}
}

const getCategoryLabel = (category: string) => {
	switch (category) {
		case "POWER_TOOLS":
			return "Herramientas Eléctricas"
		case "HAND_TOOLS":
			return "Herramientas Manuales"
		case "MEASURING":
			return "Instrumentos de Medición"
		case "SAFETY":
			return "Seguridad"
		case "CUTTING":
			return "Herramientas de Corte"
		case "WELDING":
			return "Soldadura"
		case "PNEUMATIC":
			return "Neumáticas"
		case "HYDRAULIC":
			return "Hidráulicas"
		default:
			return "Otras"
	}
}

export function CompanyToolsTable({ tools, onActivityAdd }: CompanyToolsTableProps) {
	const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const handleActivitySubmit = (activity: Omit<ToolActivity, "id" | "timestamp" | "createdBy">) => {
		onActivityAdd(activity)
		setIsDialogOpen(false)
		setSelectedTool(null)
	}

	return (
		<Card className="gap-4">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Wrench className="h-5 w-5" />
					Herramientas Registradas
				</CardTitle>
				<p className="text-muted-foreground text-sm">
					Lista completa de herramientas asignadas a esta empresa
				</p>
			</CardHeader>

			<CardContent>
				{tools.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<AlertCircle className="text-muted-foreground mb-4 h-12 w-12" />
						<h3 className="mb-2 text-lg font-medium">No hay herramientas registradas</h3>
						<p className="text-muted-foreground mb-4">
							Esta empresa aún no tiene herramientas asignadas en el sistema.
						</p>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Agregar Primera Herramienta
						</Button>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Herramienta</TableHead>
								<TableHead>Código</TableHead>
								<TableHead>Categoría</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead className="text-center">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{tools.map((tool) => (
								<TableRow key={tool.id}>
									<TableCell>
										<div>
											<p className="font-medium">{tool.name}</p>
											{tool.description && (
												<p className="text-muted-foreground text-sm">{tool.description}</p>
											)}
										</div>
									</TableCell>
									<TableCell>
										<code className="bg-muted rounded px-2 py-1 text-sm">{tool.code}</code>
									</TableCell>
									<TableCell>
										<span className="text-sm">{getCategoryLabel(tool.category)}</span>
									</TableCell>
									<TableCell>{getStatusBadge(tool.status)}</TableCell>
									<TableCell className="text-center">
										<Dialog
											open={isDialogOpen && selectedTool?.id === tool.id}
											onOpenChange={(open) => {
												setIsDialogOpen(open)
												if (!open) setSelectedTool(null)
											}}
										>
											<DialogTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setSelectedTool(tool)
														setIsDialogOpen(true)
													}}
												>
													<Activity className="mr-2 h-4 w-4" />
													Registrar Actividad
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Registrar Actividad - {tool.name}</DialogTitle>
												</DialogHeader>
												<ToolActivityForm
													tool={tool}
													onSubmit={handleActivitySubmit}
													onCancel={() => {
														setIsDialogOpen(false)
														setSelectedTool(null)
													}}
												/>
											</DialogContent>
										</Dialog>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	)
}
