import { Star } from "lucide-react"

import { Vehicle } from "@/hooks/use-vehicles"
import { Badge } from "@/components/ui/badge"

import type { ColumnDef } from "@tanstack/react-table"

const VehicleTypeLabels: Record<string, string> = {
	CAR: "Automóvil",
	TRUCK: "Camión",
	MOTORCYCLE: "Motocicleta",
	BUS: "Bus",
	TRACTOR: "Tractor",
	TRAILER: "Remolque",
	OTHER: "Otro",
}

export const VehiclesColumns: ColumnDef<Vehicle>[] = [
	{
		accessorKey: "company.name",
		header: "Empresa",
		cell: ({ row }) => {
			const company = row.original.company
			return <span>{company.name}</span>
		},
	},
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
				<Badge variant="default" className="border-primary text-primary bg-primary/10">
					<Star className="fill-primary mr-1" />
					Principal
				</Badge>
			) : (
				<Badge variant="secondary">Secundario</Badge>
			)
		},
	},
]
