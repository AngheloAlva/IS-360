"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
	EyeIcon,
	SendIcon,
	InfoIcon,
	UploadIcon,
	PencilIcon,
	ChevronLeft,
	FileTextIcon,
} from "lucide-react"

import { useStartupFolderDocuments } from "../../hooks/use-startup-folder-documents"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { SubmitReviewRequestDialog } from "../dialogs/SubmitReviewRequestDialog"
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

import type { StartupFolderDocument } from "@/project/startup-folder/types"
import type {
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	SafetyAndHealthDocumentType,
} from "@prisma/client"

interface WorkerFolderDocumentsProps {
	userId: string
	workerId: string
	companyId: string
	onBack: () => void
	isOtcMember: boolean
	startupFolderId: string
	documents: {
		name: string
		description?: string
		type:
			| SafetyAndHealthDocumentType
			| VehicleDocumentType
			| WorkerDocumentType
			| EnvironmentalDocType
	}[]
}

export function WorkerFolderDocuments({
	onBack,
	userId,
	workerId,
	companyId,
	documents,
	isOtcMember,
	startupFolderId,
}: WorkerFolderDocumentsProps) {
	const [selectedDocument, setSelectedDocument] = useState<StartupFolderDocument | null>(null)
	const [selectedDocumentType, setSelectedDocumentType] = useState<{
		type:
			| WorkerDocumentType
			| VehicleDocumentType
			| EnvironmentalDocType
			| SafetyAndHealthDocumentType
		name: string
	} | null>(null)
	const [showUploadDialog, setShowUploadDialog] = useState(false)
	const [showSubmitDialog, setShowSubmitDialog] = useState(false)

	const { data, isLoading, refetch } = useStartupFolderDocuments({
		category: DocumentCategory.PERSONNEL,
		startupFolderId,
		workerId,
	})
	const documentsData = data?.documents ?? []

	const documentsNotUploaded = documents.filter(
		(doc) => !documentsData.some((d) => d.type === doc.type)
	)

	const progress =
		data && documentsData.length > 0 ? (data.approvedDocuments / documentsData.length) * 100 : 0

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button variant="outline" size={"sm"} className="gap-2" onClick={onBack}>
						<ChevronLeft className="h-4 w-4" />
						Volver
					</Button>
					<h2 className="text-lg font-bold">Documentación de personal</h2>
				</div>

				<Progress
					value={progress}
					className="mr-4 ml-auto max-w-24"
					indicatorClassName="bg-emerald-600"
				/>

				{!isOtcMember && data?.folderStatus === "DRAFT" && documents.length > 0 && (
					<Button
						className="gap-2 bg-emerald-600 text-white transition-all hover:scale-105 hover:bg-emerald-700 hover:text-white"
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
						<TableHead>Fecha de vencimiento</TableHead>
						<TableCell>Revisado por</TableCell>
						<TableCell>Revisado el</TableCell>
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
									{doc.expirationDate ? new Date(doc.expirationDate).toLocaleDateString() : "N/A"}
								</TableCell>
								<TableCell>{doc.reviewer?.name ?? ""}</TableCell>
								<TableCell>
									{doc.reviewedAt ? new Date(doc.reviewedAt).toLocaleDateString() : ""}
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
										{!isOtcMember && (
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
					category="PERSONNEL"
					userId={userId}
					workerId={workerId}
					isOpen={showUploadDialog}
					startupFolderId={startupFolderId}
					documentType={selectedDocumentType}
					documentToUpdate={selectedDocument}
					onClose={() => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
						queryClient.invalidateQueries({
							queryKey: [
								"startupFolderDocuments",
								{ startupFolderId, category: DocumentCategory.PERSONNEL, workerId },
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
							queryKey: [
								"startupFolderDocuments",
								{ startupFolderId, category: DocumentCategory.PERSONNEL, workerId },
							],
						})
						setShowSubmitDialog(false)
						await refetch()
						toast.success("Documentos enviados a revisión exitosamente")
					}}
				/>
			)}
		</div>
	)
}
