"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
	EyeIcon,
	PenIcon,
	SendIcon,
	InfoIcon,
	UserIcon,
	UploadIcon,
	FolderIcon,
	ChevronLeft,
	FileTextIcon,
	ChevronRightIcon,
	CalendarX2Icon,
} from "lucide-react"

import { useStartupFolderDocuments } from "../../hooks/use-startup-folder-documents"
import { getCompanyEntities } from "../../actions/get-company-entities"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"
import {
	getDocumentsByCategory,
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"
import {
	ReviewStatus,
	DocumentCategory,
	BasicDocumentType,
	type WorkerDocumentType,
	type VehicleDocumentType,
	type EnvironmentalDocType,
	type SafetyAndHealthDocumentType,
} from "@prisma/client"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
import DeleteEntityDialog from "@/project/startup-folder/components/dialogs/DeleteEntityDialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { SubmitReviewRequestDialog } from "../dialogs/SubmitReviewRequestDialog"
import { UploadDocumentsDialog } from "../forms/UploadDocumentsDialog"
import { DocumentReviewForm } from "../dialogs/DocumentReviewForm"
import { VehicleFolderDocuments } from "./VehicleFolderDocuments"
import { WorkerFolderDocuments } from "./WorkerFolderDocuments"
import { LinkEntityDialog } from "../dialogs/LinkEntityDialog"
import { Progress } from "@/shared/components/ui/progress"
import { Button } from "@/shared/components/ui/button"
import {
	Table,
	TableRow,
	TableCell,
	TableBody,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

import type {
	StartupFolderDocument,
	EnvironmentalStartupFolderDocument,
	SafetyAndHealthStartupFolderDocument,
} from "../../types"

interface StartupFolderDocumentsProps {
	userId: string
	companyId: string
	onBack: () => void
	isOtcMember: boolean
	startupFolderId: string
	category: DocumentCategory
}

export const StartupFolderDocuments: React.FC<StartupFolderDocumentsProps> = ({
	onBack,
	userId,
	category,
	companyId,
	isOtcMember,
	startupFolderId,
}) => {
	const [selectedDocumentType, setSelectedDocumentType] = useState<{
		type:
			| WorkerDocumentType
			| VehicleDocumentType
			| EnvironmentalDocType
			| SafetyAndHealthDocumentType
			| BasicDocumentType
		name: string
	} | null>(null)
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
	const [selectedDocument, setSelectedDocument] = useState<StartupFolderDocument | null>(null)
	const [showUploadDialog, setShowUploadDialog] = useState(false)
	const [showSubmitDialog, setShowSubmitDialog] = useState(false)
	const [showLinkDialog, setShowLinkDialog] = useState(false)

	const { data, isLoading, refetch } = useStartupFolderDocuments({ startupFolderId, category })
	const documentsData = data?.documents ?? []

	const { title, documents } = getDocumentsByCategory(category)

	const fetchEntities = useCallback(async () => {
		try {
			if (
				category === DocumentCategory.PERSONNEL ||
				category === DocumentCategory.VEHICLES ||
				category === DocumentCategory.BASIC
			) {
				const { allEntities, vinculatedEntities } = await getCompanyEntities({
					companyId,
					category,
					startupFolderId,
				})
				setEntities(vinculatedEntities)
				setAllEntities(allEntities)
			}
		} catch (error) {
			console.error("Error fetching entities:", error)
			toast.error("Error al cargar las entidades")
		}
	}, [category, companyId, startupFolderId])

	useEffect(() => {
		fetchEntities()
	}, [fetchEntities])

	const documentsNotUploaded = documents.filter(
		(doc) => !documentsData.some((d) => d.type === doc.type)
	)

	const totalDocumentsToUpload =
		category === DocumentCategory.SAFETY_AND_HEALTH
			? SAFETY_AND_HEALTH_STRUCTURE.documents.length
			: ENVIRONMENTAL_STRUCTURE.documents.length

	const progress =
		data && documentsData.length > 0 ? (data.approvedDocuments / totalDocumentsToUpload) * 100 : 0

	if (selectedEntity) {
		if (category === DocumentCategory.PERSONNEL || category === DocumentCategory.BASIC) {
			return (
				<WorkerFolderDocuments
					userId={userId}
					category={category}
					companyId={companyId}
					isOtcMember={isOtcMember}
					workerId={selectedEntity.id}
					startupFolderId={startupFolderId}
					onBack={() => setSelectedEntity(null)}
				/>
			)
		} else if (category === DocumentCategory.VEHICLES) {
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
	}

	const isVehicleOrWorkerCategory =
		category === DocumentCategory.PERSONNEL ||
		category === DocumentCategory.VEHICLES ||
		category === DocumentCategory.BASIC

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{category !== DocumentCategory.BASIC && (
						<Button variant="outline" size={"sm"} className="gap-2" onClick={onBack}>
							<ChevronLeft className="h-4 w-4" />
							Volver
						</Button>
					)}
					<h2 className="text-lg font-bold">{title}</h2>

					{!isVehicleOrWorkerCategory && (
						<StartupFolderStatusBadge status={data?.folderStatus ?? "DRAFT"} />
					)}
				</div>

				{!isVehicleOrWorkerCategory && (
					<>
						<Progress
							value={progress}
							className="mr-2 ml-auto max-w-24"
							indicatorClassName="bg-emerald-600"
						/>
						<div className="text-xs font-medium">{progress.toFixed(0)}%</div>

						{!isOtcMember && data?.folderStatus === "DRAFT" && documentsData.length > 0 && (
							<Button
								className="ml-4 gap-2 bg-emerald-600 text-white transition-all hover:scale-105 hover:bg-emerald-700 hover:text-white"
								onClick={() => setShowSubmitDialog(true)}
							>
								<SendIcon className="h-4 w-4" />
								Enviar a revisión
							</Button>
						)}
					</>
				)}

				{!isOtcMember && isVehicleOrWorkerCategory && (
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={() => setShowLinkDialog(true)} className="gap-2">
							<FolderIcon className="h-4 w-4" />
							Vincular {category === DocumentCategory.VEHICLES ? "Vehículo" : "Personal"}
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
							<TableCell colSpan={7} className="h-24 text-center">
								Cargando documentos...
							</TableCell>
						</TableRow>
					) : isVehicleOrWorkerCategory ? (
						entities?.length > 0 ? (
							entities?.map((entity) => (
								<TableRow key={entity.id}>
									<TableCell
										className="cursor-pointer font-medium hover:text-teal-600"
										onClick={() => setSelectedEntity(entity)}
									>
										<div className="flex items-center gap-2">
											<FolderIcon className="h-4 w-4 text-teal-500" />
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
												entityCategory={
													category === DocumentCategory.PERSONNEL
														? "WORKER"
														: category === DocumentCategory.VEHICLES
															? "VEHICLE"
															: "BASIC"
												}
												onSuccess={() => {
													queryClient.invalidateQueries({
														queryKey: [
															"startupFolderDocuments",
															{ startupFolderId, category, workerId: null, vehicleId: null },
														],
													})
													refetch()
												}}
											/>
											<ChevronRightIcon className="h-4 w-4" />
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={7} className="h-24 text-center">
									No hay documentos subidos en esta subcarpeta
								</TableCell>
							</TableRow>
						)
					) : (
						documentsData.map((doc: StartupFolderDocument) => (
							<TableRow key={doc.id}>
								<TableCell className="font-medium">
									<div className="flex flex-col items-start justify-center">
										<div className="flex items-center gap-2">
											<FileTextIcon className="h-4 w-4 text-teal-500" />
											{doc.name}
										</div>

										{doc.reviewNotes && (
											<span
												className={cn("max-w-96 text-wrap text-rose-500", {
													"text-emerald-500": doc.status === ReviewStatus.APPROVED,
												})}
											>
												{doc.status === ReviewStatus.APPROVED ? "Aprobado" : "Rechazado"}:{" "}
												{doc.reviewNotes}
											</span>
										)}
									</div>
								</TableCell>
								<TableCell>
									<StartupFolderStatusBadge status={doc.status} />
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<UserIcon className="text-muted-foreground size-3.5" />
										{doc.uploadedBy?.name ?? "Usuario desconocido"}
									</div>
								</TableCell>
								<TableCell>
									{doc.uploadedAt ? format(new Date(doc.uploadedAt), "dd/MM/yyyy HH:mm") : "N/A"}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<CalendarX2Icon className="text-muted-foreground size-3.5" />
										{doc.expirationDate
											? format(new Date(doc.expirationDate), "dd/MM/yyyy")
											: "N/A"}
									</div>
								</TableCell>
								<TableCell>{doc.reviewer?.name ?? ""}</TableCell>
								<TableCell>
									{doc.reviewedAt ? format(new Date(doc.reviewedAt), "dd/MM/yyyy") : ""}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										{doc.url && (
											<Button
												size={"icon"}
												variant="ghost"
												className="text-teal-600"
												onClick={() => window.open(doc.url!, "_blank")}
											>
												<EyeIcon className="h-4 w-4" />
											</Button>
										)}

										{!isOtcMember &&
											data?.folderStatus === "DRAFT" &&
											(doc.status === "DRAFT" ||
												doc.status === "REJECTED" ||
												doc.status === "EXPIRED") && (
												<Button
													size={"icon"}
													variant="ghost"
													className="text-cyan-600"
													onClick={() => {
														const baseDoc = {
															id: doc.id,
															name: doc.name,
															url: doc.url,
															status: doc.status,
															uploadedBy: doc.uploadedBy,
															uploadedById: doc.uploadedById,
															uploadedAt: doc.uploadedAt,
															reviewedAt: doc.reviewedAt,
															reviewNotes: doc.reviewNotes,
															submittedAt: doc.submittedAt,
															expirationDate: doc.expirationDate,
															reviewerId: doc.reviewerId,
															folderId: doc.folderId,
														}

														let selectedDoc: StartupFolderDocument
														switch (category) {
															case DocumentCategory.SAFETY_AND_HEALTH: {
																const safetyDoc: SafetyAndHealthStartupFolderDocument = {
																	...baseDoc,
																	category: DocumentCategory.SAFETY_AND_HEALTH,
																	type: doc.type as SafetyAndHealthDocumentType,
																	reviewer: doc.reviewer,
																}
																selectedDoc = safetyDoc
																break
															}
															case DocumentCategory.ENVIRONMENTAL: {
																const envDoc: EnvironmentalStartupFolderDocument = {
																	...baseDoc,
																	category: DocumentCategory.ENVIRONMENTAL,
																	type: doc.type as EnvironmentalDocType,
																	reviewer: doc.reviewer,
																}
																selectedDoc = envDoc
																break
															}
															default:
																throw new Error(`Invalid category: ${category}`)
														}
														setSelectedDocumentType({ type: doc.type, name: doc.name })
														setSelectedDocument(selectedDoc)
														setShowUploadDialog(true)
													}}
												>
													<PenIcon className="h-4 w-4" />
												</Button>
											)}

										{isOtcMember && doc.status === "SUBMITTED" && (
											<DocumentReviewForm
												document={doc}
												userId={userId}
												refetch={refetch}
												category={category}
												startupFolderId={startupFolderId}
											/>
										)}
									</div>
								</TableCell>
							</TableRow>
						))
					)}

					{documentsNotUploaded.length > 0 &&
						!isVehicleOrWorkerCategory &&
						documentsNotUploaded.map((doc) => (
							<TableRow key={doc.name}>
								<TableCell className="font-medium">
									<div className="flex flex-col items-start justify-center">
										<div className="flex items-center gap-2">
											<FileTextIcon className="h-4 w-4 text-teal-500" />
											{doc.name}

											<Tooltip>
												<TooltipTrigger asChild>
													<Button variant="ghost" size="icon">
														<InfoIcon className="size-4 text-teal-500" />
													</Button>
												</TooltipTrigger>
												<TooltipContent className="w-fit max-w-96 text-pretty">
													{doc.description}
												</TooltipContent>
											</Tooltip>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<StartupFolderStatusBadge status={"NOT_UPLOADED"} />
								</TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										{!isOtcMember &&
											(data?.folderStatus === "DRAFT" || data?.folderStatus === "REJECTED") && (
												<Button
													size={"icon"}
													variant="ghost"
													className="text-cyan-600"
													onClick={() => {
														setShowUploadDialog(true)
														setSelectedDocumentType({ type: doc.type, name: doc.name })
													}}
												>
													<UploadIcon className="h-4 w-4" />
												</Button>
											)}
									</div>
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>

			{showUploadDialog && (
				<UploadDocumentsDialog
					userId={userId}
					category={category}
					isOpen={showUploadDialog}
					startupFolderId={startupFolderId}
					documentType={selectedDocumentType}
					documentToUpdate={selectedDocument}
					onClose={() => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
					}}
					onUploadComplete={() => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
					}}
				/>
			)}

			{showLinkDialog &&
				(category === "PERSONNEL" || category === "VEHICLES" || category === "BASIC") && (
					<LinkEntityDialog
						userId={userId}
						category={category}
						entities={allEntities}
						isOpen={showLinkDialog}
						startupFolderId={startupFolderId}
						onClose={() => setShowLinkDialog(false)}
						onSuccess={() => {
							queryClient.invalidateQueries({
								queryKey: [
									"startupFolderDocuments",
									{ startupFolderId, category, workerId: null, vehicleId: null },
								],
							})
							refetch()
							fetchEntities()
							setShowLinkDialog(false)
						}}
					/>
				)}

			{showSubmitDialog && (
				<SubmitReviewRequestDialog
					userId={userId}
					category={category}
					companyId={companyId}
					isOpen={showSubmitDialog}
					folderId={startupFolderId}
					onClose={() => setShowSubmitDialog(false)}
					onSuccess={async () => {
						queryClient.invalidateQueries({
							queryKey: [
								"startupFolderDocuments",
								{ startupFolderId, category, workerId: null, vehicleId: null },
							],
						})
						setShowSubmitDialog(false)
						await refetch()
						toast.success("Documentos envia	os a revisión exitosamente")
					}}
				/>
			)}
		</div>
	)
}
