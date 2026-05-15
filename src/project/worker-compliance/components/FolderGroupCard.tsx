import { FolderIcon } from "lucide-react"

import { FolderStatusCard } from "@/project/worker-compliance/components/FolderStatusCard"
import type {
	WorkerComplianceFolder,
	WorkerComplianceWorkerFolder,
} from "@/project/worker-compliance/types/worker-compliance"

interface FolderGroupCardProps {
	startupFolderName: string
	workerFolder: WorkerComplianceWorkerFolder | null
	basicFolder: WorkerComplianceFolder | null
}

export function FolderGroupCard({
	startupFolderName,
	workerFolder,
	basicFolder,
}: FolderGroupCardProps) {
	// Don't render if worker has neither folder in this startup folder
	if (!workerFolder && !basicFolder) return null

	return (
		<div className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm">
			<div className="flex items-center gap-2 border-b pb-2">
				<FolderIcon className="size-4 text-muted-foreground" />
				<h3 className="text-sm font-semibold">{startupFolderName}</h3>
			</div>

			<div className="flex flex-col gap-2">
				{workerFolder && (
					<FolderStatusCard
						title="Carpeta del Trabajador"
						status={workerFolder.status}
						docCount={workerFolder.documents.length}
						isDriver={workerFolder.isDriver}
					/>
				)}
				{basicFolder && (
					<FolderStatusCard
						title="Carpeta Básica"
						status={basicFolder.status}
						docCount={basicFolder.documents.length}
					/>
				)}
			</div>
		</div>
	)
}
