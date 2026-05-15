import { headers } from "next/headers"
import { auth } from "@/lib/auth"

import LockoutPermitPDFViewer from "@/project/lockout-permit/components/pdf/LockoutPermitPDFViewer"
import BackButton from "@/shared/components/BackButton"

export default async function LockoutPermitPdfAdminPage({
	params,
}: {
	params: Promise<{ id: string; lockoutPermitId: string }>
}): Promise<React.ReactElement> {
	const { lockoutPermitId } = await params

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
			<div className="rounded-lg bg-linear-to-r from-pink-600 to-rose-700 p-6">
				<div className="flex items-center justify-between">
					<div className="mx-auto flex w-full max-w-7xl items-center justify-start gap-3">
						<BackButton
							href={`/admin/dashboard/permisos-de-trabajo/`}
							className="bg-white/30 text-white hover:bg-white/50"
						/>

						<div className="text-white">
							<h1 className="text-3xl font-bold tracking-tight">Permiso de Bloqueo</h1>
							<p className="opacity-90">Vista previa del permiso de bloqueo</p>
						</div>
					</div>
				</div>
			</div>

			<LockoutPermitPDFViewer lockoutPermitId={lockoutPermitId} />
		</main>
	)
}
