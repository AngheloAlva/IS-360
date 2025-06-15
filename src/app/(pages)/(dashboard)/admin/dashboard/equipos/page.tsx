import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import EquipmentStatsContainer from "@/project/equipment/components/stats/EquipmentStatsContainer"
import CreateEquipmentForm from "@/project/equipment/components/forms/CreateEquipmentForm"
import { EquipmentTable } from "@/project/equipment/components/data/EquipmentTable"

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
			<div className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 p-6">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Equipos y Ubicaciones</h1>
						<p className="opacity-90">Gestión y monitoreo de equipos industriales y ubicaciones</p>
					</div>

					{hasPermission.success && <CreateEquipmentForm parentId={undefined} />}
				</div>
			</div>

			<EquipmentStatsContainer />

			<EquipmentTable parentId={null} lastPath="/admin/dashboard/equipos" />
		</div>
	)
}
