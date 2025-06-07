"use client"

import Image from "next/image"

import { DashboardStats } from "@/components/dashboard/homepage/dashboard-stats"
import { useHomepageStats } from "@/hooks/dashboard/use-homepage-stats"

export default function DashboardHomePage() {
	const { data, isLoading } = useHomepageStats()

	return (
		<div className="flex w-full flex-col gap-8">
			<div className="relative flex h-[300px] items-start justify-start overflow-hidden rounded-lg p-5 shadow">
				<Image
					fill
					priority
					alt="Dashboard Hero"
					src="/images/home/hero.jpg"
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-black/30" />

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
