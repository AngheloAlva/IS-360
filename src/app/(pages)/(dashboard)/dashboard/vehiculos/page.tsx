import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { VehiclesByCompanyTable } from "@/project/vehicle/components/data/VehiclesByCompanyTable"
import VehicleForm from "@/project/vehicle/components/forms/VehicleForm"
import VideoTutorials from "@/shared/components/VideoTutorials"

const vehicleVideos = [
	{
		title: "Agregar Vehiculos",
		description: "Gestión y monitoreo de vehículos y equipos",
		url: "https://youtube.com/embed/PThFgVXV8_M",
	},
]

export default async function VehiclesPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id || !session?.user?.companyId) return notFound()

	return (
		<div className={"flex h-full w-full flex-1 flex-col gap-8 transition-all"}>
			<div className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 p-6">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Vehículos y Equipos</h1>
						<p className="opacity-90">Gestión y monitoreo de vehículos y equipos</p>
					</div>

					<div className="flex items-center gap-2">
						<VideoTutorials videos={vehicleVideos} className="text-teal-700" />
						<VehicleForm companyId={session.user.companyId} />
					</div>
				</div>
			</div>

			<VehiclesByCompanyTable companyId={session.user.companyId} />
		</div>
	)
}
