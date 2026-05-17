import { ChartBarDecreasing, FoldersIcon, Search } from "lucide-react"
import Link from "next/link"

import AreasDocumentationTable from "@/project/document/components/data/AreasDocumentationTable"
import { Button } from "@/shared/components/ui/button"

export default function DocumentationPage(): React.ReactElement {
	return (
		<div className="space-y-6">
			<div className="flex w-full flex-col items-start justify-between gap-4 md:items-center lg:flex-row">
				<div className="flex items-center gap-2">
					<div className="bg-background rounded-lg p-1.5">
						<FoldersIcon className="size-4 lg:size-5" />
					</div>

					<div className="flex flex-col gap-1">
						<h1 className="text-2xl font-bold">Gestor Documental</h1>
						<p className="text-muted-foreground text-sm">
							Gestiona y supervisa los proyectos de la empresa, asegurando eficiencia y cumplimiento
							de los procesos operativos.
						</p>
					</div>
				</div>

				<div className="flex w-full items-center gap-2 lg:w-fit">
					<Link href="/admin/dashboard/documentacion/busqueda" className="w-full lg:w-fit">
						<Button
							size={"lg"}
							className="w-full bg-indigo-500 font-semibold text-white transition-all hover:scale-105 hover:bg-indigo-600 hover:text-white lg:w-fit dark:bg-indigo-700"
						>
							<Search className="min-h-4 min-w-4" />
							Búsqueda y Vencimiento
						</Button>
					</Link>

					<Link href="/admin/dashboard/documentacion/estadisticas" className="w-fit">
						<Button
							size={"lg"}
							className="hover:bg-primary/80 w-fit font-semibold transition-all hover:scale-105 hover:text-white"
						>
							<ChartBarDecreasing className="min-h-4 min-w-4" />
							<span className="hidden md:block">Estadísticas</span>
						</Button>
					</Link>
				</div>
			</div>

			<AreasDocumentationTable />
		</div>
	)
}
