import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"

import { getFirstStartupFolder } from "@/project/startup-folder/actions/get-first-startup-folder"
import { auth } from "@/lib/auth"

export default async function AdminArchivedStartupFoldersPage({
	params,
}: {
	params: Promise<{ companyId: string }>
}) {
	const { companyId: companyPathParam } = await params

	const session = await auth.api.getSession({ headers: await headers() })
	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				startupFolder: ["create"],
			},
		},
	})

	const companyId = companyPathParam.split("_")[1]
	if (!companyId) return notFound()

	const firstArchivedFolder = await getFirstStartupFolder({
		companyId,
		archivedOnly: true,
	})

	if (firstArchivedFolder) {
		redirect(
			`/admin/dashboard/carpetas-de-arranque/${companyPathParam}/archivadas/${firstArchivedFolder.id}`
		)
	}

	const firstActiveFolder = await getFirstStartupFolder({ companyId })

	if (firstActiveFolder) {
		redirect(`/admin/dashboard/carpetas-de-arranque/${companyPathParam}/${firstActiveFolder.id}`)
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-xl border border-dashed p-6 text-center md:p-10">
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold">No hay carpetas archivadas disponibles</h1>
				<p className="text-muted-foreground">
					Esta empresa no tiene carpetas archivadas ni activas para mostrar.
				</p>
			</div>

			<div className="flex flex-wrap items-center justify-center gap-3">
				<Link
					href="/admin/dashboard/carpetas-de-arranque"
					className="hover:bg-accent inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors"
				>
					Volver a la lista
				</Link>
			</div>
		</div>
	)
}
