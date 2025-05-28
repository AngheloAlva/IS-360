import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { EquipmentDataTable } from "@/components/sections/admin/equipments/EquipmentDataTable"

export default async function EquipmentsPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				equipment: ["create"],
			},
		},
	})

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 overflow-hidden transition-all">
			<div className="flex flex-col gap-1">
				<h1 className="text-text w-fit text-3xl font-bold">Equipos / Ubicaciones</h1>
				<p className="text-text w-fit text-sm sm:text-base">
					Visualiza y gestiona los equipos y ubicaciones de la empresa.
				</p>
			</div>

			<EquipmentDataTable
				parentId={null}
				hasPermission={hasPermission.success}
				lastPath="/admin/dashboard/equipos"
			/>
		</div>
	)
}
