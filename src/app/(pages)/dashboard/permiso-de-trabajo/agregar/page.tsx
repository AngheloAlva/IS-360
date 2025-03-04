import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import WorkPermitForm from "@/components/forms/work-permit/WorkPermitForm"

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
		<main className="flex flex-col items-center gap-14 p-4 pb-20 lg:p-8 lg:pb-32">
			<h1 className="w-fit text-3xl font-bold">Nuevo Permiso de Trabajo Seguro</h1>

			<WorkPermitForm userId={res.user.id} />
		</main>
	)
}
