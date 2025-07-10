"use client"

import { useCallback, useEffect, useState } from "react"
import { FolderIcon } from "lucide-react"
import { toast } from "sonner"

import { getBasicEntities } from "../../actions/basic/get-basic-entities"
import { ReviewStatus, DocumentCategory } from "@prisma/client"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
import DeleteEntityDialog from "@/project/startup-folder/components/dialogs/DeleteEntityDialog"
import { LinkEntityDialog } from "../dialogs/LinkEntityDialog"
import { BasicFolderDocuments } from "./BasicFolderDocuments"
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
	isOtcMember: boolean
	startupFolderId: string
}

export const BasicFolder: React.FC<WorkerFolderProps> = ({
	userId,
	companyId,
	isOtcMember,
	startupFolderId,
}) => {
	const [selectedEntity, setSelectedEntity] = useState<{
		id: string
		name: string
		status: ReviewStatus
	} | null>(null)
	const [allEntities, setAllEntities] = useState<
		Array<{ id: string; name: string; status: ReviewStatus }>
	>([])
	const [entities, setEntities] = useState<
		Array<{ id: string; name: string; status: ReviewStatus }>
	>([])
	const [showLinkDialog, setShowLinkDialog] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	const fetchEntities = useCallback(async () => {
		try {
			const { allEntities, vinculatedEntities } = await getBasicEntities({
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
			<BasicFolderDocuments
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
		<div className="space-y-2">
			<div className="flex w-full items-center justify-end">
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
															workerId: null,
															vehicleId: null,
															startupFolderId,
															category: DocumentCategory.BASIC,
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
					category={DocumentCategory.BASIC}
					onClose={() => setShowLinkDialog(false)}
					onSuccess={() => {
						queryClient.invalidateQueries({
							queryKey: [
								"startupFolderDocuments",
								{
									workerId: null,
									vehicleId: null,
									startupFolderId,
									category: DocumentCategory.BASIC,
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
