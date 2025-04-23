import { Star } from "lucide-react"

import { VehicleTypeLabels } from "@/lib/consts/vehicle-type"

import { Vehicle } from "@/hooks/companies/use-vehicles-by-company"
import { Badge } from "@/components/ui/badge"

import type { ColumnDef } from "@tanstack/react-table"
import type { VEHICLE_TYPE } from "@prisma/client"

export const VehiclesByCompanyColumns: ColumnDef<Vehicle>[] = [
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
			const type = row.getValue("type") as VEHICLE_TYPE
			return <Badge variant="default" className="border-amber-500 text-amber-500 bg-amber-500/10">{VehicleTypeLabels[type]}</Badge>
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
