import { computeTrafficLight } from "@/project/worker-compliance/lib/compute-traffic-light"

import { GlobalTrafficLight } from "./GlobalTrafficLight"
import { SafetyTalksSection } from "./SafetyTalksSection"
import { FolderGroupCard } from "./FolderGroupCard"
import { WorkerHeader } from "./WorkerHeader"

import type { WorkerComplianceData } from "@/project/worker-compliance/types/worker-compliance"

interface WorkerComplianceCardProps {
	data: WorkerComplianceData
}

export function WorkerComplianceCard({ data }: WorkerComplianceCardProps) {
	const trafficLight = computeTrafficLight(data)

	// Group workerFolders and basicFolders by startupFolderId
	const startupFolderIds = new Set([
		...data.workerFolder.map((f) => f.startupFolderId),
		...data.basicFolder.map((f) => f.startupFolderId),
	])

	const groups = Array.from(startupFolderIds).map((sfId) => {
		const workerFolder = data.workerFolder.find((f) => f.startupFolderId === sfId) ?? null
		const basicFolder = data.basicFolder.find((f) => f.startupFolderId === sfId) ?? null

		const startupFolderName =
			workerFolder?.startupFolder.name ?? basicFolder?.startupFolder.name ?? sfId

		return { sfId, startupFolderName, workerFolder, basicFolder }
	})

	return (
		<div className="flex flex-col gap-4">
			<WorkerHeader
				name={data.name}
				rut={data.rut}
				company={data.company?.name ?? null}
				role={data.internalRole ?? data.role}
				image={data.image}
			/>

			<GlobalTrafficLight trafficLight={trafficLight} />

			<SafetyTalksSection safetyTalks={data.safetyTalks} />

			{groups.map((group) => (
				<FolderGroupCard
					key={group.sfId}
					startupFolderName={group.startupFolderName}
					workerFolder={group.workerFolder}
					basicFolder={group.basicFolder}
				/>
			))}

			{groups.length === 0 && (
				<div className="bg-card text-muted-foreground rounded-xl border p-6 text-center text-sm">
					Este trabajador no tiene carpetas de arranque activas.
				</div>
			)}
		</div>
	)
}
