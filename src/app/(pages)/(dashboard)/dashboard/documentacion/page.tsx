import { ChartColumnBig } from "lucide-react"
import Link from "next/link"

import AreasDocumentationTable from "@/components/sections/documentation/AreasDocumentationTable"
import { Button } from "@/components/ui/button"

export default function DocumentationPage(): React.ReactElement {
	return (
		<div className="space-y-6">
			<div className="flex w-full items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-800">Gestor Documental</h1>

				<Link href="/dashboard/documentacion/estadisticas">
					<Button className="group hover:bg-primary border-primary text-primary flex items-center gap-2 border bg-white hover:text-white">
						Estadísticas
						<ChartColumnBig className="h-4 w-4" />
					</Button>
				</Link>
			</div>

			<AreasDocumentationTable />
		</div>
	)
}
