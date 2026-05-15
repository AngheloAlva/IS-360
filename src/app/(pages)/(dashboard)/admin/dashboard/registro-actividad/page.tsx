import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { ActivityLogsTable } from "@/project/activity-log/components/data/ActivityLogsTable"

export default async function AdminActivityLogsPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="rounded-lg bg-linear-to-r from-purple-600 to-indigo-700 p-6">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Registro de Actividad</h1>
						<p className="opacity-90">
							Historial de acciones realizadas en el sistema
						</p>
					</div>
				</div>
			</div>

			<ActivityLogsTable />
		</div>
	)
}
