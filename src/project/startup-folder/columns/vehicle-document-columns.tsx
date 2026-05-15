"use client"

import { PenIcon, FileTextIcon, CalendarX2Icon } from "lucide-react"
import { Dispatch, SetStateAction } from "react"
import { format } from "date-fns"

import { ReviewStatus } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"

import { RevertNotAppliedDocumentDialog } from "../components/dialogs/RevertNotAppliedDocumentDialog"
import { UpdateExpirationDateDocument } from "../components/forms/UpdateExpirationDateDocument"
import { StartupFolderStatusBadge } from "../components/data/StartupFolderStatusBadge"
import { DocumentReviewForm } from "../components/dialogs/DocumentReviewForm"
import { UnmarkDocumentAsNotAppliedDialog } from "../components/dialogs/UnmarkDocumentAsNotAppliedDialog"
import DocumentViewButton from "../components/data/DocumentViewButton"
import UserHoverCard from "@/shared/components/data/UserHoverCard"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Button } from "@/shared/components/ui/button"
import { unmarkStartupFolderDocumentAsNotApplied } from "../actions/unmark-document-not-applied"

import type { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import type { VehicleDocumentType } from "@/generated/prisma/enums"
import type { ColumnDef, Row, Table } from "@tanstack/react-table"
import type { VehicleStartupFolderDocument } from "../types"

interface GetVehicleDocumentColumnsProps {
	userId: string
	companyId: string
	refetch: (options?: RefetchOptions) => Promise<
		QueryObserverResult<
			{
				documents: VehicleStartupFolderDocument[]
				folderStatus: ReviewStatus
				totalDocuments: number
				approvedDocuments: number
			},
			Error
		>
	>
	startupFolderId: string
	vehicleId: string
	isOtcMember: boolean
	hasPermission: boolean
	folderStatus: ReviewStatus | undefined
	setSelectedDocumentType: Dispatch<
		SetStateAction<{
			type: VehicleDocumentType
			name: string
		} | null>
	>
	setSelectedDocument: (document: VehicleStartupFolderDocument) => void
	setShowUploadDialog: (show: boolean) => void
}

export const getVehicleDocumentColumns = ({
	userId,
	refetch,
	companyId,
	isOtcMember,
	hasPermission,
	folderStatus,
	startupFolderId,
	vehicleId,
	setShowUploadDialog,
	setSelectedDocument,
	setSelectedDocumentType,
}: GetVehicleDocumentColumnsProps): ColumnDef<VehicleStartupFolderDocument>[] => [
	...(isOtcMember
		? [
				{
					id: "select",
					header: ({ table }: { table: Table<VehicleStartupFolderDocument> }) => (
						<Checkbox
							checked={
								table.getIsAllPageRowsSelected() ||
								(table.getIsSomePageRowsSelected() && "indeterminate")
							}
							onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
							aria-label="Select all"
							className="mr-1 data-[state=checked]:bg-teal-500"
						/>
					),
					cell: ({ row }: { row: Row<VehicleStartupFolderDocument> }) => (
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={(value) => row.toggleSelected(!!value)}
							disabled={row.original.status === "NOT_APPLIED"}
							aria-label="Select row"
							className="data-[state=checked]:bg-teal-500"
						/>
					),
					enableSorting: false,
					enableHiding: false,
				},
			]
		: []),
	{
		accessorKey: "name",
		header: "Nombre Documento",
		cell: ({ row }) => {
			const name = row.getValue("name") as string
			const status = row.getValue("status") as ReviewStatus

			const reviewNotes = row.original.reviewNotes

			return (
				<div className="flex flex-col items-start justify-center">
					<div className="flex items-center gap-2">
						<FileTextIcon className="h-4 w-4 text-teal-500" />
						{name}
					</div>

					{reviewNotes && (
						<span
							className={cn("max-w-96 text-wrap text-rose-500", {
								"text-emerald-500": status === ReviewStatus.APPROVED,
							})}
						>
							{status === ReviewStatus.APPROVED ? "Aprobado" : "Rechazado"}: {reviewNotes}
						</span>
					)}
				</div>
			)
		},
	},
	{
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.getValue("status") as ReviewStatus

			return <StartupFolderStatusBadge status={status} />
		},
	},
	{
		accessorKey: "uploadedBy",
		header: "Subido por",
		cell: ({ row }) => {
			const uploadedBy = row.original.uploadedBy

			return uploadedBy ? <UserHoverCard {...uploadedBy} /> : <></>
		},
	},
	{
		accessorKey: "uploadedAt",
		header: "Subido el",
		cell: ({ row }) => {
			const uploadedAt = row.original.uploadedAt

			return uploadedAt ? format(new Date(uploadedAt), "dd/MM/yyyy HH:mm") : "N/A"
		},
	},
	{
		accessorKey: "expirationDate",
		header: "Vencimiento",
		cell: ({ row }) => {
			const expirationDate = row.original.expirationDate

			return (
				<div
					className={cn("flex items-center gap-1", {
						"font-semibold text-rose-500": expirationDate && new Date(expirationDate) < new Date(),
					})}
				>
					<CalendarX2Icon className="text-muted-foreground size-3.5" />
					{expirationDate ? format(new Date(expirationDate), "dd/MM/yyyy") : "N/A"}
				</div>
			)
		},
	},
	{
		accessorKey: "reviewerId",
		header: "Revisado por",
		cell: ({ row }) => {
			const reviewer = row.original.reviewer

			return reviewer?.name ?? ""
		},
	},
	{
		accessorKey: "reviewedAt",
		header: "Revisado el",
		cell: ({ row }) => {
			const reviewedAt = row.original.reviewedAt

			return reviewedAt ? format(new Date(reviewedAt), "dd/MM/yyyy") : ""
		},
	},
	{
		accessorKey: "actions",
		header: "",
		cell: ({ row }) => {
			const doc = row.original

			return (
				<div className="flex items-center gap-1">
					{doc.url && <DocumentViewButton url={doc.url} companyId={companyId} />}

					{isOtcMember && hasPermission && doc.status === "NOT_APPLIED" && (
						<UnmarkDocumentAsNotAppliedDialog
							documentName={doc.name}
							onUnmarkAsNotApplied={() =>
								unmarkStartupFolderDocumentAsNotApplied({
									userId,
									folderId: startupFolderId,
									documentId: doc.id,
									category: doc.category,
									vehicleId,
								})
							}
							onSuccess={() => {
        void refetch()
							}}
						/>
					)}

					{doc.status === "NOT_APPLIED" &&
						(isOtcMember || folderStatus === "DRAFT" || folderStatus === "EXPIRED") && (
							<RevertNotAppliedDocumentDialog
								documentId={doc.id}
								documentName={doc.name}
								category={doc.category}
								onSuccess={async () => {
									await refetch()
								}}
							/>
						)}

					{!isOtcMember &&
						(folderStatus === "DRAFT" || folderStatus === "EXPIRED") &&
						doc.status !== "NOT_APPLIED" &&
						(doc.status === "DRAFT" ||
							doc.status === "REJECTED" ||
							doc.status === "TO_UPDATE" ||
							doc.status === "EXPIRED") && (
							<Button
								size={"icon"}
								variant="ghost"
								className="text-cyan-600"
								onClick={() => {
									const baseDoc: VehicleStartupFolderDocument = {
										id: doc.id,
										url: doc.url,
										name: doc.name,
										type: doc.type,
										status: doc.status,
										reviewer: doc.reviewer,
										category: doc.category,
										folderId: doc.folderId,
										reviewerId: doc.reviewerId,
										reviewedAt: doc.reviewedAt,
										uploadedAt: doc.uploadedAt,
										uploadedBy: doc.uploadedBy,
										reviewNotes: doc.reviewNotes,
										submittedAt: doc.submittedAt,
										uploadedById: doc.uploadedById,
										expirationDate: doc.expirationDate,
									}

									setSelectedDocumentType({ type: doc.type, name: doc.name })
									setSelectedDocument(baseDoc)
									setShowUploadDialog(true)
								}}
							>
								<PenIcon className="h-4 w-4" />
							</Button>
						)}

					{(isOtcMember || folderStatus === "DRAFT") && doc.status !== "NOT_APPLIED" && (
						<UpdateExpirationDateDocument
							folderId={doc.folderId}
							companyId={companyId}
							documentId={doc.id}
							category={doc.category}
						/>
					)}

					{isOtcMember && doc.status === "SUBMITTED" && (
						<DocumentReviewForm
							document={doc}
							refetch={refetch}
							category={doc.category}
							startupFolderId={startupFolderId}
						/>
					)}
				</div>
			)
		},
	},
]
