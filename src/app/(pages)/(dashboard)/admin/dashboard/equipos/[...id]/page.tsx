import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { EquipmentDataTable } from "@/components/sections/admin/equipments/EquipmentDataTable"
import BackButton from "@/components/shared/BackButton"

export default async function EquipmentsPage({
	params,
}: {
	params: Promise<{ id: string[] }>
}): Promise<React.ReactElement> {
	const { id: equipmentIds } = await params

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

	const actualParentId = equipmentIds[equipmentIds.length - 1]

	const backPath =
		equipmentIds.length >= 1
			? `/admin/dashboard/equipos/${equipmentIds.slice(0, -1).join("/")}`
			: `/admin/dashboard/equipos`

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 overflow-hidden transition-all">
			<div className="flex items-center gap-4">
				{equipmentIds.length >= 1 && <BackButton href={backPath} />}
				<div className="flex flex-col gap-1">
					<h1 className="text-text w-fit text-3xl font-bold">Equipos</h1>
					<p className="text-text w-fit text-sm sm:text-base">
						Visualiza y gestiona los equipos de la empresa.
					</p>
				</div>
			</div>

			<EquipmentDataTable
				lastPath={backPath}
				parentId={actualParentId}
				hasPermission={hasPermission.success}
			/>
		</div>
	)
}
