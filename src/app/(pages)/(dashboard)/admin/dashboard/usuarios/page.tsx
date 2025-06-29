import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { UserStatsContainer } from "@/project/user/components/stats/UserStatsContainer"
import InternalUser from "@/project/user/components/forms/InternalUser"
import { UsersTable } from "@/project/user/components/data/UsersTable"
import ScrollToTableButton from "@/shared/components/ScrollToTable"

export default async function AdminUsersPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				user: ["create"],
			},
		},
	})

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Usuarios Registrados</h1>
						<p className="opacity-90">Gestión y seguimiento de usuarios registrados</p>
					</div>

					<div className="flex flex-wrap items-center justify-end gap-2">
						<ScrollToTableButton
							id="users-table"
							label="Lista Usuarios"
							className="text-indigo-600 hover:bg-white hover:text-indigo-600"
						/>
						{hasPermission.success && <InternalUser />}
					</div>
				</div>
			</div>

			<UserStatsContainer />

			<UsersTable id="users-table" hasPermission={hasPermission.success} />
		</div>
	)
}
