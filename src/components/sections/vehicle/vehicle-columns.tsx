import { FileEdit, MoreHorizontal, Trash2 } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import { VehicleTypeOptions } from "@/lib/consts/vehicle-types"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import type { Vehicle } from "@/hooks/vehicles/use-vehicles"

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
				<Badge className="bg-green-500 hover:bg-green-600">Sí</Badge>
			) : (
				<Badge variant="outline">No</Badge>
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
						<DropdownMenuItem onClick={() => window.vehicleEdit(vehicle.id)}>
							<FileEdit className="mr-2 h-4 w-4" />
							Editar vehículo
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => window.vehicleDelete(vehicle.id)}>
							<Trash2 className="mr-2 h-4 w-4" />
							Eliminar vehículo
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		},
	},
]
