"use client"

import { CalendarX2Icon, EyeIcon, FileTextIcon, PenIcon, UserIcon } from "lucide-react"
import { Dispatch, SetStateAction } from "react"
import { format } from "date-fns"

import { ReviewStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

import { StartupFolderStatusBadge } from "../components/data/StartupFolderStatusBadge"
import { DocumentReviewForm } from "../components/dialogs/DocumentReviewForm"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Button } from "@/shared/components/ui/button"

import type { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import type { ColumnDef, Row, Table } from "@tanstack/react-table"
import type { BasicStartupFolderDocument } from "../types"
import type { BasicDocumentType } from "@prisma/client"

interface GetBasicDocumentColumnsProps {
	userId: string
	refetch: (options?: RefetchOptions) => Promise<
		QueryObserverResult<
			{
				totalDocuments: number
				approvedDocuments: number
				folderStatus: ReviewStatus
				documents: BasicStartupFolderDocument[]
			},
			Error
		>
	>
	startupFolderId: string
	isOtcMember: boolean
	folderStatus: ReviewStatus | undefined
	setSelectedDocumentType: Dispatch<
		SetStateAction<{
			type: BasicDocumentType
			name: string
		} | null>
	>
	setSelectedDocument: (document: BasicStartupFolderDocument) => void
	setShowUploadDialog: (show: boolean) => void
}

export const getBasicDocumentColumns = ({
	userId,
	refetch,
	isOtcMember,
	startupFolderId,
	folderStatus,
	setSelectedDocumentType,
	setShowUploadDialog,
	setSelectedDocument,
}: GetBasicDocumentColumnsProps): ColumnDef<BasicStartupFolderDocument>[] => [
	...(isOtcMember
		? [
				{
					id: "select",
					header: ({ table }: { table: Table<BasicStartupFolderDocument> }) => (
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
					cell: ({ row }: { row: Row<BasicStartupFolderDocument> }) => (
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

			return (
				<div className="flex items-center gap-1">
					<UserIcon className="text-muted-foreground size-3.5" />
					{uploadedBy?.name ?? "Usuario desconocido"}
				</div>
			)
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
					{doc.url && (
						<Button
							size={"icon"}
							variant="ghost"
							className="text-teal-600"
							onClick={() => window.open(doc.url!, "_blank")}
						>
							<EyeIcon className="h-4 w-4" />
						</Button>
					)}

					{!isOtcMember &&
						folderStatus === "DRAFT" &&
						(doc.status === "DRAFT" ||
							doc.status === "REJECTED" ||
							doc.status === "TO_UPDATE" ||
							doc.status === "EXPIRED") && (
							<Button
								size={"icon"}
								variant="ghost"
								className="text-cyan-600"
								onClick={() => {
									const baseDoc: BasicStartupFolderDocument = {
										id: doc.id,
										url: doc.url,
										name: doc.name,
										type: doc.type,
										status: doc.status,
										reviewer: doc.reviewer,
										folderId: doc.folderId,
										category: doc.category,
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

					{isOtcMember && doc.status === "SUBMITTED" && (
						<DocumentReviewForm
							document={doc}
							userId={userId}
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
