import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { getWorkerComplianceData } from "@/project/worker-compliance/lib/get-worker-compliance-data"
import { assertCanView, ForbiddenError } from "@/project/worker-compliance/lib/permissions"
import { WorkerComplianceCard } from "@/project/worker-compliance/components/WorkerComplianceCard"
import { AccessDenied } from "@/project/worker-compliance/components/AccessDenied"

export default async function WorkerCompliancePage({
	params,
}: {
	params: Promise<{ workerId: string }>
}) {
	const { workerId } = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		notFound()
	}

	try {
		await assertCanView(session.user, workerId)
	} catch (err) {
		if (err instanceof ForbiddenError) return <AccessDenied />
		throw err
	}

	const data = await getWorkerComplianceData(workerId)

	if (!data) {
		notFound()
	}

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-4">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold">Ficha de Cumplimiento</h1>
				<p className="text-muted-foreground text-sm">
					Estado de documentación y charlas de seguridad del trabajador.
				</p>
			</div>

			<WorkerComplianceCard data={data} />
		</div>
	)
}
