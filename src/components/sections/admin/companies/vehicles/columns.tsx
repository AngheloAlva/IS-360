import { type ColumnDef } from "@tanstack/react-table"
import { DotIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import type { Vehicle } from "@prisma/client"

const VehicleTypeLabels: Record<string, string> = {
	CAR: "Automóvil",
	TRUCK: "Camión",
	MOTORCYCLE: "Motocicleta",
	BUS: "Bus",
	TRACTOR: "Tractor",
	TRAILER: "Remolque",
	OTHER: "Otro",
}

export const columns: ColumnDef<Vehicle>[] = [
	{
		accessorKey: "plate",
		header: "Patente",
	},
	{
		accessorKey: "brand",
		header: "Marca",
	},
	{
		accessorKey: "model",
		header: "Modelo",
	},
	{
		accessorKey: "year",
		header: "Año",
	},
	{
		accessorKey: "type",
		header: "Tipo",
		cell: ({ row }) => {
			const type = row.getValue("type") as string
			return <span>{VehicleTypeLabels[type]}</span>
		},
	},
	{
		accessorKey: "isMain",
		header: "Principal",
		cell: ({ row }) => {
			const isMain = row.getValue("isMain") as boolean
			return isMain ? (
				<Badge variant="default" className="border-primary text-primary bg-white">
					<DotIcon />
					Principal
				</Badge>
			) : (
				<Badge variant="secondary">Secundario</Badge>
			)
		},
	},
]
