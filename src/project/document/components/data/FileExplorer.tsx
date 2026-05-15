"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
	InfoIcon,
	ImageIcon,
	SheetIcon,
	FolderIcon,
	SquareXIcon,
	FileTextIcon,
	DownloadIcon,
	FolderCogIcon,
	FolderLockIcon,
	FolderCheckIcon,
	FolderClockIcon,
	FolderHeartIcon,
	FileArchiveIcon,
} from "lucide-react"

import { downloadMultipleDocumentsSecurely, extractFilenameFromUrl } from "@/lib/view-document"
import { useFileSelectionStore } from "@/project/document/stores/use-file-selection-store"
import { fetchDocuments, useDocuments } from "@/project/document/hooks/use-documents"
import { queryClient } from "@/lib/queryClient"

import { NewFileFormSheet } from "@/project/document/components/forms/NewFileFormSheet"
import NewFolderFormSheet from "@/project/document/components/forms/NewFolderFormSheet"
import { Card, CardContent } from "@/shared/components/ui/card"
import OrderByButton from "@/shared/components/OrderByButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import BackButton from "@/shared/components/BackButton"
import { Button } from "@/shared/components/ui/button"
import FolderExplorerItem from "./FolderExplorerItem"
import FileExplorerItem from "./FileExplorerItem"
import Spinner from "@/shared/components/Spinner"

import type { Areas } from "@/lib/consts/areas"
import type { AREAS } from "@/generated/prisma/enums"

interface FileExplorerTableProps {
	userId: string
	areaName: string
	areaValue: AREAS
	backPath?: string
	canUpdate: boolean
	canCreate: boolean
	foldersSlugs: string[]
	area: keyof typeof Areas
	userRole?: string | null
	userDocumentAreas?: AREAS[]
	actualFolderId?: string | null
}

export function FileExplorer({
	area,
	userId,
	backPath,
	areaName,
	areaValue,
	canUpdate,
	canCreate,
	foldersSlugs,
	actualFolderId = null,
	userDocumentAreas = [],
}: FileExplorerTableProps) {
	const [orderBy, setOrderBy] = useState<"name" | "createdAt">("name")
	const [order, setOrder] = useState<"asc" | "desc">("desc")

	const canEdit = (userCreatorId: string) => {
		return userCreatorId === userId || userDocumentAreas.includes(areaValue) || canUpdate
	}

	const getFileIcon = (type: string) => {
		switch (true) {
			case type.includes("pdf"):
				return <FileTextIcon className="min-h-5 min-w-5 text-red-600" />
			case type.includes("image"):
				return <ImageIcon className="min-h-5 min-w-5 text-yellow-600" />
			case type.includes("excel"):
				return <SheetIcon className="min-h-5 min-w-5 text-green-600" />
			case type.includes("sheet"):
				return <SheetIcon className="min-h-5 min-w-5 text-green-600" />
			case type.includes("zip"):
				return <FileArchiveIcon className="min-h-5 min-w-5 text-purple-600" />
			case type.includes("word"):
				return <FileTextIcon className="min-h-5 min-w-5 text-blue-600" />
			default:
				return <FileTextIcon className="min-h-5 min-w-5 text-red-600" />
		}
	}

	const getFolderIcon = (type: string) => {
		switch (type) {
			case "check":
				return <FolderCheckIcon className="min-h-5 min-w-5 text-green-600" />
			case "clock":
				return <FolderClockIcon className="min-h-5 min-w-5 text-purple-600" />
			case "service":
				return <FolderCogIcon className="min-h-5 min-w-5 text-blue-600" />
			case "favorite":
				return <FolderHeartIcon className="min-h-5 min-w-5 text-red-600" />
			case "lock":
				return <FolderLockIcon className="min-h-5 min-w-5 text-gray-600" />
			default:
				return <FolderIcon className="min-h-5 min-w-5 text-yellow-600" />
		}
	}

	const { data, isLoading } = useDocuments({
		order,
		orderBy,
		area: areaValue,
		folderId: actualFolderId,
	})

	const prefetchFolder = (folderId: string | null) => {
		return queryClient.prefetchQuery({
			queryKey: ["documents", { area: areaValue, folderId, order: "desc", orderBy: "name" }],
			queryFn: fetchDocuments,
			staleTime: 5 * 60 * 1000,
		})
	}

	const { selectedFiles, clearSelection } = useFileSelectionStore()
	const [isDownloading, setIsDownloading] = useState(false)

	const handleDownloadSelected = async () => {
		if (selectedFiles.length === 0) return

		setIsDownloading(true)
		try {
			const filenames = selectedFiles
				.map((file) => extractFilenameFromUrl(file.url))
				.filter((name): name is string => !!name)

			if (filenames.length === 0) {
				toast.error("No se pudieron obtener los nombres de archivo")
				return
			}

			await downloadMultipleDocumentsSecurely(filenames, "documents")
			clearSelection()
			toast.success("Descarga iniciada")
		} catch (error) {
			console.error(error)
			toast.error("Error al descargar archivos")
		} finally {
			setIsDownloading(false)
		}
	}

	return (
		<>
			<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<BackButton href={backPath || "/admin/dashboard/documentacion"} />

					<h1 className="text-text text-2xl font-bold lg:text-3xl">{areaName}</h1>
				</div>

				<div className="flex w-full items-center gap-2 md:w-fit">
					{selectedFiles.length > 0 && (
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								onClick={() => clearSelection()}
								className="text-muted-foreground"
							>
								<SquareXIcon className="h-4 w-4" /> ({selectedFiles.length})
							</Button>
							<Button variant="default" onClick={handleDownloadSelected} disabled={isDownloading}>
								{isDownloading ? (
									<Spinner className="h-4 w-4" />
								) : (
									<DownloadIcon className="h-4 w-4" />
								)}
							</Button>
						</div>
					)}

					<OrderByButton
						className="h-9 w-full md:w-fit"
						onChange={(orderBy, order) => {
							setOrderBy(orderBy)
							setOrder(order)
						}}
					/>

					{canCreate && (
						<>
							<NewFileFormSheet area={area} userId={userId} parentFolderId={actualFolderId} />

							<NewFolderFormSheet area={area} userId={userId} parentFolderId={actualFolderId} />
						</>
					)}
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				{isLoading ? (
					Array.from({ length: 8 }).map((_, index) => (
						<Card key={index} className="animate-pulse">
							<CardContent>
								<Skeleton className="h-20 w-full" />
							</CardContent>
						</Card>
					))
				) : (
					<>
						{data?.folders?.map((item) => {
							const canEditFolder = canEdit(item.userId)
							const icon = getFolderIcon(item.type)

							return (
								<FolderExplorerItem
									icon={icon}
									item={item}
									key={item.id}
									userId={userId}
									canEdit={canEditFolder}
									foldersSlugs={foldersSlugs}
									prefetchFolder={prefetchFolder}
								/>
							)
						})}

						{data?.files?.map((item) => {
							const canEditFile = canEdit(item.userId)
							const icon = getFileIcon(item.type)

							return (
								<FileExplorerItem
									icon={icon}
									item={item}
									key={item.id}
									userId={userId}
									canEdit={canEditFile}
								/>
							)
						})}

						{data?.folders?.length === 0 && data?.files?.length === 0 && (
							<div className="text-text bg-primary/10 border-primary col-span-full mx-auto mt-20 flex items-center gap-2 rounded-xl border px-8 py-4 text-center font-semibold">
								<InfoIcon className="text-primary h-7 w-7" />
								No hay archivos ni carpetas en esta ubicación
							</div>
						)}
					</>
				)}
			</div>
		</>
	)
}
