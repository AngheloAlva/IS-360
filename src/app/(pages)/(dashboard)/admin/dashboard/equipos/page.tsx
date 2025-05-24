import { EquipmentDataTable } from "@/components/sections/admin/equipments/EquipmentDataTable"

export default function EquipmentsPage(): React.ReactElement {
	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 overflow-hidden transition-all">
			<div className="flex flex-col gap-1">
				<h1 className="text-text w-fit text-3xl font-bold">Equipos</h1>
				<p className="text-text w-fit text-sm sm:text-base">
					Visualiza y gestiona los equipos de la empresa.
				</p>
			</div>

			<EquipmentDataTable parentId={null} lastPath="/admin/dashboard/equipos" />
		</div>
	)
}
