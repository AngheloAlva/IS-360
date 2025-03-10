"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"

import { getWorkPermits } from "@/actions/work-permit/getWorkPermit"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { DataTable } from "./DataTable"
import { columns } from "./columns"

import type { Personnel, WorkPermit } from "@prisma/client"

export default function MainWorkBook({
	page,
	userId,
}: {
	page: number
	userId: string
}): React.ReactElement {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [workPermits, setWorkPermits] = useState<
		Array<WorkPermit & { participants: Personnel[]; otNumber: { otNumber: string } }>
	>([])

	const { state } = useSidebar()

	useEffect(() => {
		const fetchWorkBooks = async () => {
			const data = await getWorkPermits(userId, 10, page)

			if (!data.ok || !data.data) {
				toast("Error al cargar los permisos de trabajo", {
					description: data.message,
					duration: 5000,
				})
				return notFound()
			}

			setWorkPermits(data.data)
			setIsLoading(false)
		}

		void fetchWorkBooks()
	}, [page, userId])

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
			<h1 className="w-fit text-3xl font-bold">Permisos de Trabajo Seguro</h1>

			<DataTable columns={columns} data={workPermits} isLoading={isLoading} />
		</div>
	)
}
