import InternalUserFormSheet from "@/components/forms/admin/user/InternalUserFormSheet"
import { UsersDataTable } from "@/components/sections/admin/users/UsersDataTable"
import { UserStatsCards } from "@/components/sections/admin/users/UserStatsCards"

export default function AdminUsersPage(): React.ReactElement {
	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="flex items-start justify-between gap-4 md:flex-row">
				<div className="flex flex-col gap-1">
					<h1 className="text-text w-fit text-3xl font-bold">Usuarios Registrados</h1>
					<p className="text-text w-fit text-sm sm:text-base">
						En esta sección puedes gestionar los usuarios de la plataforma.
					</p>
				</div>

				<InternalUserFormSheet />
			</div>

			<UserStatsCards />

			<UsersDataTable />
		</div>
	)
}
