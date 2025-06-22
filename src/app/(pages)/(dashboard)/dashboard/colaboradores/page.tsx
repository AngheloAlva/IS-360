import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { UsersByCompanyTable } from "@/project/user/components/data/UsersByCompanyTable"
import CreateUsersForm from "@/project/user/components/forms/CreateUsersForm"

export default async function UsersByCompanyPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user || !session.user.companyId) {
		return notFound()
	}

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="rounded-lg bg-gradient-to-r from-orange-600 to-red-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Colaboradores</h1>
						<p className="opacity-90">Gestión del personal de la empresa</p>
					</div>

					{session.user.isSupervisor && (
						<CreateUsersForm userId={session.user.id} companyId={session.user.companyId} />
					)}
				</div>
			</div>

			<UsersByCompanyTable companyId={session.user.companyId} />
		</div>
	)
}
