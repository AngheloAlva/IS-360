import { headers } from "next/headers"

import { ACCESS_ROLE } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"

import WorkPermitForm from "@/project/work-permit/components/forms/WorkPermitForm"
import BackButton from "@/shared/components/BackButton"
import { auth } from "@/lib/auth"

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

	const isOtcMember = res.user.accessRole === ACCESS_ROLE.ADMIN

	return (
		<div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4">
			<div
				className={cn(
					"rounded-lg bg-linear-to-r from-purple-600 to-indigo-700 p-6 shadow-lg dark:from-purple-800 dark:to-indigo-900",
					{
						"from-pink-600 to-rose-700 dark:from-pink-800 dark:to-rose-900": isOtcMember,
					}
				)}
			>
				<div className="flex items-center justify-between">
					<div className="mx-auto flex w-full max-w-7xl items-center justify-start gap-3">
						<BackButton
							href="/admin/dashboard/permisos-de-trabajo"
							className="bg-white/30 text-white hover:bg-white/50"
						/>

						<div className="text-white">
							<h1 className="text-3xl font-bold tracking-tight">Nuevo Permiso de Trabajo Seguro</h1>
							<p className="opacity-90">
								Crea un nuevo permiso de trabajo completando los campos del formulario
							</p>
						</div>
					</div>
				</div>
			</div>

			<WorkPermitForm
				userName={res.user.name}
				isOtcMember={isOtcMember}
				companyId={isOtcMember ? process.env.NEXT_PUBLIC_OTC_COMPANY_ID! : ""}
			/>
		</div>
	)
}
