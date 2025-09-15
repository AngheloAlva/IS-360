import { headers } from "next/headers"

import { ACCESS_ROLE } from "@prisma/client"
import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"

import BackButton from "@/shared/components/BackButton"
import LockoutPermitForm from "@/project/lockout-permit/components/forms/LockoutPermitForm"

export default async function CreateLockoutPermitPage() {
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
		<div className="mx-auto flex h-full w-full max-w-screen-xl flex-1 flex-col gap-4">
			<div className={cn("rounded-lg bg-gradient-to-r from-yellow-500 to-lime-600 p-6 shadow-lg")}>
				<div className="flex items-center justify-between">
					<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-3">
						<BackButton
							href="/admin/dashboard/solicitudes-de-bloqueo"
							className="bg-white/30 text-white hover:bg-white/50"
						/>

						<div className="text-white">
							<h1 className="text-3xl font-bold tracking-tight">Nuevo Permiso de Bloqueo</h1>
							<p className="opacity-90">
								Crea un nuevo permiso de bloqueo y etiquetado de energía completando el formulario
							</p>
						</div>
					</div>
				</div>
			</div>

			<LockoutPermitForm
				userId={res.user.id}
				isOtcMember={isOtcMember}
				companyId={isOtcMember ? process.env.NEXT_PUBLIC_OTC_COMPANY_ID! : ""}
			/>
		</div>
	)
}
