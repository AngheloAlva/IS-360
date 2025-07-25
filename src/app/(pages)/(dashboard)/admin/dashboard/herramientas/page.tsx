import { AlertTriangle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { AdminToolsList } from "@/project/tool/components/data/AdminToolsList"
import ScrollToTableButton from "@/shared/components/ScrollToTable"
import ModuleHeader from "@/shared/components/ModuleHeader"

export default function AdminToolsPage() {
	return (
		<div className="w-full flex-1 space-y-6">
			<ModuleHeader
				title="Gestión de Herramientas Externas"
				description="Control de movimientos y actividades de herramientas por empresa"
				className="rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 p-6 shadow-lg"
			>
				<ScrollToTableButton
					label="Lista Empresas"
					id="tools-companies-list"
					className="text-orange-600 hover:bg-white hover:text-orange-600"
				/>
			</ModuleHeader>

			<Card className="border-amber-500/50 bg-amber-500/10">
				<CardHeader>
					<CardTitle className="flex items-center space-x-2 text-amber-500">
						<AlertTriangle className="h-5 w-5" />
						<span>Modo Demostración</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="text-text">
					<p className="mb-2">
						Esta es una demostración del módulo de gestión de herramientas. Todas las acciones son
						simuladas y no afectan la base de datos real.
					</p>
					<ul className="list-inside list-disc space-y-1 text-sm">
						<li>Los datos mostrados son ejemplos ficticios</li>
						<li>Las asignaciones y devoluciones son temporales</li>
						<li>No se realizan cambios en el sistema actual</li>
					</ul>
				</CardContent>
			</Card>

			<AdminToolsList id="tools-companies-list" />
		</div>
	)
}
