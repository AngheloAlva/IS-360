"use client"

import { InfoIcon, UploadIcon, ChevronLeft, FileTextIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
	flexRender,
	useReactTable,
	getCoreRowModel,
	type RowSelectionState,
} from "@tanstack/react-table"

import { getWorkerDocumentColumns } from "../../columns/worker-document-columns"
import { getDocumentsByWorkerIsDriver } from "@/lib/consts/worker-folder-structure"
import { useWorkerFolderDocuments } from "../../hooks/use-worker-folder-documents"
import { DocumentCategory } from "@prisma/client"
import { queryClient } from "@/lib/queryClient"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { UpdateDocumentStatusDialog } from "../dialogs/UpdateDocumentStatusDialog"
import { SubmitReviewRequestDialog } from "../dialogs/SubmitReviewRequestDialog"
import { UndoDocumentReviewDialog } from "../dialogs/UndoDocumentReviewDialog"
import { UploadDocumentsDialog } from "../forms/UploadDocumentsDialog"
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
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [selectedDocument, setSelectedDocument] = useState<WorkerStartupFolderDocument | null>(null)
	const [selectedDocumentType, setSelectedDocumentType] = useState<{
		type: WorkerDocumentType
		name: string
	} | null>(null)
	const [showUploadDialog, setShowUploadDialog] = useState(false)

	const { data, isLoading, refetch } = useWorkerFolderDocuments({
		startupFolderId,
		workerId,
	})
	const documentsData = data?.documents ?? []

	const table = useReactTable({
		columns: getWorkerDocumentColumns({
			userId,
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
				<div className="flex items-center gap-2">
					{isOtcMember && table.getFilteredSelectedRowModel().rows.length > 0 && (
						<>
							<UndoDocumentReviewDialog
								userId={userId}
								category={"PERSONNEL"}
								documents={table.getFilteredSelectedRowModel().rows.map((row) => ({
									id: row.original.id,
									name: row.original.name,
								}))}
								onSuccess={async () => {
									queryClient.invalidateQueries({
										queryKey: [
											"startupFolderDocuments",
											{ startupFolderId, category: "PERSONNEL", workerId: null, vehicleId: null },
										],
									})
									await refetch()
								}}
							/>

							<UpdateDocumentStatusDialog
								startupFolderId={startupFolderId}
								category={"PERSONNEL"}
								documents={table.getFilteredSelectedRowModel().rows.map((row) => ({
									id: row.original.id,
									name: row.original.name,
								}))}
								onSuccess={async () => {
									queryClient.invalidateQueries({
										queryKey: [
											"startupFolderDocuments",
											{ startupFolderId, category: "PERSONNEL", workerId: null, vehicleId: null },
										],
									})
									await refetch()
								}}
							/>
						</>
					)}

					<Progress
						value={progress}
						indicatorClassName="bg-emerald-600"
						className="mr-2 ml-auto w-24 max-w-24"
					/>
					<div className="text-xs font-medium">{progress.toFixed(0)}%</div>

					{!isOtcMember && data?.folderStatus === "DRAFT" && (
						<SubmitReviewRequestDialog
							userId={userId}
							workerId={workerId}
							companyId={companyId}
							folderId={startupFolderId}
							category={DocumentCategory.PERSONNEL}
							onSuccess={async () => {
								queryClient.invalidateQueries({
									queryKey: ["workerFolderDocuments", { startupFolderId, workerId }],
								})
								await refetch()
								toast.success("Documentos enviados a revisión exitosamente")
							}}
						/>
					)}
				</div>
			</div>

			<Table>
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
		</div>
	)
}
