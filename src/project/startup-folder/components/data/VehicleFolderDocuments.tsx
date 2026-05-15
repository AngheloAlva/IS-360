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

import { markStartupFolderDocumentAsNotApplied } from "../../actions/mark-document-not-applied"
import { useVehicleFolderDocuments } from "../../hooks/use-vehicle-folder-documents"
import { getVehicleDocumentColumns } from "../../columns/vehicle-document-columns"
import { queryClient } from "@/lib/queryClient"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
import { MarkDocumentAsNotAppliedDialog } from "../dialogs/MarkDocumentAsNotAppliedDialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { UpdateDocumentStatusDialog } from "../dialogs/UpdateDocumentStatusDialog"
import { SubmitReviewRequestDialog } from "../dialogs/SubmitReviewRequestDialog"
import ChangeSubfolderStatusDialog from "../dialogs/ChangeSubfolderStatusDialog"
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

import type { VehicleStartupFolderDocument } from "@/project/startup-folder/types"
import type { VehicleDocumentType } from "@/generated/prisma/enums"
import DocumentCountProgress from "./DocumentCountProgress"

interface VehicleFolderDocumentsProps {
	userId: string
	vehicleId: string
	companyId: string
	onBack: () => void
	isInternalMember: boolean
	startupFolderId: string
	documents: {
		name: string
		description?: string
		type: VehicleDocumentType
	}[]
	hasPermission: boolean
}

export function VehicleFolderDocuments({
	onBack,
	userId,
	vehicleId,
	companyId,
	documents,
	isInternalMember,
	startupFolderId,
	hasPermission,
}: VehicleFolderDocumentsProps) {
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [selectedDocument, setSelectedDocument] = useState<VehicleStartupFolderDocument | null>(
		null
	)
	const [selectedDocumentType, setSelectedDocumentType] = useState<{
		type: VehicleDocumentType
		name: string
	} | null>(null)
	const [showUploadDialog, setShowUploadDialog] = useState(false)

	const { data, isLoading, refetch } = useVehicleFolderDocuments({
		startupFolderId,
		vehicleId,
	})
	const documentsData = data?.documents ?? []

	const table = useReactTable({
		columns: getVehicleDocumentColumns({
			userId,
			refetch,
			companyId,
			vehicleId,
			hasPermission,
			isInternalMember,
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
					<h2 className="text-lg font-bold">Documentación de vehículos y equipos</h2>

					<StartupFolderStatusBadge status={data?.folderStatus ?? "DRAFT"} />
				</div>

				<div className="flex items-center gap-2">
					{isInternalMember && table.getFilteredSelectedRowModel().rows.length > 0 && (
						<>
							<UndoDocumentReviewDialog
								category={"VEHICLES"}
								documents={table.getFilteredSelectedRowModel().rows.map((row) => ({
									id: row.original.id,
									name: row.original.name,
								}))}
								onSuccess={async () => {
         void queryClient.invalidateQueries({
										queryKey: [
											"startupFolderDocuments",
											{ startupFolderId, category: "VEHICLES", workerId: null, vehicleId: null },
										],
									})
									await refetch()
								}}
							/>

							<UpdateDocumentStatusDialog
								startupFolderId={startupFolderId}
								category={"VEHICLES"}
								documents={table.getFilteredSelectedRowModel().rows.map((row) => ({
									id: row.original.id,
									name: row.original.name,
								}))}
								onSuccess={async () => {
         void queryClient.invalidateQueries({
										queryKey: [
											"startupFolderDocuments",
											{ startupFolderId, category: "VEHICLES", workerId: null, vehicleId: null },
										],
									})
									await refetch()
								}}
							/>
						</>
					)}

					<DocumentCountProgress progress={progress} />

					{/* Botón para cambio manual de estado - solo miembros internos */}
					{isInternalMember && data?.folderStatus && (
						<ChangeSubfolderStatusDialog
							startupFolderId={startupFolderId}
							subfolderType="VEHICLE"
							currentStatus={data.folderStatus}
							entityId={vehicleId}
							entityName={`Vehículo ${vehicleId}`}
							onSuccess={async () => {
        void queryClient.invalidateQueries({
									queryKey: ["vehicleFolderDocuments", { startupFolderId, vehicleId }],
								})
								await refetch()
								toast.success("Estado actualizado exitosamente")
							}}
						/>
					)}

					{!isInternalMember && (data?.folderStatus === "DRAFT" || data?.folderStatus === "EXPIRED") && (
						<SubmitReviewRequestDialog
							userId={userId}
							vehicleId={vehicleId}
							companyId={companyId}
							category={"VEHICLES"}
							folderId={startupFolderId}
							onSuccess={async () => {
        void queryClient.invalidateQueries({
									queryKey: ["vehicleFolderDocuments", { startupFolderId, vehicleId }],
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
										{!isInternalMember &&
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

										{isInternalMember &&
											hasPermission &&
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
															category: "VEHICLES",
															vehicleId,
														})
													}
													onSuccess={async () => {
														void queryClient.invalidateQueries({
															queryKey: [
																"vehicleFolderDocuments",
																{ startupFolderId, vehicleId },
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
					category="VEHICLES"
					vehicleId={vehicleId}
					isOpen={showUploadDialog}
					userCompanyId={companyId}
					startupFolderId={startupFolderId}
					documentToUpdate={selectedDocument}
					documentType={selectedDocumentType}
					onClose={() => {
      void queryClient.invalidateQueries({
							queryKey: ["vehicleFolderDocuments", { startupFolderId, vehicleId }],
						})
						setShowUploadDialog(false)
						setSelectedDocument(null)
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
