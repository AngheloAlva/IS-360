import { Plus } from "lucide-react"
import Link from "next/link"

import { SafetyTalkDataTable } from "@/components/sections/admin/safety-talks/SafetyTalkDataTable"
import { Button } from "@/components/ui/button"

export default async function SafetyTalksPage(): Promise<React.ReactElement> {
	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="flex items-center justify-between">
				<h1 className="w-fit text-3xl font-bold">Charlas de Seguridad</h1>
				<Link href="/admin/dashboard/charlas-de-seguridad/agregar" className="md:ml-auto">
					<Button
						size={"lg"}
						className="border-primary text-primary border bg-white hover:text-white"
					>
						Nueva Charla
						<Plus className="ml-1" />
					</Button>
				</Link>
			</div>

			<SafetyTalkDataTable />
		</div>
	)
}
