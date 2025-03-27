"use client"

import { Plus } from "lucide-react"
import Link from "next/link"

import GeneralSummary from "./GeneralSummary"
import RoleDistribution from "./RoleDistribution"
import AreaDistribution from "./AreaDistribution"

import { cn } from "@/lib/utils"

import { useSidebar } from "@/components/ui/sidebar"
import { UsersDataTable } from "./UsersDataTable"
import { Button } from "@/components/ui/button"

export default function MainAdminUsers(): React.ReactElement {
	const { state } = useSidebar()

	return (
		<div
			className={cn(
				"flex h-full w-full flex-col gap-8 transition-all md:max-w-[87dvw] lg:max-w-[98dvw]",
				{
					"md:max-w-[62dvw] lg:max-w-[70dvw] xl:max-w-[85dvw] 2xl:max-w-[85dvw]":
						state === "expanded",
				}
			)}
		>
			<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				<div className="flex flex-col gap-1">
					<h1 className="text-text w-fit text-3xl font-bold">Usuarios</h1>
					<p className="text-text-foreground w-fit text-lg">
						En esta sección puedes gestionar los usuarios de la plataforma.
					</p>
				</div>

				<div className="flex flex-col gap-2 md:items-end">
					<Link href="/admin/dashboard/usuarios/internos/agregar">
						<Button
							size={"lg"}
							className="border-primary text-primary border bg-white hover:text-white"
						>
							<Plus className="ml-1" />
							Nuevo Miembro OTC
						</Button>
					</Link>

					<Link href="/admin/dashboard/usuarios/externos/agregar">
						<Button
							size={"lg"}
							className="border-feature text-feature hover:bg-feature border bg-white hover:text-white"
						>
							<Plus className="ml-1" />
							Nuevos Usuarios Externos
						</Button>
					</Link>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<GeneralSummary />
				<RoleDistribution />
				<AreaDistribution />
			</div>

			<UsersDataTable />
		</div>
	)
}
