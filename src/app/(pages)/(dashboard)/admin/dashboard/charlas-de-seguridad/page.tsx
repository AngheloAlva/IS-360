import { Plus } from "lucide-react"
import Link from "next/link"

import { SafetyTalkDataTable } from "@/components/sections/admin/safety-talks/SafetyTalkDataTable"
import { Button } from "@/components/ui/button"

export default async function SafetyTalksPage(): Promise<React.ReactElement> {
	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="w-fit text-3xl font-bold">Charlas de Seguridad</h1>
					<p className="text-muted-foreground">
						En este modulo puedes gestionar las charlas de seguridad de la empresa.
					</p>
				</div>
				<Link href="/admin/dashboard/charlas-de-seguridad/agregar" className="md:ml-auto">
					<Button size={"lg"}>
						Nueva Charla
						<Plus className="ml-1" />
					</Button>
				</Link>
			</div>

			<SafetyTalkDataTable />
		</div>
	)
}
