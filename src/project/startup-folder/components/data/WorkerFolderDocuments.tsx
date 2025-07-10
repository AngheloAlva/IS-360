"use client"

import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import {
	EyeIcon,
	SendIcon,
	InfoIcon,
	Undo2Icon,
	UploadIcon,
	PencilIcon,
	ChevronLeft,
	FileTextIcon,
} from "lucide-react"

import { getDocumentsByWorkerIsDriver } from "@/lib/consts/worker-folder-structure"
import { useWorkerFolderDocuments } from "../../hooks/use-worker-folder-documents"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { SubmitReviewRequestDialog } from "../dialogs/SubmitReviewRequestDialog"
import { UndoDocumentReviewDialog } from "../dialogs/UndoDocumentReviewDialog"
import { UploadDocumentsDialog } from "../forms/UploadDocumentsDialog"
import { DocumentReviewForm } from "../dialogs/DocumentReviewForm"
import { Progress } from "@/shared/components/ui/progress"
import { Button } from "@/shared/components/ui/button"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

import type { WorkerStartupFolderDocument } from "@/project/startup-folder/types"
import type { WorkerDocumentType } from "@prisma/client"

interface WorkerFolderDocumentsProps {
	userId: string
	workerId: string
	companyId: string
	workerName: string
	onBack: () => void
	isOtcMember: boolean
	startupFolderId: string
}

export function WorkerFolderDocuments({
	onBack,
	userId,
	workerId,
	companyId,
	workerName,
	isOtcMember,
	startupFolderId,
}: WorkerFolderDocumentsProps) {
	const [selectedDocument, setSelectedDocument] = useState<WorkerStartupFolderDocument | null>(null)
	const [selectedDocumentType, setSelectedDocumentType] = useState<{
		type: WorkerDocumentType
		name: string
	} | null>(null)
	const [showUploadDialog, setShowUploadDialog] = useState(false)
	const [showSubmitDialog, setShowSubmitDialog] = useState(false)
	const [showUndoDialog, setShowUndoDialog] = useState(false)
	const [documentToUndo, setDocumentToUndo] = useState<WorkerStartupFolderDocument | null>(null)

	const { data, isLoading, refetch } = useWorkerFolderDocuments({
		startupFolderId,
		workerId,
	})
	const documentsData = data?.documents ?? []

	const { documents } = getDocumentsByWorkerIsDriver("PERSONNEL", data?.isDriver)

	const documentsNotUploaded = documents.filter(
		(doc) => !documentsData.some((d) => d.type === doc.type)
	)

	const progress =
		data && documentsData.length > 0 ? (data.approvedDocuments / documents.length) * 100 : 0

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button variant="outline" size={"sm"} className="gap-2" onClick={onBack}>
						<ChevronLeft className="h-4 w-4" />
						Volver
					</Button>
					<h2 className="text-lg font-bold">{workerName}</h2>

					<StartupFolderStatusBadge status={data?.folderStatus ?? "DRAFT"} />
				</div>

				<Progress
					value={progress}
					className="mr-2 ml-auto max-w-24"
					indicatorClassName="bg-emerald-600"
				/>
				<div className="text-xs font-medium">{progress.toFixed(0)}%</div>

				{!isOtcMember && data?.folderStatus === "DRAFT" && (
					<Button
						className="ml-4 gap-2 bg-emerald-600 text-white transition-all hover:scale-105 hover:bg-emerald-700 hover:text-white"
						onClick={() => setShowSubmitDialog(true)}
					>
						<SendIcon className="h-4 w-4" />
						Enviar a revisión
					</Button>
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
						<TableCell>Revisado por</TableCell>
						<TableCell>Revisado el</TableCell>
						<TableHead className="w-[100px]"></TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{isLoading ? (
						<TableRow>
							<TableCell colSpan={8} className="h-24 text-center">
								Cargando documentos...
							</TableCell>
						</TableRow>
					) : (
						documentsData.length > 0 &&
						documentsData.map((doc) => (
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
								<TableCell>{doc.uploadedBy?.name ?? "Usuario desconocido"}</TableCell>
								<TableCell>
									{doc.uploadedAt ? format(new Date(doc.uploadedAt), "dd/MM/yyyy HH:mm") : "N/A"}
								</TableCell>
								<TableCell
									className={cn({
										"font-semibold text-rose-500":
											doc.expirationDate && doc.expirationDate < new Date(),
									})}
								>
									{doc.expirationDate ? format(new Date(doc.expirationDate), "dd/MM/yyyy") : "N/A"}
								</TableCell>
								<TableCell>{doc.reviewer?.name ?? ""}</TableCell>
								<TableCell>
									{doc.reviewedAt ? format(new Date(doc.reviewedAt), "dd/MM/yyyy HH:mm") : ""}
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
											(doc.status === "DRAFT" ||
												doc.status === "REJECTED" ||
												doc.status === "EXPIRED") && (
												<Button
													size={"icon"}
													variant="ghost"
													className="text-cyan-600"
													onClick={() => {
														setSelectedDocument(doc)
														setShowUploadDialog(true)
													}}
												>
													<PencilIcon className="h-4 w-4" />
												</Button>
											)}

										{isOtcMember && doc.status === "SUBMITTED" && (
											<DocumentReviewForm
												document={doc}
												userId={userId}
												refetch={refetch}
												workerId={workerId}
												startupFolderId={startupFolderId}
												category={DocumentCategory.PERSONNEL}
											/>
										)}

										{isOtcMember && (doc.status === "APPROVED" || doc.status === "REJECTED") && (
											<Button
												size={"icon"}
												variant="ghost"
												className="text-amber-500"
												onClick={() => {
													setDocumentToUndo(doc)
													setShowUndoDialog(true)
												}}
											>
												<Undo2Icon className="h-4 w-4" />
											</Button>
										)}
									</div>
								</TableCell>
							</TableRow>
						))
					)}

					{documentsNotUploaded.length > 0 &&
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
					workerId={workerId}
					isOpen={showUploadDialog}
					startupFolderId={startupFolderId}
					documentType={selectedDocumentType}
					documentToUpdate={selectedDocument}
					category={DocumentCategory.PERSONNEL}
					onClose={() => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
						queryClient.invalidateQueries({
							queryKey: [
								"workerFolderDocuments",
								{
									workerId,
									startupFolderId,
								},
							],
						})
					}}
					onUploadComplete={async () => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
						await refetch()
					}}
				/>
			)}

			{showSubmitDialog && (
				<SubmitReviewRequestDialog
					userId={userId}
					workerId={workerId}
					companyId={companyId}
					isOpen={showSubmitDialog}
					folderId={startupFolderId}
					category={DocumentCategory.PERSONNEL}
					onClose={() => setShowSubmitDialog(false)}
					onSuccess={async () => {
						queryClient.invalidateQueries({
							queryKey: ["workerFolderDocuments", { startupFolderId, workerId }],
						})
						setShowSubmitDialog(false)
						await refetch()
						toast.success("Documentos enviados a revisión exitosamente")
					}}
				/>
			)}

			{showUndoDialog && documentToUndo && (
				<UndoDocumentReviewDialog
					userId={userId}
					isOpen={showUndoDialog}
					documentId={documentToUndo.id}
					category={DocumentCategory.PERSONNEL}
					onClose={() => {
						setShowUndoDialog(false)
						setDocumentToUndo(null)
					}}
					onSuccess={async () => {
						queryClient.invalidateQueries({
							queryKey: ["workerFolderDocuments", { startupFolderId, workerId }],
						})
						setShowUndoDialog(false)
						setDocumentToUndo(null)
						await refetch()
						toast.success("Revisión de documento revertida exitosamente")
					}}
				/>
			)}
		</div>
	)
}
