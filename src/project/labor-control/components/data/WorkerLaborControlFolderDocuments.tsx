"use client"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { InfoIcon, UploadIcon, FileTextIcon } from "lucide-react"
import { useState } from "react"

import { useWorkerLaborControlFolderDocuments } from "../../hooks/use-worker-labor-control-folder-documents"
import { getWorkerLaborControlDocumentColumns } from "../../columns/worker-labor-control-document-columns"
import { WORKER_LABOR_CONTROL_DOCUMENT_TYPE } from "@prisma/client"
import { queryClient } from "@/lib/queryClient"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
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

import type { WorkerLaborControlDocument } from "../../types"
import { WORKER_LABOR_CONTROL_STRUCTURE } from "@/lib/consts/labor-control-folders-structure"

interface WorkerLaborControlFolderDocumentsProps {
	userId: string
	folderId: string
	workerName: string
	isOtcMember: boolean
}

export function WorkerLaborControlFolderDocuments({
	userId,
	folderId,
	isOtcMember,
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
			isOtcMember,
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

	const progress =
		data && documentsData.length > 0 ? (data.approvedDocuments / documents.length) * 100 : 0

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Documentos de Colaboradores</h2>

				<div className="flex items-center gap-2">
					{/* {isOtcMember && table.getFilteredSelectedRowModel().rows.length > 0 && (
						<>
							<UndoDocumentReviewDialog
								userId={userId}
								documents={table.getFilteredSelectedRowModel().rows.map((row) => ({
									id: row.original.id,
									name: row.original.name,
								}))}
								onSuccess={async () => {
									queryClient.invalidateQueries({
										queryKey: [
											"startupFolderDocuments",
											{ startupFolderId, category: "BASIC", workerId: null, vehicleId: null },
										],
									})
									await refetch()
								}}
							/>

							<UpdateDocumentStatusDialog
								category={"BASIC"}
								startupFolderId={startupFolderId}
								documents={table.getFilteredSelectedRowModel().rows.map((row) => ({
									id: row.original.id,
									name: row.original.name,
								}))}
								onSuccess={async () => {
									queryClient.invalidateQueries({
										queryKey: [
											"startupFolderDocuments",
											{ startupFolderId, category: "BASIC", workerId: null, vehicleId: null },
										],
									})
									await refetch()
								}}
							/>
						</>
					)} */}

					<Progress
						value={progress}
						className="mr-2 ml-auto w-24 max-w-24"
						indicatorClassName="bg-emerald-600"
					/>
					<div className="text-xs font-medium">{progress.toFixed(0)}%</div>

					{/* {isOtcMember && data?.folderStatus && (
						<ChangeSubfolderStatusDialog
							startupFolderId={folderId}
							subfolderType="BASIC"
							entityId={workerId}
							entityName={workerName}
							currentStatus={data.folderStatus}
							onSuccess={async () => {
								queryClient.invalidateQueries({
									queryKey: ["basicFolderDocuments", { startupFolderId, workerId }],
								})
								await refetch()
								toast.success("Estado actualizado exitosamente")
							}}
						/>
					)} */}

					{/* {!isOtcMember && data?.folderStatus === "DRAFT" && (
						<SubmitReviewRequestDialog
							userId={userId}
							folderId={folderId}
							workerId={workerId}
							companyId={companyId}
							category={DocumentCategory.BASIC}
							onSuccess={async () => {
								queryClient.invalidateQueries({
									queryKey: ["workerLaborControlFolderDocuments", { folderId, workerId }],
								})
								await refetch()
								toast.success("Documentos enviados a revisión exitosamente")
							}}
						/>
					)} */}
				</div>
			</div>

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
					folderId={folderId}
					isOpen={showUploadDialog}
					workerId={data?.workerId}
					documentType={selectedDocumentType}
					documentToUpdate={selectedDocument}
					onClose={() => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
						queryClient.invalidateQueries({
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
		</div>
	)
}
