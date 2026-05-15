"use client"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { InfoIcon, UploadIcon, FileTextIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { markWorkerLaborControlDocumentAsNotApplied } from "../../actions/worker/mark-worker-document-not-applied"
import { useWorkerLaborControlFolderDocuments } from "../../hooks/use-worker-labor-control-folder-documents"
import { getWorkerLaborControlDocumentColumns } from "../../columns/worker-labor-control-document-columns"
import { WORKER_LABOR_CONTROL_STRUCTURE } from "@/lib/consts/labor-control-folders-structure"
import { queryClient } from "@/lib/queryClient"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
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
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

import type { WORKER_LABOR_CONTROL_DOCUMENT_TYPE } from "@/generated/prisma/enums"
import type { WorkerLaborControlDocument } from "../../types"

interface WorkerLaborControlFolderDocumentsProps {
	userId: string
	folderId: string
	workerName: string
	isInternalMember: boolean
}

export function WorkerLaborControlFolderDocuments({
	userId,
	folderId,
	isInternalMember,
}: WorkerLaborControlFolderDocumentsProps) {
	const [rowSelection, setRowSelection] = useState({})
	const [selectedDocument, setSelectedDocument] = useState<WorkerLaborControlDocument | null>(null)
	const [selectedDocumentType, setSelectedDocumentType] = useState<{
		type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE
		name: string
	} | null>(null)
	const [showUploadDialog, setShowUploadDialog] = useState(false)

	const { data, isLoading, refetch } = useWorkerLaborControlFolderDocuments({
		folderId,
	})
	const documentsData = data?.documents ?? []

	const table = useReactTable({
		columns: getWorkerLaborControlDocumentColumns({
			userId,
			refetch,
			isInternalMember,
			setShowUploadDialog,
			setSelectedDocument,
			setSelectedDocumentType,
			workerId: data?.workerId || "",
			folderStatus: data?.folderStatus,
		}),
		data: data?.documents || [],
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection,
		},
	})

	const documents = WORKER_LABOR_CONTROL_STRUCTURE

	const documentsNotUploaded = documents.filter(
		(doc) => !documentsData.some((d) => d.type === doc.type)
	)

	const documentsApproved = documentsData.filter((d) => d.status === "APPROVED")

	const progress =
		data && documentsData.length > 0 ? (documentsApproved.length / documents.length) * 100 : 0

	return (
		<Card className="gap-4">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-xl font-semibold">
					Documentos del colaborador{" "}
					<LaborControlFolderStatusBadge status={data?.folderStatus || "DRAFT"} />
				</CardTitle>

				<div className="flex items-center gap-2">
					{isInternalMember && table.getFilteredSelectedRowModel().rows.length > 0 && (
						<>
							<UndoDocumentReviewDialog
								userId={userId}
								documents={table.getFilteredSelectedRowModel().rows.map((row) => ({
									id: row.original.id,
									name: row.original.name,
								}))}
								onSuccess={async () => {
         void queryClient.invalidateQueries({
										queryKey: ["workerLaborControlFolderDocuments", { folderId }],
									})
									await refetch()
								}}
							/>
						</>
					)}

					<DocumentCountProgress progress={progress} />

					{!isInternalMember && data?.folderStatus === "DRAFT" && (
						<SubmitReviewRequestDialog
							userId={userId}
							folderId={folderId}
							workerId={data?.workerId || ""}
							onSuccess={async () => {
        void queryClient.invalidateQueries({
									queryKey: ["workerLaborControlFolderDocuments", { folderId }],
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
									{isInternalMember && <TableCell></TableCell>}
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
																markWorkerLaborControlDocumentAsNotApplied({
																	userId,
																	folderId,
																	documentType: doc.type,
																	documentName: doc.name,
																	workerId: data?.workerId || "",
																})
															}
															onSuccess={async () => {
                void queryClient.invalidateQueries({
																	queryKey: ["workerLaborControlFolderDocuments", { folderId }],
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
					workerId={data?.workerId}
					documentType={selectedDocumentType}
					documentToUpdate={selectedDocument}
					onClose={() => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
      void queryClient.invalidateQueries({
							queryKey: [
								"workerLaborControlFolderDocuments",
								{
									folderId,
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
		</Card>
	)
}
