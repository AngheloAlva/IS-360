"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { toast } from "sonner"

import { useSidebar } from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

import { DataTable } from "./DataTable"
import { columns } from "./columns"

import type { UserWithRole } from "better-auth/plugins"

export default function MainAdminUsers({ page }: { page: number }): React.ReactElement {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [users, setUsers] = useState<UserWithRole[]>([])
	const { state } = useSidebar()

	useEffect(() => {
		const fetchUsers = async () => {
			const { data, error } = await authClient.admin.listUsers({
				query: {
					limit: 10,
					offset: (page - 1) * 10,
					sortBy: "createdAt",
				},
			})

			if (error) {
				toast("Error al cargar los usuarios", {
					description: error.message,
					duration: 5000,
				})
				return notFound()
			}

			setUsers(data.users)
			setIsLoading(false)
		}

		void fetchUsers()
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
			<h1 className="w-fit text-3xl font-bold">Lista de Usuarios</h1>

			<DataTable columns={columns} data={users} isLoading={isLoading} />
		</div>
	)
}
