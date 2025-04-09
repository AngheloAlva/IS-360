"use client"

import { Plus } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { SafetyTalkDataTable } from "./SafetyTalkDataTable"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export default function MainAdminSafetyTalks(): React.ReactElement {
	const { state } = useSidebar()

	return (
		<div
			className={cn(
				"flex h-full w-full flex-col gap-8 transition-all md:max-w-[95dvw] lg:max-w-[98dvw]",
				{
					"md:max-w-[68dvw] lg:max-w-[75dvw] xl:max-w-[80dvw] 2xl:max-w-[85dvw]":
						state === "expanded",
				}
			)}
		>
			<div className="flex items-center justify-between">
				<h1 className="w-fit text-3xl font-bold">Charlas de Seguridad</h1>
				<Link href="/admin/dashboard/charlas-de-seguridad/agregar" className="md:ml-auto">
					<Button
						size={"lg"}
						className="border-primary text-primary border bg-white hover:text-white"
					>
						Nueva Charla
						<Plus className="ml-1" />
					</Button>
				</Link>
			</div>

			<SafetyTalkDataTable />
		</div>
	)
}
