import { headers } from "next/headers"
import { auth } from "@/lib/auth"

import LockoutPermitPDFViewer from "@/project/lockout-permit/components/pdf/LockoutPermitPDFViewer"
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
		<main className="flex w-full flex-1 flex-col gap-2">
			<BackButton
				href="/admin/dashboard/solicitudes-de-bloqueo"
				className="size-7 bg-lime-500/10 text-lime-500 hover:bg-lime-500/20"
			/>

			<LockoutPermitPDFViewer lockoutPermitId={id} />
		</main>
	)
}
