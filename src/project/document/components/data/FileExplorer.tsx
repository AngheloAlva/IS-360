"use client"

import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import {
	InfoIcon,
	ImageIcon,
	SheetIcon,
	FolderIcon,
	FileTextIcon,
	FolderCogIcon,
	FolderLockIcon,
	FolderCheckIcon,
	FolderClockIcon,
	FolderHeartIcon,
	FileArchiveIcon,
} from "lucide-react"

import { fetchDocuments, useDocuments } from "@/project/document/hooks/use-documents"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"

import { UpdateFileFormSheet } from "@/project/document/components/forms/UpdateFileFormSheet"
import UpdateFolderFormSheet from "@/project/document/components/forms/UpdateFolderFormSheet"
import { NewFileFormSheet } from "@/project/document/components/forms/NewFileFormSheet"
import NewFolderFormSheet from "@/project/document/components/forms/NewFolderFormSheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import DeleteConfirmationDialog from "../forms/DeleteConfirmationDialog"
import { Card, CardContent } from "@/shared/components/ui/card"
import OrderByButton from "@/shared/components/OrderByButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import BackButton from "@/shared/components/BackButton"
import { Button } from "@/shared/components/ui/button"
import FileComments from "./FileComments"

import type { Areas } from "@/lib/consts/areas"
import type { AREAS } from "@prisma/client"
import { useState } from "react"

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
				return <FileTextIcon className="min-h-6 min-w-6 text-red-600" />
			case type.includes("image"):
				return <ImageIcon className="min-h-6 min-w-6 text-yellow-600" />
			case type.includes("excel"):
				return <SheetIcon className="min-h-6 min-w-6 text-green-600" />
			case type.includes("sheet"):
				return <SheetIcon className="min-h-6 min-w-6 text-green-600" />
			case type.includes("zip"):
				return <FileArchiveIcon className="min-h-6 min-w-6 text-purple-600" />
			case type.includes("word"):
				return <FileTextIcon className="min-h-6 min-w-6 text-blue-600" />
			default:
				return <FileTextIcon className="min-h-6 min-w-6 text-red-600" />
		}
	}

	const getFolderIcon = (type: string) => {
		switch (type) {
			case "check":
				return <FolderCheckIcon className="min-h-6 min-w-6 text-green-600" />
			case "clock":
				return <FolderClockIcon className="min-h-6 min-w-6 text-purple-600" />
			case "service":
				return <FolderCogIcon className="min-h-6 min-w-6 text-blue-600" />
			case "favorite":
				return <FolderHeartIcon className="min-h-6 min-w-6 text-red-600" />
			case "lock":
				return <FolderLockIcon className="min-h-6 min-w-6 text-gray-600" />
			default:
				return <FolderIcon className="min-h-6 min-w-6 text-yellow-600" />
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

	return (
		<>
			<div className="mb-8 flex gap-4 md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<BackButton href={backPath || "/admin/dashboard/documentacion"} />

					<h1 className="text-text text-3xl font-bold">{areaName}</h1>
				</div>

				{canCreate && (
					<div className="ml-auto flex gap-2">
						<OrderByButton
							onChange={(orderBy, order) => {
								setOrderBy(orderBy)
								setOrder(order)
							}}
						/>

						<NewFileFormSheet areaValue={areaValue} area={area} userId={userId} />

						<NewFolderFormSheet area={area} userId={userId} />
					</div>
				)}
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
						{data?.folders?.map((item) => (
							<Card key={item.id} className="relative" onMouseEnter={() => prefetchFolder(item.id)}>
								<CardContent className="flex flex-col gap-2">
									<div className="flex items-center gap-2">
										{getFolderIcon(item.type)}
										<Link
											prefetch={true}
											href={`/admin/dashboard/documentacion/${foldersSlugs.join("/")}/${item.slug + "_" + item.id}`}
											className="pr-12 font-medium hover:underline"
										>
											{item.name}
										</Link>
									</div>

									{item.description && (
										<p className="text-muted-foreground line-clamp-2 text-sm">{item.description}</p>
									)}

									<div className="mt-2 flex w-full items-center justify-end">
										<span className="w-fit rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-500">
											{item._count.files > 0 || item._count.subFolders > 0
												? "Si contiene información"
												: "No contiene información"}
										</span>
									</div>

									<div className="absolute top-4 right-4 flex gap-1">
										<Popover>
											<PopoverTrigger asChild>
												<Button
													size="icon"
													className="bg-primary/20 text-text hover:bg-primary h-8 w-8"
												>
													<InfoIcon className="h-4 w-4" />
												</Button>
											</PopoverTrigger>
											<PopoverContent align="end" className="w-80">
												<div className="grid gap-2">
													<div className="space-y-1">
														<h4 className="font-medium">Información de la carpeta</h4>
														<p className="text-muted-foreground text-sm">
															Creado por: <span className="font-semibold">{item.user?.name}</span>
														</p>
														<p className="text-muted-foreground text-sm">
															Última actualización:{" "}
															<span className="font-semibold">
																{formatDistanceToNow(item.updatedAt, {
																	addSuffix: true,
																	locale: es,
																})}
															</span>
														</p>
													</div>

													{canEdit(item.userId) && (
														<div className="mt-4 flex gap-2">
															<UpdateFolderFormSheet userId={userId} oldFolder={item} />
															<DeleteConfirmationDialog
																id={item.id}
																type="folder"
																name={item.name}
															/>
														</div>
													)}
												</div>
											</PopoverContent>
										</Popover>
									</div>
								</CardContent>
							</Card>
						))}

						{data?.files?.map((item) => (
							<Card key={item.id} className="relative max-w-full">
								<CardContent className="flex h-full flex-col justify-between gap-2">
									<div className="flex items-center gap-2">
										{getFileIcon(item.type)}

										<Link
											href={item.url}
											target="_blank"
											rel="noreferrer noopener"
											className="pr-12 font-medium hover:underline"
										>
											{item?.code ? item.code.charAt(0) + "-" + item.name : item.name}
										</Link>
									</div>

									{item.description && (
										<p className="text-muted-foreground line-clamp-2 text-sm">{item.description}</p>
									)}

									<div className="text-muted-foreground flex items-center justify-end gap-2 text-xs">
										<span>{item.revisionCount} revisiones</span>
										<span>•</span>
										<span
											className={cn(
												"rounded-full px-2 py-1 font-semibold",
												item.expirationDate && item.expirationDate < new Date()
													? "bg-red-500/10 text-red-500"
													: "bg-green-500/10 text-green-500"
											)}
										>
											{item.expirationDate
												? item.expirationDate < new Date()
													? "Expirado"
													: "Vigente"
												: "Vigente"}
										</span>
									</div>

									<div className="absolute top-4 right-4 flex gap-1">
										<FileComments fileId={item.id} comments={item.comments} userId={userId} />

										<Popover>
											<PopoverTrigger asChild>
												<Button
													size="icon"
													className="bg-primary/20 text-text hover:bg-primary h-8 w-8"
												>
													<InfoIcon className="h-4 w-4" />
												</Button>
											</PopoverTrigger>
											<PopoverContent align="end" className="w-80">
												<div className="grid gap-2">
													<div className="space-y-1">
														<h4 className="font-medium">Información del archivo</h4>
														<div className="grid gap-1">
															<p className="text-muted-foreground text-sm">
																Creado por: <span className="font-semibold">{item.user?.name}</span>
															</p>
															<p className="text-muted-foreground text-sm">
																Fecha de registro:{" "}
																<span className="font-semibold">
																	{format(item.registrationDate, "dd/MM/yyyy")}
																</span>
															</p>
															<p className="text-muted-foreground text-sm">
																Fecha de expiración:{" "}
																{item.expirationDate ? (
																	<span className="font-semibold">
																		{format(item.expirationDate, "dd/MM/yyyy")}
																	</span>
																) : (
																	"N/A"
																)}
															</p>
															<p className="text-muted-foreground text-sm">
																Última actualización:{" "}
																<span className="font-semibold">
																	{format(item.updatedAt, "dd/MM/yyyy")}
																</span>
															</p>
														</div>
													</div>

													{canEdit(item.userId) && (
														<div className="mt-4 flex gap-2">
															<UpdateFileFormSheet
																userId={userId}
																fileId={item.id}
																initialData={item}
																areaValue={areaValue}
																parentFolderId={item.folderId || undefined}
															/>
															<DeleteConfirmationDialog type="file" id={item.id} name={item.name} />
														</div>
													)}
												</div>
											</PopoverContent>
										</Popover>
									</div>
								</CardContent>
							</Card>
						))}

						{data?.folders?.length === 0 && data?.files?.length === 0 && (
							<div className="text-text bg-primary/10 border-primary col-span-full mx-auto mt-20 flex items-center gap-2 rounded-xl border px-8 py-4 text-center font-medium">
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
