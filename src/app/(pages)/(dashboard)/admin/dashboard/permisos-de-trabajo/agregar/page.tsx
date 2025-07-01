import { headers } from "next/headers"

import { USER_ROLE } from "@prisma/client"
import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"

import WorkPermitForm from "@/project/work-permit/components/forms/WorkPermitForm"
import BackButton from "@/shared/components/BackButton"

export default async function CreateWorkPermitPage() {
	const res = await auth.api.getSession({
		headers: await headers(),
	})

	if (!res) {
		return (
			<main className="flex h-screen items-center justify-center">
				<p>Acceso denegado</p>
			</main>
		)
	}

	const isOtcMember = res.user.accessRole === USER_ROLE.ADMIN

	return (
		<div className="mx-auto flex h-full w-full max-w-screen-xl flex-1 flex-col gap-4">
			<div
				className={cn("rounded-lg bg-gradient-to-r from-purple-600 to-indigo-700 p-6 shadow-lg", {
					"from-pink-600 to-rose-700": isOtcMember,
				})}
			>
				<div className="flex items-center justify-between">
					<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-3">
						<BackButton
							href="/admin/dashboard/permisos-de-trabajo"
							className="bg-white/30 text-white hover:bg-white/50"
						/>

						<div className="text-white">
							<h1 className="text-3xl font-bold tracking-tight">Nuevo Permiso de Trabajo Seguro</h1>
							<p className="opacity-90">Gestión de permisos de trabajo seguro</p>
						</div>
					</div>
				</div>
			</div>

			<WorkPermitForm
				companyId={""}
				userId={res.user.id}
				userName={res.user.name}
				isOtcMember={isOtcMember}
			/>
		</div>
	)
}
