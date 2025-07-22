import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import WorkRequestStatsContainer from "@/project/work-request/components/stats/WorkRequestStatsContainer"
import CreateWorkRequestButton from "@/project/work-request/components/forms/CreateWorkRequestForm"
import WorkRequestsTable from "@/project/work-request/components/forms/WorkRequestsTable"
import ScrollToTableButton from "@/shared/components/ScrollToTable"

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
		<div className="flex h-full w-full flex-1 flex-col gap-6">
			<div className="rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Solicitudes de Trabajo</h1>
						<p className="opacity-90">Gestión y aprobación de solicitudes de trabajo</p>
					</div>

					<div className="flex flex-wrap items-center justify-end gap-2">
						<ScrollToTableButton
							id="work-requests-list"
							label="Lista Solicitud"
							className="text-sky-600 hover:bg-white hover:text-sky-600"
						/>

						<CreateWorkRequestButton userId={session.user.id} />
					</div>
				</div>
			</div>

			<WorkRequestStatsContainer />

			<WorkRequestsTable hasPermission={hasPermission.success} id="work-requests-list" />
		</div>
	)
}
