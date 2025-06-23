"use client"

import Image from "next/image"

import { DashboardStats } from "@/project/home/components/stats/dashboard-stats"
import { useHomepageStats } from "@/project/home/hooks/use-homepage-stats"

export default function DashboardHomePage() {
	const { data, isLoading } = useHomepageStats()

	return (
		<div className="flex w-full flex-col gap-8">
			<div className="relative flex h-[300px] items-start justify-start overflow-hidden rounded-lg p-5 shadow">
				<Image
					fill
					priority
					alt="Dashboard Hero"
					className="object-cover"
					src="/images/home/hero.jpg"
				/>
				<div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent" />

				<div className="relative z-10 text-start text-white">
					<h1 className="text-4xl font-bold drop-shadow-2xl">Bienvenido a OTC 360</h1>
					<p className="mt-2 text-lg drop-shadow-2xl">
						Gestiona y supervisa todos los distintos módulos de la plataforma.
					</p>
				</div>
			</div>

			<DashboardStats data={data} isLoading={isLoading} />
		</div>
	)
}
