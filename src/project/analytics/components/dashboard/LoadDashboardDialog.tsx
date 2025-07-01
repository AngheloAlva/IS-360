"use client"

import { useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { CalendarIcon, Info } from "lucide-react"
import { toast } from "sonner"

// Tipo de dashboard guardado (esto sería parte de tu modelo de datos real)
interface SavedDashboard {
	id: string
	name: string
	description?: string
	createdAt: Date
	updatedAt: Date
}

// Datos de ejemplo (en una aplicación real, esto vendría de una API)
const MOCK_DASHBOARDS: SavedDashboard[] = [
	{
		id: "1",
		name: "Dashboard de Contratistas",
		description: "Vista general de contratistas y sus órdenes de trabajo",
		createdAt: new Date(2025, 5, 25),
		updatedAt: new Date(2025, 5, 25),
	},
	{
		id: "2",
		name: "Análisis de Carpetas de Arranque",
		description: "Estado de documentación por empresa",
		createdAt: new Date(2025, 5, 20),
		updatedAt: new Date(2025, 5, 28),
	},
	{
		id: "3",
		name: "Rendimiento de Vehículos",
		createdAt: new Date(2025, 5, 15),
		updatedAt: new Date(2025, 5, 15),
	},
]

interface LoadDashboardDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function LoadDashboardDialog({ open, onOpenChange }: LoadDashboardDialogProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null)

	// En una implementación real, aquí usarías React Query o similar para cargar los dashboards
	const savedDashboards = MOCK_DASHBOARDS

	const handleLoadDashboard = async () => {
		if (!selectedDashboard) return

		try {
			setIsLoading(true)

			// En una implementación real, aquí se cargaría la configuración
			// const dashboardConfig = await loadDashboardConfiguration(selectedDashboard)

			// Simulación de carga
			await new Promise((resolve) => setTimeout(resolve, 1000))

			const dashboard = savedDashboards.find((d) => d.id === selectedDashboard)

			toast("Dashboard cargado", {
				description: `El dashboard "${dashboard?.name}" ha sido cargado exitosamente.`,
			})

			onOpenChange(false)
		} catch (error) {
			console.log(error)
			toast("Error al cargar", {
				description: "No se pudo cargar la configuración del dashboard.",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Cargar dashboard guardado</DialogTitle>
					<DialogDescription>
						Selecciona una configuración de dashboard previamente guardada.
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					{savedDashboards.length > 0 ? (
						<ScrollArea className="h-[300px] pr-4">
							<div className="space-y-2">
								{savedDashboards.map((dashboard) => (
									<div
										key={dashboard.id}
										className={`cursor-pointer rounded-lg p-3 transition-colors ${
											selectedDashboard === dashboard.id
												? "bg-primary/10 border-primary"
												: "hover:bg-muted"
										} border`}
										onClick={() => setSelectedDashboard(dashboard.id)}
									>
										<div className="flex items-start justify-between">
											<h4 className="font-medium">{dashboard.name}</h4>
											<div className="text-muted-foreground flex items-center text-xs">
												<CalendarIcon className="mr-1 h-3 w-3" />
												{dashboard.updatedAt.toLocaleDateString()}
											</div>
										</div>

										{dashboard.description && (
											<p className="text-muted-foreground mt-1 text-sm">{dashboard.description}</p>
										)}
									</div>
								))}
							</div>
						</ScrollArea>
					) : (
						<div className="p-8 text-center">
							<Info className="text-muted-foreground mx-auto mb-2 h-10 w-10" />
							<p className="text-muted-foreground">No hay dashboards guardados disponibles.</p>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button onClick={handleLoadDashboard} disabled={isLoading || !selectedDashboard}>
						{isLoading ? "Cargando..." : "Cargar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
