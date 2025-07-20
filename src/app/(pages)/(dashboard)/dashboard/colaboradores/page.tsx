import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { UsersByCompanyTable } from "@/project/user/components/data/UsersByCompanyTable"
import CreateUsersForm from "@/project/user/components/forms/CreateUsersForm"
import VideoTutorials from "@/shared/components/VideoTutorials"
import ModuleHeader from "@/shared/components/ModuleHeader"

export default async function UsersByCompanyPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user || !session.user.companyId) {
		return notFound()
	}

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<ModuleHeader
				title="Colaboradores"
				description="Crea y gestiona los colaboradores de tu empresa."
				className="from-purple-600 to-indigo-700"
			>
				<>
					<VideoTutorials
						videos={[
							{
								title: "Creacion de Colaborador",
								description: "Tutorial de como crear un colaborador correctamente.",
								url: "https://youtube.com/embed/0hMlJI2u0p0",
							},
							{
								title: "Editar y Eliminar Colaboradores",
								description: "Tutorial de como crear un colaborador correctamente.",
								url: "https://youtube.com/embed/1UNEvx1Rko8",
							},
						]}
					/>

					{session.user.isSupervisor && <CreateUsersForm companyId={session.user.companyId} />}
				</>
			</ModuleHeader>

			<UsersByCompanyTable companyId={session.user.companyId} />
		</div>
	)
}
