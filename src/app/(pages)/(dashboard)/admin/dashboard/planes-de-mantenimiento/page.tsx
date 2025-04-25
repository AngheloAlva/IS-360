import { Plus } from "lucide-react"
import Link from "next/link"

import { MaintenancePlanDataTable } from "@/components/sections/admin/maintenance-plans/MaintenancePlanDataTable"
import { Button } from "@/components/ui/button"

export default function MaintenancePlansPage() {
	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="flex items-start justify-between gap-4 md:flex-row">
				<div className="flex flex-col gap-1">
					<h1 className="text-text w-fit text-3xl font-bold">Planes de Mantenimiento</h1>
					<p className="text-text w-fit text-sm sm:text-base">
						En esta sección puedes gestionar los planes de mantenimiento de la plataforma.
					</p>
				</div>

				<Link href="/admin/dashboard/planes-de-mantenimiento/agregar">
					<Button size={"lg"} className="bg-primary text-white hover:bg-primary/80">
						<Plus />
						Plan
						<span className="hidden sm:inline"> de Mantenimiento</span>
					</Button>
				</Link>
			</div>

			<MaintenancePlanDataTable />
		</div>
	)
}
