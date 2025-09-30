"use client"

import { Dispatch, SetStateAction } from "react"
import { getImageProps } from "next/image"
import { format } from "date-fns"
import { PenIcon, MailIcon, UserIcon, PhoneIcon, FileTextIcon, CalendarX2Icon } from "lucide-react"

import { ReviewStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card"
import { StartupFolderStatusBadge } from "../components/data/StartupFolderStatusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { DocumentReviewForm } from "../components/dialogs/DocumentReviewForm"
import DocumentViewButton from "../components/data/DocumentViewButton"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Button } from "@/shared/components/ui/button"

import type { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import type { ColumnDef, Row, Table } from "@tanstack/react-table"
import type { WorkerStartupFolderDocument } from "../types"
import type { WorkerDocumentType } from "@prisma/client"

interface GetWorkerDocumentColumnsProps {
	userId: string
	companyId: string
	refetch: (options?: RefetchOptions) => Promise<
		QueryObserverResult<
			{
				documents: WorkerStartupFolderDocument[]
				folderStatus: ReviewStatus
				totalDocuments: number
				approvedDocuments: number
				isDriver: boolean
			},
			Error
		>
	>
	startupFolderId: string
	isOtcMember: boolean
	folderStatus: ReviewStatus | undefined
	setSelectedDocumentType: Dispatch<
		SetStateAction<{
			type: WorkerDocumentType
			name: string
		} | null>
	>
	setSelectedDocument: (document: WorkerStartupFolderDocument) => void
	setShowUploadDialog: (show: boolean) => void
}

export const getWorkerDocumentColumns = ({
	userId,
	refetch,
	companyId,
	isOtcMember,
	startupFolderId,
	folderStatus,
	setSelectedDocumentType,
	setShowUploadDialog,
	setSelectedDocument,
}: GetWorkerDocumentColumnsProps): ColumnDef<WorkerStartupFolderDocument>[] => [
	...(isOtcMember
		? [
				{
					id: "select",
					header: ({ table }: { table: Table<WorkerStartupFolderDocument> }) => (
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
					cell: ({ row }: { row: Row<WorkerStartupFolderDocument> }) => (
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

					{!isOtcMember &&
						(folderStatus === "DRAFT" || folderStatus === "EXPIRED") &&
						(doc.status === "DRAFT" ||
							doc.status === "REJECTED" ||
							doc.status === "TO_UPDATE" ||
							doc.status === "EXPIRED") && (
							<Button
								size={"icon"}
								variant="ghost"
								className="text-cyan-600"
								onClick={() => {
									const baseDoc: WorkerStartupFolderDocument = {
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
