"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"

import { EquipmentDataTable } from "./EquipmentDataTable"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export default function MainAdminEquipments(): React.ReactElement {
	const { state } = useSidebar()
	const searchParams = useSearchParams()
	const parentId = searchParams.get("parentId")

	return (
		<div
			className={cn(
				"flex h-full w-full flex-col gap-8 overflow-hidden transition-all md:max-w-[95dvw] lg:max-w-[98dvw]",
				{
					"md:max-w-[62dvw] lg:max-w-[70dvw] xl:max-w-[77dvw] 2xl:max-w-[80dvw]":
						state === "expanded",
				}
			)}
		>
			<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				<div className="flex flex-col gap-1">
					<h1 className="text-text w-fit text-3xl font-bold">
						{parentId ? "Equipos Secundarios" : "Equipos Principales"}
					</h1>
					<p className="text-text-foreground w-fit text-lg">
						{parentId
							? "Visualiza y gestiona los equipos secundarios."
							: "Visualiza y gestiona los equipos principales."}
					</p>
				</div>

				<Link href={`/admin/dashboard/equipos/agregar${parentId ? `?parentId=${parentId}` : ""}`}>
					<Button
						size={"lg"}
						className="border-primary text-primary border bg-white hover:text-white"
					>
						<Plus className="ml-1" />
						{parentId ? "Nuevo Equipo Secundario" : "Nuevo Equipo"}
					</Button>
				</Link>
			</div>

			<EquipmentDataTable />
		</div>
	)
}
