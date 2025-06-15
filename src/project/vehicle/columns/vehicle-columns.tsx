import { MoreHorizontal } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import { VehicleTypeOptions } from "@/lib/consts/vehicle-types"

import DeleteVehicleDialog from "@/project/vehicle/components/forms/DeleteVehicle"
import VehicleForm from "@/project/vehicle/components/forms/VehicleForm"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu"

import type { Vehicle } from "../hooks/use-vehicles-by-company"
import type { ColumnDef } from "@tanstack/react-table"

export const vehicleColumns: ColumnDef<Vehicle>[] = [
	{
		accessorKey: "plate",
		header: "Matrícula",
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
		accessorKey: "brand",
		header: "Marca",
	},
	{
		accessorKey: "type",
		header: "Tipo",
		cell: ({ row }) => {
			const type = row.getValue("type") as string
			const vehicleType = VehicleTypeOptions.find((option) => option.value === type)

			return vehicleType?.label || type
		},
	},
	{
		accessorKey: "isMain",
		header: "Principal",
		cell: ({ row }) => {
			const isMain = row.getValue("isMain") as boolean

			return isMain ? (
				<Badge className="bg-teal-500 px-6 font-semibold hover:bg-teal-600">Sí</Badge>
			) : (
				<Badge className="bg-emerald-900 px-6 font-semibold hover:bg-emerald-900">No</Badge>
			)
		},
	},
	{
		accessorKey: "createdAt",
		header: "Fecha de creación",
		cell: ({ row }) => {
			const createdAt = row.getValue("createdAt") as string

			return format(new Date(createdAt), "dd/MM/yyyy", { locale: es })
		},
	},
	{
		id: "actions",
		header: "Acciones",
		cell: ({ row }) => {
			const vehicle = row.original

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Abrir menú</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Acciones</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
							<VehicleForm companyId={vehicle.companyId} vehicleId={vehicle.id} />
						</DropdownMenuItem>

						<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
							<DeleteVehicleDialog vehicleId={vehicle.id} companyId={vehicle.companyId} />
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		},
	},
]
