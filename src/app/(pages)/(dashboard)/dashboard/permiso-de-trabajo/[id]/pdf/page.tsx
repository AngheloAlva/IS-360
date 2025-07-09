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
		<main className="flex w-full flex-1 flex-col gap-2">
			<BackButton href="/dashboard/permiso-de-trabajo" className="size-7 bg-white/30" />

			<WorkPermitPDFViewer workPermitId={id} />
		</main>
	)
}
