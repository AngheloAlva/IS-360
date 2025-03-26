"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { toast } from "sonner"

import { getCompanies } from "@/actions/companies/getCompanies"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

import { DataTable } from "./DataTable"
import { columns } from "./columns"
import GeneralSummary from "./GeneralSummary"
import WorkOrdersDistribution from "./WorkOrdersDistribution"
import UsersDistribution from "./UsersDistribution"

import type { Company } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function MainAdminCompanies({ page }: { page: number }): React.ReactElement {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [companies, setCompanies] = useState<Company[]>([])
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

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<GeneralSummary />
				<WorkOrdersDistribution />
				<UsersDistribution />
			</div>

			<DataTable columns={columns} data={companies} isLoading={isLoading} />
		</div>
	)
}
