"use client"

import { FolderIcon, ChevronLeft, ChevronRightIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { getVehicleEntities } from "../../actions/vehicle/get-vehicle-entities"
import { getVehicleDocuments } from "@/lib/consts/vehicle-folder-structure"
import { type ReviewStatus, DocumentCategory } from "@prisma/client"
import { cn } from "@/lib/utils"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
import DeleteEntityDialog from "@/project/startup-folder/components/dialogs/DeleteEntityDialog"
import { VehicleFolderDocuments } from "./VehicleFolderDocuments"
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

interface VehicleFolderProps {
	userId: string
	companyId: string
	onBack: () => void
	isOtcMember: boolean
	startupFolderId: string
}

export default function VehicleFolder({
	onBack,
	userId,
	companyId,
	isOtcMember,
	startupFolderId,
}: VehicleFolderProps) {
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

	const { documents } = getVehicleDocuments()

	const fetchEntities = useCallback(async () => {
		try {
			const { allEntities, vinculatedEntities } = await getVehicleEntities({
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
			<VehicleFolderDocuments
				userId={userId}
				companyId={companyId}
				documents={documents}
				isOtcMember={isOtcMember}
				vehicleId={selectedEntity.id}
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

					<h2 className="text-lg font-bold">Vehículos y Equipos</h2>
				</div>

				{!isOtcMember && (
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={() => setShowLinkDialog(true)} className="gap-2">
							<FolderIcon className="h-4 w-4" />
							Vincular Vehículo
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
						<TableHead className="w-[100px]"></TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{isLoading ? (
						<TableRow>
							<TableCell colSpan={8} className="h-24 text-center">
								Cargando vehículos y/o equipos...
							</TableCell>
						</TableRow>
					) : entities?.length > 0 ? (
						entities?.map((entity) => (
							<TableRow key={entity.id}>
								<TableCell
									className="cursor-pointer font-medium hover:text-teal-600"
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
								<TableCell colSpan={5}></TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<DeleteEntityDialog
											entityId={entity.id}
											entityName={entity.name}
											folderId={startupFolderId}
											entityCategory={"VEHICLE"}
											onSuccess={() => {
												fetchEntities()
											}}
										/>
										<ChevronRightIcon className="h-4 w-4" />
									</div>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={8} className="h-24 text-center">
								No hay vehículos y/o equipos vinculados
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			{showLinkDialog && (
				<LinkEntityDialog
					entities={allEntities}
					isOpen={showLinkDialog}
					startupFolderId={startupFolderId}
					category={DocumentCategory.VEHICLES}
					onClose={() => setShowLinkDialog(false)}
					onSuccess={() => {
						fetchEntities()
						setShowLinkDialog(false)
					}}
				/>
			)}
		</div>
	)
}
