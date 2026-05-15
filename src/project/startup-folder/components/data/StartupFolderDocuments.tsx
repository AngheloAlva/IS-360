"use client"

import { InfoIcon, UploadIcon, ChevronLeft, FileTextIcon } from "lucide-react"
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react"
import { toast } from "sonner"

import { useStartupFolderDocuments } from "../../hooks/use-startup-folder-documents"
import { getDocumentsByCategory } from "@/lib/consts/startup-folders-structure"
import { getDocumentColumns } from "../../columns/document-columns"
import { queryClient } from "@/lib/queryClient"
import {
	DocumentCategory,
	type EnvironmentDocType,
	type EnvironmentalDocType,
	type TechSpecsDocumentType,
	type SafetyAndHealthDocumentType,
} from "@/generated/prisma/enums"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
import { markStartupFolderDocumentAsNotApplied } from "../../actions/mark-document-not-applied"
import { type ChangeSubfolderStatusSchema } from "../../schemas/change-subfolder-status.schema"
import { MarkDocumentAsNotAppliedDialog } from "../dialogs/MarkDocumentAsNotAppliedDialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { UpdateDocumentStatusDialog } from "../dialogs/UpdateDocumentStatusDialog"
import { SubmitReviewRequestDialog } from "../dialogs/SubmitReviewRequestDialog"
import ChangeSubfolderStatusDialog from "../dialogs/ChangeSubfolderStatusDialog"
import { UndoDocumentReviewDialog } from "../dialogs/UndoDocumentReviewDialog"
import { UploadDocumentsDialog } from "../forms/UploadDocumentsDialog"
import { Separator } from "@/shared/components/ui/separator"
import DocumentCountProgress from "./DocumentCountProgress"
import { Button } from "@/shared/components/ui/button"
import {
	Table,
	TableRow,
	TableCell,
	TableBody,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

import type { StartupFolderDocument } from "../../types"

interface StartupFolderDocumentsProps {
	userId: string
	companyId: string
	onBack: () => void
	isOtcMember: boolean
	hasPermission: boolean
	startupFolderId: string
	category: DocumentCategory
	moreMonthDuration: boolean
}

function getSubfolderType(
	category: DocumentCategory
): ChangeSubfolderStatusSchema["subfolderType"] {
	const mapping: Record<DocumentCategory, ChangeSubfolderStatusSchema["subfolderType"]> = {
		[DocumentCategory.SAFETY_AND_HEALTH]: "SAFETY_AND_HEALTH",
		[DocumentCategory.ENVIRONMENTAL]: "ENVIRONMENTAL",
		[DocumentCategory.ENVIRONMENT]: "ENVIRONMENT",
		[DocumentCategory.TECHNICAL_SPECS]: "TECHNICAL_SPECS",
		[DocumentCategory.PERSONNEL]: "WORKER",
		[DocumentCategory.VEHICLES]: "VEHICLE",
		[DocumentCategory.BASIC]: "BASIC",
	}
	return mapping[category]
}

export default function StartupFolderDocuments({
	onBack,
	userId,
	category,
	companyId,
	isOtcMember,
	hasPermission,
	startupFolderId,
	moreMonthDuration,
}: StartupFolderDocumentsProps): React.ReactElement {
	const [rowSelection, setRowSelection] = useState({})
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

	const { data, isLoading, refetch } = useStartupFolderDocuments({ startupFolderId, category })
	const documentsData = data?.documents ?? []

	const table = useReactTable({
		columns: getDocumentColumns({
			userId,
			companyId,
			hasPermission,
			refetch,
			isOtcMember,
			startupFolderId,
			setShowUploadDialog,
			setSelectedDocument,
			setSelectedDocumentType,
			folderStatus: data?.folderStatus,
		}),
		data: data?.documents || [],
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection,
		},
	})

	const { title, documents } = getDocumentsByCategory(category, moreMonthDuration)

	const documentsNotUploaded = documents.filter(
		(doc) => !documentsData.some((d) => d.type === doc.type)
	)

	const progress =
		data && documentsData.length > 0 ? (data.approvedDocuments / documents.length) * 100 : 0

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{category !== DocumentCategory.BASIC && (
						<Button variant="outline" size={"icon"} className="gap-2" onClick={onBack}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
					)}

					<Separator orientation="vertical" className="mx-1" />

					<h2 className="text-lg font-bold">{title}</h2>

					<StartupFolderStatusBadge status={data?.folderStatus ?? "DRAFT"} />
				</div>

				<div className="flex items-center gap-2">
					{isOtcMember && table.getFilteredSelectedRowModel().rows.length > 0 && (
						<>
							<UndoDocumentReviewDialog
								category={category}
								documents={table.getFilteredSelectedRowModel().rows.map((row) => ({
									id: row.original.id,
									name: row.original.name,
								}))}
								onSuccess={async () => {
         void queryClient.invalidateQueries({
										queryKey: [
											"startupFolderDocuments",
											{ startupFolderId, category, workerId: null, vehicleId: null },
										],
									})
									await refetch()
								}}
							/>

							<UpdateDocumentStatusDialog
								startupFolderId={startupFolderId}
								category={category}
								documents={table.getFilteredSelectedRowModel().rows.map((row) => ({
									id: row.original.id,
									name: row.original.name,
								}))}
								onSuccess={async () => {
         void queryClient.invalidateQueries({
										queryKey: [
											"startupFolderDocuments",
											{ startupFolderId, category, workerId: null, vehicleId: null },
										],
									})
									await refetch()
								}}
							/>
						</>
					)}

					<DocumentCountProgress progress={progress} />

					<Separator orientation="vertical" />

					{isOtcMember && data?.folderStatus && (
						<ChangeSubfolderStatusDialog
							startupFolderId={startupFolderId}
							subfolderType={getSubfolderType(category)}
							currentStatus={data.folderStatus}
							onSuccess={async () => {
        void queryClient.invalidateQueries({
									queryKey: [
										"startupFolderDocuments",
										{ startupFolderId, category, workerId: null, vehicleId: null },
									],
								})
								await refetch()
								toast.success("Estado actualizado exitosamente")
							}}
						/>
					)}

					{!isOtcMember && (data?.folderStatus === "DRAFT" || data?.folderStatus === "EXPIRED") && (
						<SubmitReviewRequestDialog
							userId={userId}
							category={category}
							companyId={companyId}
							folderId={startupFolderId}
							onSuccess={async () => {
        void queryClient.invalidateQueries({
									queryKey: [
										"startupFolderDocuments",
										{ startupFolderId, category, workerId: null, vehicleId: null },
									],
								})
								await refetch()
								toast.success("Documentos enviados a revisión exitosamente")
							}}
						/>
					)}
				</div>
			</div>

			<Table className="bg-background overflow-hidden rounded-lg">
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								)
							})}
						</TableRow>
					))}
				</TableHeader>

				<TableBody>
					{isLoading ? (
						<TableRow>
							<TableCell colSpan={8} className="h-24 text-center">
								Cargando documentos...
							</TableCell>
						</TableRow>
					) : (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					)}

					{documentsNotUploaded.length > 0 &&
						documentsNotUploaded.map((doc) => (
							<TableRow key={doc.name}>
								{isOtcMember && <TableCell></TableCell>}
								<TableCell className="font-semibold">
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
								<TableCell></TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										{!isOtcMember &&
											(data?.folderStatus === "DRAFT" ||
												data?.folderStatus === "REJECTED" ||
												data?.folderStatus === "EXPIRED") && (
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

										{hasPermission &&
											(data?.folderStatus === "DRAFT" ||
												data?.folderStatus === "REJECTED" ||
												data?.folderStatus === "EXPIRED" ||
												data?.folderStatus === "SUBMITTED") && (
												<MarkDocumentAsNotAppliedDialog
													documentName={doc.name}
													onMarkAsNotApplied={() =>
														markStartupFolderDocumentAsNotApplied({
															userId,
															folderId: startupFolderId,
															documentType: doc.type,
															documentName: doc.name,
															category,
														})
													}
													onSuccess={async () => {
														void queryClient.invalidateQueries({
															queryKey: [
																"startupFolderDocuments",
																{ startupFolderId, category, workerId: null, vehicleId: null },
															],
														})
														await refetch()
													}}
												/>
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
					userCompanyId={companyId}
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
		</div>
	)
}
