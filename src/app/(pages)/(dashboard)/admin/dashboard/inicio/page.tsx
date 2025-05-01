"use client"

import Image from "next/image"

import { useDashboardStats } from "@/hooks/dashboard/use-dashboard-stats"
import { StatsSection } from "@/components/dashboard/stats-section"

export default function DashboardHomePage() {
	const { data, isLoading } = useDashboardStats()

	return (
		<div className="flex w-full flex-col gap-8">
			<div className="relative flex h-[500px] items-center justify-center overflow-hidden rounded-none shadow">
				<Image
					fill
					priority
					alt="Dashboard Hero"
					className="object-cover"
					src="/images/home/hero.jpg"
				/>
				<div className="absolute inset-0 bg-black/30" />

				<div className="relative z-10 text-center text-white">
					<h1 className="text-4xl font-bold drop-shadow-2xl">Bienvenido a OTC 360</h1>
					<p className="mt-2 text-lg drop-shadow-2xl">
						Gestiona y supervisa todos los distintos modulos de la plataforma.
					</p>
				</div>
			</div>

			<div className="space-y-4">
				<h2 className="text-2xl font-semibold">Resumen del Sistema</h2>
				{data && <StatsSection data={data} isLoading={isLoading} />}
			</div>
		</div>
	)
}
