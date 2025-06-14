import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { WorkPermitDataTable } from "@/features/work-permit/components/data/WorkPermitDataTable"
import Link from "next/link"
import { Button } from "@/shared/components/ui/button"
import { PlusCircleIcon } from "lucide-react"

export default async function WorkPermitPage() {
	const res = await auth.api.getSession({
		headers: await headers(),
	})

	if (!res || !res.user || !res.user.companyId) {
		return (
			<main className="flex h-screen items-center justify-center">
				<p>Acceso denegado</p>
			</main>
		)
	}

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8">
			<div className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Permisos de Trabajo</h1>
						<p className="opacity-90">Gestión de permisos de trabajo seguro</p>
					</div>

					<Link href="/dashboard/permiso-de-trabajo/agregar">
						<Button className="gap-1.5 bg-white font-semibold tracking-wide text-purple-600 transition-all hover:scale-105 hover:bg-white hover:text-purple-700">
							<PlusCircleIcon className="ml-1" />
							Nuevo Permiso de Trabajo
						</Button>
					</Link>
				</div>
			</div>

			<WorkPermitDataTable companyId={res.user.companyId!} />
		</div>
	)
}
