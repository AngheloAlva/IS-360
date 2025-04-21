"use client"

import { Plus } from "lucide-react"
import Link from "next/link"

import { EquipmentDataTable } from "@/components/sections/admin/equipments/EquipmentDataTable"
import { Button } from "@/components/ui/button"

export default function EquipmentsPage(): React.ReactElement {
	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 overflow-hidden transition-all">
			<div className="flex items-start justify-between gap-4 md:items-center">
				<div className="flex flex-col gap-1">
					<h1 className="text-text w-fit text-3xl font-bold">Equipos</h1>
					<p className="text-text w-fit text-sm sm:text-base">
						Visualiza y gestiona los equipos de la empresa.
					</p>
				</div>

				<Link href="/admin/dashboard/equipos/agregar">
					<Button size={"lg"}>
						<Plus />
						<span className="hidden sm:block">Nuevo Equipo</span>
					</Button>
				</Link>
			</div>

			<EquipmentDataTable />
		</div>
	)
}
