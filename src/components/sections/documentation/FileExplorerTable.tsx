"use client"

import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import {
	Edit,
	Info,
	Sheet,
	Folder,
	FileText,
	FolderCog,
	FolderLock,
	FolderCheck,
	FolderClock,
	FolderHeart,
	Image as ImageIcon,
} from "lucide-react"

import { useDocuments } from "@/hooks/use-documents"
import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import DeleteConfirmationDialog from "./DeleteConfirmationDialog"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

import type { AREAS } from "@prisma/client"

interface FileExplorerTableProps {
	userId: string
	areaValue: AREAS
	lastPath?: string
	foldersSlugs: string[]
	actualFolderSlug?: string | null
}

export function FileExplorerTable({
	userId,
	lastPath,
	areaValue,
	foldersSlugs,
	actualFolderSlug = null,
}: FileExplorerTableProps) {
	const getFileIcon = (type: string) => {
		switch (true) {
			case type.includes("document"):
				return <FileText className="min-h-6 min-w-6 text-red-600" />
			case type.includes("image"):
				return <ImageIcon className="min-h-6 min-w-6 text-blue-600" />
			case type.includes("excel"):
				return <Sheet className="min-h-6 min-w-6 text-green-600" />
			default:
				return <FileText className="min-h-6 min-w-6 text-red-600" />
		}
	}

	const getFolderIcon = (area: string) => {
		switch (area) {
			case "DONE":
				return <FolderCheck className="min-h-6 min-w-6 text-green-600" />
			case "PENDING":
				return <FolderClock className="min-h-6 min-w-6 text-purple-600" />
			case "SETTINGS":
				return <FolderCog className="min-h-6 min-w-6 text-blue-600" />
			case "FAVORITES":
				return <FolderHeart className="min-h-6 min-w-6 text-red-600" />
			case "PRIVATE":
				return <FolderLock className="min-h-6 min-w-6 text-gray-600" />
			default:
				return <Folder className="min-h-6 min-w-6 text-yellow-600" />
		}
	}

	const { data, isLoading } = useDocuments({
		area: areaValue,
		folderSlug: actualFolderSlug,
	})

	return (
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
						<Card key={item.id} className="relative">
							<CardContent className="flex flex-col gap-2">
								<div className="flex items-center gap-2">
									{getFolderIcon(item.area)}
									<Link
										href={`/dashboard/documentacion/${foldersSlugs.join("/")}/${item.slug}`}
										className="pr-6 font-medium hover:underline"
									>
										{item.name}
									</Link>
								</div>

								{item.description && (
									<p className="text-muted-foreground line-clamp-2 text-sm">{item.description}</p>
								)}

								<div className="absolute top-4 right-4 flex gap-1">
									<Popover>
										<PopoverTrigger asChild>
											<Button
												size="icon"
												className="bg-primary/20 text-text hover:bg-primary h-8 w-8"
											>
												<Info className="h-4 w-4" />
											</Button>
										</PopoverTrigger>
										<PopoverContent align="end" className="w-80">
											<div className="grid gap-2">
												<div className="space-y-1">
													<h4 className="font-medium">Información de la carpeta</h4>
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

												{item.userId === userId && (
													<div className="mt-4 flex gap-2">
														<Link
															href={`/dashboard/documentacion/actualizar-carpeta/${item.id}?lastPath=${lastPath}`}
															className="w-full"
														>
															<Button className="hover:bg-primary w-full hover:brightness-90">
																<Edit className="mr-2 h-4 w-4" />
																Editar
															</Button>
														</Link>
														<DeleteConfirmationDialog id={item.id} name={item.name} type="folder" />
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
										className="pr-6 font-medium hover:underline"
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
									<Popover>
										<PopoverTrigger asChild>
											<Button
												size="icon"
												className="bg-primary/20 text-text hover:bg-primary h-8 w-8"
											>
												<Info className="h-4 w-4" />
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

												{item.userId === userId && (
													<div className="mt-4 flex gap-2">
														<Link
															href={`/dashboard/documentacion/actualizar-archivo/${item.id}?lastPath=${lastPath}`}
															className="w-full"
														>
															<Button className="hover:bg-primary w-full hover:brightness-90">
																<Edit className="mr-2 h-4 w-4" />
																Editar
															</Button>
														</Link>
														<DeleteConfirmationDialog id={item.id} name={item.name} type="file" />
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
						<div className="text-text bg-primary/10 border-primary col-span-full mx-auto flex items-center gap-2 rounded-xl border px-8 py-4 text-center font-medium">
							<Info className="text-primary h-7 w-7" />
							No hay archivos ni carpetas en esta ubicación
						</div>
					)}
				</>
			)}
		</div>
	)
}
