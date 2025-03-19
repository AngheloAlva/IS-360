"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { toast } from "sonner"

import { getCompanies } from "@/actions/companies/getCompanies"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

import { DataTable } from "./DataTable"
import { columns } from "./columns"

import type { Company } from "@prisma/client"

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
				"flex h-full w-full flex-col gap-8 overflow-hidden transition-all md:max-w-[95dvw] lg:max-w-[98dvw]",
				{
					"md:max-w-[68dvw] lg:max-w-[75dvw] xl:max-w-[80dvw] 2xl:max-w-[85dvw]":
						state === "expanded",
				}
			)}
		>
			<h1 className="w-fit text-3xl font-bold">Lista de Empresas</h1>

			<DataTable columns={columns} data={companies} isLoading={isLoading} />
		</div>
	)
}
