import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import CreateWorkRequestButton from "@/project/work-request/components/forms/CreateWorkRequestForm"
import WorkRequestsTable from "@/project/work-request/components/forms/WorkRequestsTable"

// Utilizaremos el tipo WorkRequestWithDetails de work-requests-table.tsx

export default async function WorkRequestsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				workRequest: ["create"],
			},
		},
	})

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8">
			<div className="rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Solicitudes de Trabajo</h1>
						<p className="opacity-90">Gestión y aprobación de solicitudes de trabajo</p>
					</div>

					{hasPermission.success && <CreateWorkRequestButton userId={session.user.id} />}
				</div>
			</div>

			<WorkRequestsTable />
		</div>
	)
}
