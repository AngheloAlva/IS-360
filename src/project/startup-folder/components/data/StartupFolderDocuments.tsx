"use client"

import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import {
	EyeIcon,
	PenIcon,
	SendIcon,
	InfoIcon,
	UserIcon,
	Undo2Icon,
	UploadIcon,
	ChevronLeft,
	FileTextIcon,
	CalendarX2Icon,
} from "lucide-react"

import { useStartupFolderDocuments } from "../../hooks/use-startup-folder-documents"
import { getDocumentsByCategory } from "@/lib/consts/startup-folders-structure"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"
import {
	ReviewStatus,
	DocumentCategory,
	type EnvironmentDocType,
	type EnvironmentalDocType,
	type TechSpecsDocumentType,
	type SafetyAndHealthDocumentType,
} from "@prisma/client"

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
	TableCell,
	TableBody,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

import type {
	StartupFolderDocument,
	TechSpecsStartupFolderDocument,
	EnvironmentStartupFolderDocument,
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
	moreMonthDuration: boolean
}

export default function StartupFolderDocuments({
	onBack,
	userId,
	category,
	companyId,
	isOtcMember,
	startupFolderId,
	moreMonthDuration,
}: StartupFolderDocumentsProps): React.ReactElement {
	const [selectedDocumentType, setSelectedDocumentType] = useState<{
		type:
			| EnvironmentDocType
			| EnvironmentalDocType
			| TechSpecsDocumentType
			| SafetyAndHealthDocumentType
		name: string
	} | null>(null)
	const [selectedDocument, setSelectedDocument] = useState<StartupFolderDocument | null>(null)
	const [showUploadDialog, setShowUploadDialog] = useState(false)
	const [showSubmitDialog, setShowSubmitDialog] = useState(false)
	const [showUndoReviewDialog, setShowUndoReviewDialog] = useState(false)
	const [documentToUndoReview, setDocumentToUndoReview] = useState<StartupFolderDocument | null>(
		null
	)

	const { data, isLoading, refetch } = useStartupFolderDocuments({ startupFolderId, category })
	const documentsData = data?.documents ?? []

	const { title, documents } = getDocumentsByCategory(category, moreMonthDuration)

	const documentsNotUploaded = documents.filter(
		(doc) => !documentsData.some((d) => d.type === doc.type)
	)

	const progress =
		data && documentsData.length > 0 ? (data.approvedDocuments / documents.length) * 100 : 0

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
						<TableHead>Revisado por</TableHead>
						<TableHead>Revisado el</TableHead>
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
															case DocumentCategory.ENVIRONMENT: {
																const envDoc: EnvironmentStartupFolderDocument = {
																	...baseDoc,
																	category: DocumentCategory.ENVIRONMENT,
																	type: doc.type as EnvironmentDocType,
																	reviewer: doc.reviewer,
																}
																selectedDoc = envDoc
																break
															}
															case DocumentCategory.TECHNICAL_SPECS: {
																const envDoc: TechSpecsStartupFolderDocument = {
																	...baseDoc,
																	category: DocumentCategory.TECHNICAL_SPECS,
																	type: doc.type as TechSpecsDocumentType,
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

										{isOtcMember && (doc.status === "APPROVED" || doc.status === "REJECTED") && (
											<Button
												size={"icon"}
												variant="ghost"
												className="text-amber-500"
												onClick={() => {
													setDocumentToUndoReview(doc)
													setShowUndoReviewDialog(true)
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
						toast.success("Documentos enviados a revisión exitosamente")
					}}
				/>
			)}

			{showUndoReviewDialog && documentToUndoReview && (
				<UndoDocumentReviewDialog
					userId={userId}
					category={documentToUndoReview.category}
					isOpen={showUndoReviewDialog}
					documentId={documentToUndoReview.id}
					onClose={() => {
						setShowUndoReviewDialog(false)
						setDocumentToUndoReview(null)
					}}
					onSuccess={async () => {
						queryClient.invalidateQueries({
							queryKey: [
								"startupFolderDocuments",
								{ startupFolderId, category, workerId: null, vehicleId: null },
							],
						})
						setShowUndoReviewDialog(false)
						setDocumentToUndoReview(null)
						await refetch()
					}}
				/>
			)}
		</div>
	)
}
