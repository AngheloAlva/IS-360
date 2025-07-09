import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import WorkPermitPDFViewer from "@/project/work-permit/components/pdf/WorkPermitPDFViewer"
import BackButton from "@/shared/components/BackButton"

export default async function page({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<React.ReactElement> {
	const { id } = await params

	const session = await auth.api.getSession({
		headers: await headers(),
		query: {
			disableCookieCache: true,
		},
	})

	if (!session) {
		return (
			<main className="flex h-screen items-center justify-center">
				<p>Acceso denegado</p>
			</main>
		)
	}

	return (
		<main className="flex w-full flex-1 flex-col gap-4">
			<div className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
				<div className="flex items-center justify-between">
					<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-3">
						<BackButton
							href="/dashboard/permiso-de-trabajo"
							className="bg-white/30 text-white hover:bg-white/50"
						/>

						<div className="text-white">
							<h1 className="text-3xl font-bold tracking-tight">Permiso de Trabajo</h1>
							<p className="opacity-90">Vista previa del permiso de trabajo</p>
						</div>
					</div>
				</div>
			</div>

			<WorkPermitPDFViewer workPermitId={id} />
		</main>
	)
}
