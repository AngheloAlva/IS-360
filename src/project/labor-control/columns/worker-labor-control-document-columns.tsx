"use client"

import { PenIcon, FileTextIcon } from "lucide-react"
import { Dispatch, SetStateAction } from "react"
import { format } from "date-fns"

import {
	LABOR_CONTROL_STATUS,
	type WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
} from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"

import { LaborControlFolderStatusBadge } from "../components/data/LaborControlFolderStatusBadge"
import UserHoverCard from "@/shared/components/data/UserHoverCard"
import { DocumentReviewForm } from "../components/dialogs/DocumentReviewForm"
import DocumentViewButton from "../components/data/DocumentViewButton"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Button } from "@/shared/components/ui/button"

import type { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import type { ColumnDef, Row, Table } from "@tanstack/react-table"
import type { WorkerLaborControlDocument } from "../types"

interface GetWorkerLaborControlDocumentColumnsProps {
	userId: string
	workerId: string
	refetch: (options?: RefetchOptions) => Promise<
		QueryObserverResult<
			{
				documents: WorkerLaborControlDocument[]
				folderStatus: LABOR_CONTROL_STATUS
				totalDocuments: number
				approvedDocuments: number
			},
			Error
		>
	>
	isInternalMember: boolean
	folderStatus: LABOR_CONTROL_STATUS | undefined
	setSelectedDocumentType: Dispatch<
		SetStateAction<{
			type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE
			name: string
		} | null>
	>
	setSelectedDocument: (document: WorkerLaborControlDocument) => void
	setShowUploadDialog: (show: boolean) => void
}

export const getWorkerLaborControlDocumentColumns = ({
	userId,
	refetch,
	workerId,
	isInternalMember,
	folderStatus,
	setShowUploadDialog,
	setSelectedDocument,
	setSelectedDocumentType,
}: GetWorkerLaborControlDocumentColumnsProps): ColumnDef<WorkerLaborControlDocument>[] => [
	...(isInternalMember
		? [
				{
					id: "select",
					header: ({ table }: { table: Table<WorkerLaborControlDocument> }) => (
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
					cell: ({ row }: { row: Row<WorkerLaborControlDocument> }) =>
						row.original.status !== "NOT_APPLIED" && (
							<Checkbox
								checked={row.getIsSelected()}
								onCheckedChange={(value) => row.toggleSelected(!!value)}
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
			const status = row.getValue("status") as LABOR_CONTROL_STATUS

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
								"text-emerald-500": status === LABOR_CONTROL_STATUS.APPROVED,
							})}
						>
							{status === LABOR_CONTROL_STATUS.APPROVED ? "Aprobado" : "Rechazado"}: {reviewNotes}
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
			const status = row.getValue("status") as LABOR_CONTROL_STATUS

			return <LaborControlFolderStatusBadge status={status} />
		},
	},
	{
		accessorKey: "uploadedBy",
		header: "Subido por",
		cell: ({ row }) => {
			const uploadedBy = row.original.uploadBy

			return uploadedBy ? <UserHoverCard {...uploadedBy} /> : <></>
		},
	},
	{
		accessorKey: "uploadedAt",
		header: "Subido el",
		cell: ({ row }) => {
			const uploadedAt = row.original.uploadDate

			return uploadedAt ? format(new Date(uploadedAt), "dd/MM/yyyy HH:mm") : "N/A"
		},
	},
	{
		accessorKey: "reviewerId",
		header: "Revisado por",
		cell: ({ row }) => {
			const reviewer = row.original.reviewBy

			return reviewer?.name ?? ""
		},
	},
	{
		accessorKey: "reviewedAt",
		header: "Revisado el",
		cell: ({ row }) => {
			const reviewedAt = row.original.reviewDate

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
					{doc.url && <DocumentViewButton url={doc.url} />}

					{!isInternalMember &&
						folderStatus === "DRAFT" &&
						doc.status !== "NOT_APPLIED" &&
						(doc.status === "DRAFT" || doc.status === "REJECTED") && (
							<Button
								size={"icon"}
								variant="ghost"
								className="text-blue-500"
								onClick={() => {
									setSelectedDocumentType({ type: doc.type, name: doc.name })
									setSelectedDocument(doc)
									setShowUploadDialog(true)
								}}
							>
								<PenIcon className="h-4 w-4" />
							</Button>
						)}

					{isInternalMember && workerId && doc.status === "SUBMITTED" && (
						<DocumentReviewForm
							document={doc}
							userId={userId}
							refetch={refetch}
							workerId={workerId}
							folderId={doc.folderId}
						/>
					)}
				</div>
			)
		},
	},
]
