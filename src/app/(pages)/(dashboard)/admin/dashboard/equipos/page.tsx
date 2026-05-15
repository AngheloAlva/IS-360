import { Suspense } from "react"
import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import EquipmentStatsContainer from "@/project/equipment/components/stats/EquipmentStatsContainer"
import CreateEquipmentForm from "@/project/equipment/components/forms/CreateEquipmentForm"
import { EquipmentPageTabs } from "@/project/equipment/components/data/EquipmentPageTabs"

export default async function EquipmentsPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const userId = session.user.id

	const [
		canCreateEquipment,
		canUpdateEquipment,
		canDeleteEquipment,
		canListLocations,
		canCreateLocation,
		canUpdateLocation,
		canDeleteLocation,
	] = await Promise.all([
		auth.api.userHasPermission({
			body: { userId, permissions: { equipment: ["create"] } },
		}),
		auth.api.userHasPermission({
			body: { userId, permissions: { equipment: ["update"] } },
		}),
		auth.api.userHasPermission({
			body: { userId, permissions: { equipment: ["delete"] } },
		}),
		auth.api.userHasPermission({
			body: { userId, permissions: { location: ["list"] } },
		}),
		auth.api.userHasPermission({
			body: { userId, permissions: { location: ["create"] } },
		}),
		auth.api.userHasPermission({
			body: { userId, permissions: { location: ["update"] } },
		}),
		auth.api.userHasPermission({
			body: { userId, permissions: { location: ["delete"] } },
		}),
	])

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 overflow-hidden transition-all">
			<div className="rounded-lg bg-linear-to-r from-emerald-600 to-teal-700 p-6 dark:from-emerald-800 dark:to-teal-900">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Equipos y Ubicaciones</h1>
						<p className="opacity-90">Gestión y monitoreo de equipos industriales y ubicaciones</p>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						{canCreateEquipment.success && <CreateEquipmentForm parentId={undefined} />}
					</div>
				</div>
			</div>

			<EquipmentStatsContainer />

			<Suspense>
				<EquipmentPageTabs
					canSeeTree={canListLocations.success}
					canCreateEquipment={canCreateEquipment.success}
					canUpdateEquipment={canUpdateEquipment.success}
					canDeleteEquipment={canDeleteEquipment.success}
					canCreateLocation={canCreateLocation.success}
					canUpdateLocation={canUpdateLocation.success}
					canDeleteLocation={canDeleteLocation.success}
				/>
			</Suspense>
		</div>
	)
}
