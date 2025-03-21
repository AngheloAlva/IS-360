import { ChartColumnBig } from "lucide-react"
import Link from "next/link"

import AreasDocumentationTable from "@/components/sections/documentation/AreasDocumentationTable"
import { Button } from "@/components/ui/button"

export default function DocumentationPage(): React.ReactElement {
	return (
		<>
			<div className="flex w-full items-center justify-between">
				<h1 className="text-2xl font-bold">Documentación</h1>

				<Link href="/dashboard/documentacion/estadisticas">
					<Button variant={"outline"}>
						Estadísticas <ChartColumnBig className="text-primary h-4 w-4" />
					</Button>
				</Link>
			</div>

			<AreasDocumentationTable />
		</>
	)
}
