import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { EquipmentTable } from "@/project/equipment/components/data/EquipmentTable"
import CreateEquipmentForm from "@/project/equipment/components/forms/CreateEquipmentForm"
import BackButton from "@/shared/components/BackButton"

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
			<div className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 lg:gap-3">
						{equipmentIds.length >= 1 && (
							<BackButton
								className="bg-white/20 text-white transition-all hover:scale-105 hover:bg-white/30"
								href={backPath}
							/>
						)}

						<div className="text-white">
							<h1 className="text-3xl font-bold tracking-tight">Equipos y Ubicaciones</h1>
							<p className="opacity-90">
								Gestión y monitoreo de equipos industriales y ubicaciones
							</p>
						</div>
					</div>

					{hasPermission.success && <CreateEquipmentForm parentId={actualParentId} />}
				</div>
			</div>

			<EquipmentTable lastPath={backPath} parentId={actualParentId} />
		</div>
	)
}
