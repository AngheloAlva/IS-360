import { Suspense } from "react"
import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import ModuleHeader from "@/shared/components/ModuleHeader"
import EquipmentWorkHistory from "@/project/equipment/components/dashboard/EquipmentWorkHistory"

export default async function HistorialEquiposPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-6 transition-all">
			<ModuleHeader
				title="Historial de Equipos"
				description="Historial cronológico de solicitudes y órdenes de trabajo por equipo"
				className="bg-linear-to-r from-emerald-600 to-teal-700 dark:from-emerald-800 dark:to-teal-900"
			/>

			<Suspense>
				<EquipmentWorkHistory />
			</Suspense>
		</div>
	)
}
