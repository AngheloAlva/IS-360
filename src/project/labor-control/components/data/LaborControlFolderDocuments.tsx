"use client"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { InfoIcon, UploadIcon, FileTextIcon, FolderIcon } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

import { useLaborControlFolderDocuments } from "../../hooks/use-labor-control-folder-documents"
import { getLaborControlDocumentColumns } from "../../columns/labor-control-document-columns"
import { LABOR_CONTROL_STRUCTURE } from "@/lib/consts/labor-control-folders-structure"
import { LABOR_CONTROL_DOCUMENT_TYPE, LABOR_CONTROL_STATUS } from "@prisma/client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { LaborControlFolderStatusBadge } from "./LaborControlFolderStatusBadge"
import { UploadDocumentsDialog } from "../forms/UploadDocumentsDialog"
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

import type { LaborControlDocument } from "../../types"

interface LaborControlFolderDocumentsProps {
	userId: string
	folderId: string
	companyId: string
	isOtcMember: boolean
	folderStatus: LABOR_CONTROL_STATUS
}

export default function LaborControlFolderDocuments({
	userId,
	folderId,
	companyId,
	isOtcMember,
	folderStatus,
}: LaborControlFolderDocumentsProps): React.ReactElement {
	const [rowSelection, setRowSelection] = useState({})
	const [selectedDocumentType, setSelectedDocumentType] = useState<{
		type: LABOR_CONTROL_DOCUMENT_TYPE
		name: string
	} | null>(null)
	const [selectedDocument, setSelectedDocument] = useState<LaborControlDocument | null>(null)
	const [showUploadDialog, setShowUploadDialog] = useState(false)

	const { data, isLoading, refetch } = useLaborControlFolderDocuments({ folderId, companyId })
	const documentsData = data?.documents ?? []

	const table = useReactTable({
		columns: getLaborControlDocumentColumns({
			userId,
			refetch,
			folderId,
			isOtcMember,
			folderStatus,
			setShowUploadDialog,
			setSelectedDocument,
			setSelectedDocumentType,
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

	const progress =
		data && documentsData.length > 0
			? (documentsData.length / LABOR_CONTROL_STRUCTURE.length) * 100
			: 0

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Documentos y Colaboradores</h2>

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
									queryClient.invalidateQueries({
										queryKey: [
											"startupFolderDocuments",
											{ startupFolderId, category, workerId: null, vehicleId: null },
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
							startupFolderId={startupFolderId}
							subfolderType={getSubfolderType(category)}
							currentStatus={data.folderStatus}
							onSuccess={async () => {
								queryClient.invalidateQueries({
									queryKey: [
										"startupFolderDocuments",
										{ startupFolderId, category, workerId: null, vehicleId: null },
									],
								})
								await refetch()
								toast.success("Estado actualizado exitosamente")
							}}
						/>
					)} */}

					{/* {!isOtcMember && folderStatus === "DRAFT" && (
						<SubmitReviewRequestDialog
							userId={userId}
							companyId={companyId}
							folderId={startupFolderId}
							onSuccess={async () => {
								queryClient.invalidateQueries({
									queryKey: [
										"startupFolderDocuments",
										{ startupFolderId, category, workerId: null, vehicleId: null },
									],
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

							{data?.workerFolders &&
								data.workerFolders.length > 0 &&
								data.workerFolders.map((workerFolder) => (
									<TableRow key={workerFolder.id}>
										{isOtcMember && <TableCell></TableCell>}
										<TableCell>
											<Link
												href={
													isOtcMember
														? `/admin/dashboard/control-laboral/${companyId}/${folderId}/${workerFolder.id}`
														: `/dashboard/control-laboral/${folderId}/${workerFolder.id}`
												}
												className="flex items-center gap-2 font-medium"
											>
												<FolderIcon className="h-4 w-4 text-sky-500" />
												{workerFolder.worker.name}
											</Link>
										</TableCell>
										<TableCell>
											<LaborControlFolderStatusBadge status={workerFolder.status} />
										</TableCell>
										<TableCell></TableCell>
										<TableCell></TableCell>
										<TableCell></TableCell>
										<TableCell></TableCell>
									</TableRow>
								))}
						</>
					)}

					{documentsNotUploaded.length > 0 &&
						documentsNotUploaded.map((doc) => (
							<TableRow key={doc.name}>
								{isOtcMember && <TableCell></TableCell>}
								<TableCell className="font-medium">
									<div className="flex flex-col items-start justify-center">
										<div className="flex items-center gap-2">
											<FileTextIcon className="h-4 w-4 text-blue-500" />
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
									<LaborControlFolderStatusBadge status={"NOT_UPLOADED"} />
								</TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										{!isOtcMember && (folderStatus === "DRAFT" || folderStatus === "REJECTED") && (
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
					userCompanyId={companyId}
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
