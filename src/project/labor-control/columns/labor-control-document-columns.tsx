"use client"

import { Dispatch, SetStateAction } from "react"
import { getImageProps } from "next/image"
import { format } from "date-fns"
import { PenIcon, UserIcon, MailIcon, PhoneIcon, FileTextIcon } from "lucide-react"

import { LABOR_CONTROL_STATUS } from "@prisma/client"
import { cn } from "@/lib/utils"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card"
import { LaborControlFolderStatusBadge } from "../components/data/LaborControlFolderStatusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { DocumentReviewForm } from "../components/dialogs/DocumentReviewForm"
import DocumentViewButton from "../components/data/DocumentViewButton"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Button } from "@/shared/components/ui/button"

import type { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import type { ColumnDef, Row, Table } from "@tanstack/react-table"
import type { LABOR_CONTROL_DOCUMENT_TYPE } from "@prisma/client"
import type { LaborControlDocument } from "../types"

interface GetDocumentColumnsProps {
	userId: string
	refetch: (options?: RefetchOptions) => Promise<
		QueryObserverResult<
			{
				documents: LaborControlDocument[]
			},
			Error
		>
	>
	folderId: string
	isOtcMember: boolean
	folderStatus: LABOR_CONTROL_STATUS | undefined
	setSelectedDocumentType: Dispatch<
		SetStateAction<{
			type: LABOR_CONTROL_DOCUMENT_TYPE
			name: string
		} | null>
	>
	setSelectedDocument: (document: LaborControlDocument) => void
	setShowUploadDialog: (show: boolean) => void
}

export const getLaborControlDocumentColumns = ({
	userId,
	refetch,
	folderId,
	isOtcMember,
	folderStatus,
	setShowUploadDialog,
	setSelectedDocument,
	setSelectedDocumentType,
}: GetDocumentColumnsProps): ColumnDef<LaborControlDocument>[] => [
	...(isOtcMember
		? [
				{
					id: "select",
					header: ({ table }: { table: Table<LaborControlDocument> }) => (
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
					cell: ({ row }: { row: Row<LaborControlDocument> }) => (
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
						<FileTextIcon className="h-4 w-4 text-blue-500" />
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

			const { props } = getImageProps({
				width: 32,
				height: 32,
				alt: uploadedBy?.name || "",
				src: uploadedBy?.image || "",
			})

			return uploadedBy ? (
				<HoverCard openDelay={200}>
					<HoverCardTrigger className="text-text flex w-32 cursor-pointer items-center gap-1.5 truncate select-none hover:underline">
						<UserIcon className="text-muted-foreground min-h-3.5 max-w-3.5 min-w-3.5" />
						<span className="line-clamp-1 w-52 truncate">{uploadedBy.name || "Interno"}</span>
					</HoverCardTrigger>

					<HoverCardContent className="flex w-fit gap-2" side="top">
						<Avatar>
							<AvatarImage {...props} />
							<AvatarFallback>{uploadedBy.name?.slice(0, 2) || ""}</AvatarFallback>
						</Avatar>

						<div className="flex flex-col gap-2">
							<div className="text-text">
								<p className="font-bold">{uploadedBy.name || ""}</p>
								<p className="text-muted-foreground text-sm">{uploadedBy.rut || ""}</p>
								<p className="mt-2 flex items-center gap-1 text-sm font-semibold">
									<MailIcon className="mt-0.5 size-3" />
									{uploadedBy.email || ""}
								</p>
								{uploadedBy.phone && (
									<p className="mt-1 flex items-center gap-1 text-sm font-semibold">
										<PhoneIcon className="size-3" />
										{uploadedBy.phone}
									</p>
								)}
							</div>
						</div>
					</HoverCardContent>
				</HoverCard>
			) : (
				<></>
			)
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

					{!isOtcMember &&
						folderStatus === "DRAFT" &&
						(doc.status === "DRAFT" || doc.status === "REJECTED") && (
							<Button
								size={"icon"}
								variant="ghost"
								className="text-cyan-600"
								onClick={() => {
									const baseDoc: LaborControlDocument = {
										id: doc.id,
										url: doc.url,
										type: doc.type,
										name: doc.name,
										updatedAt: doc.updatedAt,
										uploadById: doc.uploadById,
										status: doc.status,
										reviewBy: doc.reviewBy,
										folderId: doc.folderId,
										uploadBy: doc.uploadBy,
										reviewById: doc.reviewById,
										reviewDate: doc.reviewDate,
										uploadDate: doc.uploadDate,
										reviewNotes: doc.reviewNotes,
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
							folderId={folderId}
						/>
					)}
				</div>
			)
		},
	},
]
