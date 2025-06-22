import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import WorkPermitForm from "@/project/work-permit/components/forms/WorkPermitForm"
import { WorkPermit } from "@/project/work-permit/hooks/use-work-permit"
import BackButton from "@/shared/components/BackButton"
import { USER_ROLE } from "@prisma/client"

export default async function UpdateWorkPermitPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const res = await auth.api.getSession({
		headers: await headers(),
	})
	const cookie = (await headers()).get("cookie")

	if (!res || !cookie) {
		return (
			<main className="flex h-screen items-center justify-center">
				<p>Acceso denegado</p>
			</main>
		)
	}

	const { id } = await params

	const workPermit: WorkPermit = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/work-permit/${id}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				cookie,
			},
		}
	).then((res) => res.json())

	return (
		<div className="mx-auto flex h-full w-full max-w-screen-xl flex-1 flex-col gap-4">
			<div className="rounded-lg bg-gradient-to-r from-pink-600 to-rose-700 p-6">
				<div className="flex items-center justify-between">
					<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-3">
						<BackButton
							href="/admin/dashboard/permisos-de-trabajo"
							className="bg-white/30 text-white hover:bg-white/50"
						/>

						<div className="text-white">
							<h1 className="text-3xl font-bold tracking-tight">Actualizar Permiso de Trabajo</h1>
							<p className="opacity-90">Actualiza el permiso de trabajo</p>
						</div>
					</div>
				</div>
			</div>

			<WorkPermitForm
				userId={res.user.id}
				userName={res.user.name}
				initialValues={workPermit}
				companyId={workPermit.company.id}
				isOtcMember={res.user.accessRole === USER_ROLE.ADMIN}
			/>
		</div>
	)
}
