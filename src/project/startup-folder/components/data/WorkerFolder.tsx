"use client"

import { useCallback, useEffect, useState } from "react"
import { FolderIcon, ChevronLeft } from "lucide-react"
import { toast } from "sonner"

import { getWorkerEntities } from "../../actions/worker/get-worker-entities"
import { ReviewStatus, DocumentCategory } from "@prisma/client"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
import DeleteEntityDialog from "@/project/startup-folder/components/dialogs/DeleteEntityDialog"
import { WorkerFolderDocuments } from "./WorkerFolderDocuments"
import { LinkEntityDialog } from "../dialogs/LinkEntityDialog"
import { Button } from "@/shared/components/ui/button"
import {
	Table,
	TableRow,
	TableCell,
	TableBody,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

interface WorkerFolderProps {
	userId: string
	companyId: string
	onBack: () => void
	isOtcMember: boolean
	startupFolderId: string
}

export default function WorkerFolder({
	onBack,
	userId,
	companyId,
	isOtcMember,
	startupFolderId,
}: WorkerFolderProps) {
	const [selectedEntity, setSelectedEntity] = useState<{
		id: string
		name: string
		status: ReviewStatus
		rut: string
	} | null>(null)
	const [allEntities, setAllEntities] = useState<
		Array<{ id: string; name: string; status: ReviewStatus; rut: string }>
	>([])
	const [entities, setEntities] = useState<
		Array<{ id: string; name: string; status: ReviewStatus; rut: string }>
	>([])
	const [showLinkDialog, setShowLinkDialog] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	const fetchEntities = useCallback(async () => {
		try {
			const { allEntities, vinculatedEntities } = await getWorkerEntities({
				companyId,
				startupFolderId,
			})
			setEntities(vinculatedEntities)
			setAllEntities(allEntities)
			setIsLoading(false)
		} catch (error) {
			console.error("Error fetching entities:", error)
			toast.error("Error al cargar las entidades")
		}
	}, [companyId, startupFolderId])

	useEffect(() => {
		fetchEntities()
	}, [fetchEntities])

	if (selectedEntity) {
		return (
			<WorkerFolderDocuments
				userId={userId}
				companyId={companyId}
				isOtcMember={isOtcMember}
				workerId={selectedEntity.id}
				workerName={selectedEntity.name}
				startupFolderId={startupFolderId}
				onBack={() => setSelectedEntity(null)}
			/>
		)
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button variant="outline" size={"sm"} className="gap-2" onClick={onBack}>
						<ChevronLeft className="h-4 w-4" />
						Volver
					</Button>

					<h2 className="text-lg font-bold">Documentación Personal</h2>
				</div>

				{!isOtcMember && (
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={() => setShowLinkDialog(true)} className="gap-2">
							<FolderIcon className="h-4 w-4" />
							Vincular Personal
						</Button>
					</div>
				)}
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nombre</TableHead>
						<TableHead>RUT</TableHead>
						<TableHead>Estado</TableHead>
						<TableHead>Subido por</TableHead>
						<TableHead>Subido el</TableHead>
						<TableHead>Vencimiento</TableHead>
						<TableHead>Revisado por</TableHead>
						<TableHead>Revisado el</TableHead>
						<TableHead></TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{isLoading ? (
						<TableRow>
							<TableCell colSpan={8} className="h-24 text-center">
								Cargando colaboradores...
							</TableCell>
						</TableRow>
					) : (
						entities?.map((entity) => (
							<TableRow key={entity.id} className="group">
								<TableCell
									className="cursor-pointer font-medium group-hover:text-teal-600"
									onClick={() => setSelectedEntity(entity)}
								>
									<div
										className={cn("flex items-center gap-2", {
											"text-yellow-500": entity.status === "SUBMITTED",
										})}
									>
										<FolderIcon
											className={cn("h-4 w-4 text-teal-500", {
												"text-yellow-500": entity.status === "SUBMITTED",
											})}
										/>
										{entity.name}
									</div>
								</TableCell>
								<TableCell>{entity.rut}</TableCell>
								<TableCell>
									<StartupFolderStatusBadge status={entity.status} />
								</TableCell>
								<TableCell
									colSpan={5}
									onClick={() => setSelectedEntity(entity)}
									className="cursor-pointer group-hover:text-teal-600"
								></TableCell>
								<TableCell>
									<div className="flex w-fit items-center gap-2">
										<DeleteEntityDialog
											entityId={entity.id}
											entityName={entity.name}
											folderId={startupFolderId}
											entityCategory={"WORKER"}
											onSuccess={() => {
												queryClient.invalidateQueries({
													queryKey: [
														"startupFolderDocuments",
														{
															startupFolderId,
															category: DocumentCategory.PERSONNEL,
															workerId: null,
															vehicleId: null,
														},
													],
												})
												fetchEntities()
											}}
										/>
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			{showLinkDialog && (
				<LinkEntityDialog
					entities={allEntities}
					isOpen={showLinkDialog}
					startupFolderId={startupFolderId}
					category={DocumentCategory.PERSONNEL}
					onClose={() => setShowLinkDialog(false)}
					onSuccess={() => {
						queryClient.invalidateQueries({
							queryKey: [
								"startupFolderDocuments",
								{
									startupFolderId,
									category: DocumentCategory.PERSONNEL,
									workerId: null,
									vehicleId: null,
								},
							],
						})
						fetchEntities()
						setShowLinkDialog(false)
					}}
				/>
			)}
		</div>
	)
}
