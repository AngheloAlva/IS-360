import { ChartBarDecreasing, Search } from "lucide-react"
import Link from "next/link"

import AreasDocumentationTable from "@/features/document/components/data/AreasDocumentationTable"
import { Button } from "@/shared/components/ui/button"

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

				<div className="flex items-center gap-2">
					<Link href="/admin/dashboard/documentacion/busqueda">
						<Button
							size={"lg"}
							className="bg-indigo-500 text-white hover:bg-indigo-600 hover:text-white"
						>
							<Search className="min-h-5 min-w-5" />
							<span className="hidden lg:block">Búsqueda y Vencimiento</span>
						</Button>
					</Link>

					<Link href="/admin/dashboard/documentacion/estadisticas">
						<Button size={"lg"} className="hover:bg-primary/80 hover:text-white">
							<ChartBarDecreasing className="min-h-5 min-w-5" />
							<span className="hidden md:block">Estadísticas</span>
						</Button>
					</Link>
				</div>
			</div>

			<AreasDocumentationTable />
		</div>
	)
}
