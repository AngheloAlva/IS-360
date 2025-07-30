"use client"

import Image from "next/image"

import { DashboardStats } from "@/project/home/components/stats/dashboard-stats"
import { useHomepageStats } from "@/project/home/hooks/use-homepage-stats"

export default function DashboardHomePage() {
	const { data, isLoading } = useHomepageStats()

	return (
		<div className="flex w-full flex-col gap-8">
			<div className="relative flex h-[350px] items-start justify-start overflow-hidden rounded-lg p-5 shadow">
				<Image
					fill
					priority
					alt="Dashboard Hero"
					src="/images/home/hero.png"
					className="object-cover object-bottom"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent sm:bg-gradient-to-tl" />

				<div className="relative z-10 flex h-full w-full flex-col items-end justify-end text-right text-white">
					<h1 className="text-3xl font-bold drop-shadow-2xl md:text-4xl">Bienvenido a OTC 360</h1>
					<p className="mt-2 text-base drop-shadow-2xl md:text-lg">
						Gestiona y supervisa todos los distintos módulos de la plataforma.
					</p>
				</div>
			</div>

			<DashboardStats data={data} isLoading={isLoading} />
		</div>
	)
}
