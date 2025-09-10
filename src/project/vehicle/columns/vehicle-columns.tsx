import { VehicleTypeOptions } from "@/lib/consts/vehicle-types"

import VehicleDetailsDialog from "@/project/vehicle/components/dialogs/VehicleDetailsDialog"
import DeleteVehicleDialog from "@/project/vehicle/components/forms/DeleteVehicle"
import VehicleForm from "@/project/vehicle/components/forms/VehicleForm"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import ActionDataMenu from "@/shared/components/ActionDataMenu"
import { Badge } from "@/shared/components/ui/badge"

import type { Vehicle } from "../hooks/use-vehicles-by-company"
import type { ColumnDef } from "@tanstack/react-table"

export const vehicleColumns: ColumnDef<Vehicle>[] = [
	{
		id: "actions",
		header: "Acciones",
		cell: ({ row }) => {
			const vehicle = row.original

			return (
				<ActionDataMenu>
					<>
						<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
							<VehicleForm companyId={vehicle.companyId} vehicleId={vehicle.id} />
						</DropdownMenuItem>

						<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
							<DeleteVehicleDialog vehicleId={vehicle.id} companyId={vehicle.companyId} />
						</DropdownMenuItem>
					</>
				</ActionDataMenu>
			)
		},
	},
	{
		accessorKey: "plate",
		header: "Matrícula",
		cell: ({ row }) => {
			const vehicle = row.original
			const plate = row.getValue("plate") as string

			return (
				<VehicleDetailsDialog vehicle={vehicle}>
					<span className="cursor-pointer font-semibold text-emerald-500 hover:underline">
						{plate}
					</span>
				</VehicleDetailsDialog>
			)
		},
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
]
