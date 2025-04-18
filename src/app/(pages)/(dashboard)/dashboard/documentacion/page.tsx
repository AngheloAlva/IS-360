import { ChartBarDecreasing } from "lucide-react"
import Link from "next/link"

import AreasDocumentationTable from "@/components/sections/documentation/AreasDocumentationTable"
import { Button } from "@/components/ui/button"

export default function DocumentationPage(): React.ReactElement {
	return (
		<div className="space-y-6">
			<div className="flex w-full items-start justify-between md:items-center">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-bold">Gestor Documental</h1>
					<p className="text-text text-sm">
						Gestiona y supervisa los proyectos de la empresa, asegurando eficiencia y cumplimiento
						de los procesos operativos.
					</p>
				</div>

				<Link href="/dashboard/documentacion/estadisticas">
					<Button size={"lg"}>
						<ChartBarDecreasing className="min-h-5 min-w-5" />
						<span className="hidden md:block">Estadísticas</span>
					</Button>
				</Link>
			</div>

			<AreasDocumentationTable />
		</div>
	)
}
