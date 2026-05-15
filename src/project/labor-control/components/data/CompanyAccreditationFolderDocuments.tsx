"use client"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { InfoIcon, UploadIcon, FileTextIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { useCompanyAcreditacionFolderDocuments } from "../../hooks/use-labor-control-folder-documents"
import { markLaborControlDocumentAsNotApplied } from "../../actions/mark-document-not-applied"
import { getLaborControlDocumentColumns } from "../../columns/labor-control-document-columns"
import { LABOR_CONTROL_STRUCTURE } from "@/lib/consts/labor-control-folders-structure"
import { queryClient } from "@/lib/queryClient"

import DocumentCountProgress from "@/project/startup-folder/components/data/DocumentCountProgress"
import { MarkDocumentAsNotAppliedDialog } from "../dialogs/MarkDocumentAsNotAppliedDialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { SubmitReviewRequestDialog } from "../dialogs/SubmitReviewRequestDialog"
import { LaborControlFolderStatusBadge } from "./LaborControlFolderStatusBadge"
import { UndoDocumentReviewDialog } from "../dialogs/UndoDocumentReviewDialog"
import { UploadDocumentsDialog } from "../forms/UploadDocumentsDialog"
import { Button } from "@/shared/components/ui/button"
import {
	Table,
	TableRow,
	TableCell,
	TableBody,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

import type { LABOR_CONTROL_DOCUMENT_TYPE } from "@/generated/prisma/enums"
import type { LaborControlDocument } from "../../types"

interface CompanyAccreditationFolderDocumentsProps {
	userId: string
	folderId: string
	companyId: string
	isInternalMember: boolean
}

export default function CompanyAccreditationFolderDocuments({
	userId,
	folderId,
	companyId,
	isInternalMember,
}: CompanyAccreditationFolderDocumentsProps): React.ReactElement {
	const [rowSelection, setRowSelection] = useState({})
	const [selectedDocumentType, setSelectedDocumentType] = useState<{
		type: LABOR_CONTROL_DOCUMENT_TYPE
		name: string
	} | null>(null)
	const [selectedDocument, setSelectedDocument] = useState<LaborControlDocument | null>(null)
	const [showUploadDialog, setShowUploadDialog] = useState(false)

	const { data, isLoading, refetch } = useCompanyAcreditacionFolderDocuments({
		folderId,
		companyId,
	})
	const documentsData = data?.documents ?? []

	const table = useReactTable({
		columns: getLaborControlDocumentColumns({
			userId,
			refetch,
			folderId,
			companyId,
			isInternalMember,
			setShowUploadDialog,
			setSelectedDocument,
			setSelectedDocumentType,
			folderStatus: data?.folderStatus,
		}),
		data: documentsData,
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection,
		},
	})

	const documentsNotUploaded = LABOR_CONTROL_STRUCTURE.filter(
		(doc) => !documentsData.some((d) => d.type === doc.type)
	)

	const documentsApproved = documentsData.filter((d) => d.status === "APPROVED")

	const progress =
		data && documentsData.length > 0
			? (documentsApproved.length / LABOR_CONTROL_STRUCTURE.length) * 100
			: 0

	return (
		<Card className="gap-4">
			<CardHeader className="flex flex-row items-start justify-between">
				<CardTitle className="text-xl font-semibold">
					Documentos de Acreditacion Empresa{" "}
					<LaborControlFolderStatusBadge status={data?.folderStatus || "DRAFT"} />
				</CardTitle>

				<div className="flex items-center gap-2">
					{isInternalMember && table.getFilteredSelectedRowModel().rows.length > 0 && (
						<UndoDocumentReviewDialog
							userId={userId}
							documents={table.getFilteredSelectedRowModel().rows.map((row) => ({
								id: row.original.id,
								name: row.original.name,
							}))}
							onSuccess={async () => {
        void queryClient.invalidateQueries({
									queryKey: ["companyAccreditationFolderDocuments", { folderId, companyId }],
								})
								await refetch()
							}}
						/>
					)}

					<DocumentCountProgress progress={progress} />

					{!isInternalMember && data?.folderStatus === "DRAFT" && (
						<SubmitReviewRequestDialog
							userId={userId}
							folderId={folderId}
							onSuccess={async () => {
        void queryClient.invalidateQueries({
									queryKey: ["companyAccreditationFolderDocuments", { folderId, companyId }],
								})
								await refetch()
								toast.success("Documentos enviados a revisión exitosamente")
							}}
						/>
					)}
				</div>
			</CardHeader>

			<CardContent>
				<Table className="bg-background">
					<TableHeader className="bg-background">
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
							<>
								{table.getRowModel().rows.map((row) => (
									<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))}
							</>
						)}

						{documentsNotUploaded.length > 0 &&
							documentsNotUploaded.map((doc) => (
								<TableRow key={doc.name}>
									{isInternalMember && <TableCell></TableCell>}
									<TableCell className="font-semibold">
										<div className="flex flex-col items-start justify-center">
											<div className="flex items-center gap-2">
												<FileTextIcon className="h-4 w-4 text-cyan-500" />
												{doc.name}

												<Tooltip>
													<TooltipTrigger asChild>
														<Button variant="ghost" size="icon" className="size-7">
															<InfoIcon className="size-4 text-cyan-500" />
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
										<LaborControlFolderStatusBadge status={"NOT_UPLOADED"} />
									</TableCell>
									<TableCell></TableCell>
									<TableCell></TableCell>
									<TableCell></TableCell>
									<TableCell></TableCell>
									<TableCell></TableCell>
									<TableCell>
										<div className="flex items-center gap-1">
											{(data?.folderStatus === "DRAFT" || data?.folderStatus === "REJECTED") && (
												<>
													{!isInternalMember && (
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

													{isInternalMember && (
														<MarkDocumentAsNotAppliedDialog
															documentName={doc.name}
															onMarkAsNotApplied={() =>
																markLaborControlDocumentAsNotApplied({
																	userId,
																	folderId,
																	documentType: doc.type,
																	documentName: doc.name,
																})
															}
															onSuccess={async () => {
                void queryClient.invalidateQueries({
																	queryKey: [
																		"companyAccreditationFolderDocuments",
																		{ folderId, companyId },
																	],
																})
																await refetch()
															}}
														/>
													)}
												</>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</CardContent>

			{showUploadDialog && (
				<UploadDocumentsDialog
					userId={userId}
					folderId={folderId}
					isOpen={showUploadDialog}
					userCompanyId={companyId}
					documentType={selectedDocumentType}
					documentToUpdate={selectedDocument}
					onClose={() => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
					}}
					onUploadComplete={() => {
      void queryClient.invalidateQueries({
							queryKey: ["companyAccreditationFolderDocuments", { folderId, companyId }],
						})

						setShowUploadDialog(false)
						setSelectedDocument(null)
					}}
				/>
			)}
		</Card>
	)
}
