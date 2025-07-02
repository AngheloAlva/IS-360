"use client"

import { SafetyTalksDashboard } from "@/project/safety-talk/components/admin/SafetyTalksDashboard"

export default function SafetyTalksAdminPage() {
	return (
		<div className="w-full flex-1 space-y-6">
			<div className="rounded-lg bg-gradient-to-r from-emerald-600 to-sky-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Charlas de Seguridad</h1>
						<p className="text-sm opacity-90 sm:text-base">
							Gestión y seguimiento de charlas de seguridad
						</p>
					</div>
				</div>
			</div>

			<SafetyTalksDashboard />
		</div>
	)
}
