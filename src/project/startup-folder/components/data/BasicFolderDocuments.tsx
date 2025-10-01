"use client"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { InfoIcon, UploadIcon, ChevronLeft, FileTextIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { useBasicFolderDocuments } from "../../hooks/use-basic-folder-documents"
import { getBasicDocuments } from "@/lib/consts/basic-startup-folders-structure"
import { getBasicDocumentColumns } from "../../columns/basic-document-columns"
import { DocumentCategory } from "@prisma/client"
import { queryClient } from "@/lib/queryClient"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { UpdateDocumentStatusDialog } from "../dialogs/UpdateDocumentStatusDialog"
import { SubmitReviewRequestDialog } from "../dialogs/SubmitReviewRequestDialog"
import ChangeSubfolderStatusDialog from "../dialogs/ChangeSubfolderStatusDialog"
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

import type { BasicStartupFolderDocument } from "@/project/startup-folder/types"
import type { BasicDocumentType } from "@prisma/client"

interface BasicFolderDocumentsProps {
	userId: string
	workerId: string
	companyId: string
	onBack: () => void
	workerName: string
	isOtcMember: boolean
	startupFolderId: string
}

export function BasicFolderDocuments({
	onBack,
	userId,
	workerId,
	companyId,
	workerName,
	isOtcMember,
	startupFolderId,
}: BasicFolderDocumentsProps) {
	const [rowSelection, setRowSelection] = useState({})
	const [selectedDocument, setSelectedDocument] = useState<BasicStartupFolderDocument | null>(null)
	const [selectedDocumentType, setSelectedDocumentType] = useState<{
		type: BasicDocumentType
		name: string
	} | null>(null)
	const [showUploadDialog, setShowUploadDialog] = useState(false)

	const { data, isLoading, refetch } = useBasicFolderDocuments({
		startupFolderId,
		workerId,
	})
	const documentsData = data?.documents ?? []

	const table = useReactTable({
		columns: getBasicDocumentColumns({
			userId,
			refetch,
			companyId,
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

	const { documents } = getBasicDocuments()

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
								category={"BASIC"}
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
					)}

					<Progress
						value={progress}
						className="mr-2 ml-auto w-24 max-w-24"
						indicatorClassName="bg-emerald-600"
					/>
					<div className="text-xs font-medium">{progress.toFixed(0)}%</div>

					{/* Botón para cambio manual de estado - solo miembros IS 360 */}
					{isOtcMember && data?.folderStatus && (
						<ChangeSubfolderStatusDialog
							startupFolderId={startupFolderId}
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
					)}

					{!isOtcMember && (data?.folderStatus === "DRAFT" || data?.folderStatus === "EXPIRED") && (
						<SubmitReviewRequestDialog
							userId={userId}
							workerId={workerId}
							companyId={companyId}
							folderId={startupFolderId}
							category={DocumentCategory.BASIC}
							onSuccess={async () => {
								queryClient.invalidateQueries({
									queryKey: ["basicFolderDocuments", { startupFolderId, workerId }],
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
					userCompanyId={companyId}
					category={DocumentCategory.BASIC}
					startupFolderId={startupFolderId}
					documentType={selectedDocumentType}
					documentToUpdate={selectedDocument}
					onClose={() => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
						queryClient.invalidateQueries({
							queryKey: [
								"basicFolderDocuments",
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
