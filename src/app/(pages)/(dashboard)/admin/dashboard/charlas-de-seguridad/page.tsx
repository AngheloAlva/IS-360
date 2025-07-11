"use client"

import { ScrollTextIcon } from "lucide-react"

import { SafetyTalksDashboard } from "@/project/safety-talk/components/admin/SafetyTalksDashboard"
// import { IrlSafetyTalkForm } from "@/project/safety-talk/components/forms/IrlSafetyTalkForm"
import ModuleHeader from "@/shared/components/ModuleHeader"
import Link from "next/link"
import { Button } from "@/shared/components/ui/button"

export default function SafetyTalksAdminPage() {
	return (
		<div className="w-full flex-1 space-y-6">
			<ModuleHeader
				title="Charlas de Seguridad"
				description="Gestión y seguimiento de charlas de seguridad"
				className="from-emerald-600 to-sky-700"
			>
				<div className="flex items-center gap-3">
					<Link href="/admin/dashboard/charlas-de-seguridad/visitas">
						<Button
							size={"lg"}
							className="cursor-pointer gap-2 bg-white font-medium text-sky-600 transition-all hover:scale-105 hover:bg-white hover:text-sky-700"
						>
							<ScrollTextIcon className="size-4" />
							Charla de Visitas
						</Button>
					</Link>
					{/* <IrlSafetyTalkForm /> */}
				</div>
			</ModuleHeader>

			<SafetyTalksDashboard />
		</div>
	)
}
