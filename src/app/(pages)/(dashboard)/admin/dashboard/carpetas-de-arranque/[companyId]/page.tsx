import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"

import { getFirstStartupFolder } from "@/project/startup-folder/actions/get-first-startup-folder"
import { auth } from "@/lib/auth"

export default async function StartupFolderReviewPage({
	params,
}: {
	params: Promise<{ companyId: string }>
}) {
	const asyncParams = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				startupFolder: ["create"],
			},
		},
	})

	const companyId = asyncParams.companyId.split("_")[1]

	if (!companyId) return notFound()

	const firstActiveFolder = await getFirstStartupFolder({
		companyId,
	})

	if (firstActiveFolder) {
		redirect(
			`/admin/dashboard/carpetas-de-arranque/${asyncParams.companyId}/${firstActiveFolder.id}`
		)
	}

	const firstArchivedFolder = await getFirstStartupFolder({
		companyId,
		archivedOnly: true,
	})

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-xl border border-dashed p-6 text-center md:p-10">
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold">No hay carpetas activas para esta empresa</h1>
				<p className="text-muted-foreground">
					No encontramos carpetas de arranque disponibles para cargar esta vista.
				</p>
			</div>

			<div className="flex flex-wrap items-center justify-center gap-3">
				{firstArchivedFolder && (
					<Link
						href={`/admin/dashboard/carpetas-de-arranque/${asyncParams.companyId}/archivadas/${firstArchivedFolder.id}`}
						className="inline-flex h-9 items-center justify-center rounded-md bg-amber-500 px-4 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-600"
					>
						Ver primera carpeta archivada
					</Link>
				)}

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
