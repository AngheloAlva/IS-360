import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import EquipmentDetailPage from "@/project/equipment/components/dashboard/EquipmentDetailPage"

export default async function EquipmentDetailView({
	params,
}: {
	params: Promise<{ id: string[] }>
}): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const equipmentId = (await params).id[0]

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 overflow-hidden transition-all">
			<div className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 p-6">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Detalle de Equipo</h1>
						<p className="opacity-90">Información completa y gestión del equipo seleccionado</p>
					</div>
				</div>
			</div>

			<EquipmentDetailPage equipmentId={equipmentId} />
		</div>
	)
}
