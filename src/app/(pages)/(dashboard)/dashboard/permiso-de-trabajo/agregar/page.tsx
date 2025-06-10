import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import WorkPermitForm from "@/components/forms/work-permit/WorkPermitForm"
import BackButton from "@/components/shared/BackButton"

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

	return (
		<div className="mx-auto flex h-full w-full max-w-screen-xl flex-1 flex-col gap-4">
			<div className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-3">
						<BackButton
							href="/dashboard/permiso-de-trabajo"
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
				userId={res.user.id}
				userName={res.user.name}
				companyId={res.user.companyId!}
			/>
		</div>
	)
}
