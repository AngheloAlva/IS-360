"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { Plus } from "lucide-react"

import { getCompanies } from "@/actions/companies/getCompanies"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { DataTable } from "./DataTable"
import { columns } from "./columns"
import GeneralSummary from "./GeneralSummary"
import WorkOrdersDistribution from "./WorkOrdersDistribution"
import UsersDistribution from "./UsersDistribution"
import VehiclesDistribution from "./VehiclesDistribution"
import { VehiclesDataTable } from "./vehicles/VehiclesDataTable"
import { columns as vehicleColumns } from "./vehicles/columns"

import type { Company, Vehicle } from "@prisma/client"

export default function MainAdminCompanies({ page }: { page: number }): React.ReactElement {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [companies, setCompanies] = useState<Company[]>([])
	const [vehicles, setVehicles] = useState<Vehicle[]>([])
	const [isLoadingVehicles, setIsLoadingVehicles] = useState<boolean>(true)
	const { state } = useSidebar()

	useEffect(() => {
		const fetchCompanies = async () => {
			const { data, ok } = await getCompanies(10, page)

			if (!ok || !data) {
				toast("Error al cargar las empresas", {
					description: "Error al cargar las empresas",
					duration: 5000,
				})
				return notFound()
			}

			setCompanies(data)
			setIsLoading(false)
		}

		void fetchCompanies()
	}, [page])

	useEffect(() => {
		const fetchVehicles = async () => {
			try {
				const response = await fetch("/api/companies/vehicles")
				if (!response.ok) throw new Error("Error fetching vehicles")
				const data = await response.json()
				setVehicles(data)
			} catch {
				toast("Error al cargar los vehículos", {
					description: "Error al cargar los vehículos",
					duration: 5000,
				})
			} finally {
				setIsLoadingVehicles(false)
			}
		}

		void fetchVehicles()
	}, [])

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

			<DataTable columns={columns} data={companies} isLoading={isLoading} />

			<div className="mt-8">
				<VehiclesDataTable columns={vehicleColumns} data={vehicles} isLoading={isLoadingVehicles} />
			</div>
		</div>
	)
}
