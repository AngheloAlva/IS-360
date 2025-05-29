import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { WorkPermitDataTable } from "@/components/sections/work-permit/WorkPermitDataTable"

export default async function WorkPermitPage() {
	const res = await auth.api.getSession({
		headers: await headers(),
	})

	if (!res || !res.user || res.user.companyId) {
		return (
			<main className="flex h-screen items-center justify-center">
				<p>Acceso denegado</p>
			</main>
		)
	}

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 overflow-hidden transition-all">
			<h1 className="w-fit text-3xl font-bold">Permisos de Trabajo Seguro</h1>

			<WorkPermitDataTable companyId={res.user.companyId!} />
		</div>
	)
}
