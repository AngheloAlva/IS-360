"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { toast } from "sonner"

import { getWorkOrders } from "@/actions/work-orders/getWorkOrders"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

import { DataTable } from "./DataTable"
import { columns } from "./columns"

import type { WorkOrder } from "@prisma/client"

export default function MainAdminWorkOrders({ page }: { page: number }): React.ReactElement {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
	const { state } = useSidebar()

	useEffect(() => {
		const fetchWorkOrders = async () => {
			const { data, ok } = await getWorkOrders(10, page)

			if (!ok || !data) {
				toast("Error al cargar las ordenes de trabajo", {
					description: "Error al cargar las ordenes de trabajo",
					duration: 5000,
				})
				return notFound()
			}

			setWorkOrders(data)
			setIsLoading(false)
		}

		void fetchWorkOrders()
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
			<h1 className="w-fit text-3xl font-bold">Lista de Ordenes de Trabajo</h1>

			<DataTable columns={columns} data={workOrders} isLoading={isLoading} />
		</div>
	)
}
