import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { UsersByCompanyDataTable } from "@/components/sections/users/UsersByCompanyDataTable"
import CreateUsersForm from "@/components/forms/partner/CreateUsersForm"

export default async function UsersByCompanyPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user || !session.user.companyId) {
		return notFound()
	}

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="flex items-start justify-between gap-4 md:flex-row">
				<div className="flex flex-col gap-1">
					<h1 className="text-text w-fit text-3xl font-bold">Colaboradores</h1>
					<p className="text-text w-fit text-sm sm:text-base">
						En esta sección puedes gestionar los colaboradores de la empresa.
					</p>
				</div>

				{session.user.isSupervisor && <CreateUsersForm companyId={session.user.companyId} />}
			</div>

			<UsersByCompanyDataTable companyId={session.user.companyId} />
		</div>
	)
}
