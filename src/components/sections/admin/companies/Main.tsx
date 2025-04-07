"use client"

import { Plus } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

import { VehiclesDataTable } from "./vehicles/VehiclesDataTable"
import WorkOrdersDistribution from "./WorkOrdersDistribution"
import VehiclesDistribution from "./VehiclesDistribution"
import { CompanyDataTable } from "./CompanyDataTable"
import UsersDistribution from "./UsersDistribution"
import GeneralSummary from "./GeneralSummary"

export default function MainAdminCompanies(): React.ReactElement {
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
				<h1 className="w-fit text-3xl font-bold">Lista de Empresas</h1>
				<Link href="/admin/dashboard/empresas/agregar" className="md:ml-auto">
					<Button
						size={"lg"}
						className="border-primary text-primary border bg-white hover:text-white"
					>
						Nueva Empresa
						<Plus className="ml-1" />
					</Button>
				</Link>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<GeneralSummary />
				<WorkOrdersDistribution />
				<UsersDistribution />
				<VehiclesDistribution />
			</div>

			<CompanyDataTable />

			<div className="mt-8">
				<VehiclesDataTable />
			</div>
		</div>
	)
}
