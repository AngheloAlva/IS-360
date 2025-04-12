"use client"

import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import {
	Edit,
	FileIcon,
	FileText,
	ImageIcon,
	VideoIcon,
	FolderIcon,
	FolderCogIcon,
	FolderLockIcon,
	FolderCheckIcon,
	FolderClockIcon,
	FolderHeartIcon,
} from "lucide-react"

import { useDocuments } from "@/hooks/use-documents"
import { cn } from "@/lib/utils"

import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/components/ui/table"

import type { AREAS, File, Folder } from "@prisma/client"
import DeleteConfirmationDialog from "./DeleteConfirmationDialog"

interface FileExplorerTableProps {
	userId: string
	lastPath?: string
	areaValue: AREAS
	className?: string
	foldersSlugs: string[]
	actualFolderSlug?: string | null
}

export function FileExplorerTable({
	userId,
	lastPath,
	className,
	areaValue,
	foldersSlugs,
	actualFolderSlug = null,
}: FileExplorerTableProps) {
	const getFileIcon = (item: File) => {
		const type = item.type.split("/")[0]

		switch (type) {
			case "application":
				return <FileText className="h-5 w-5 text-red-500" />
			case "image":
				return <ImageIcon className="h-5 w-5 text-green-500" />
			case "video":
				return <VideoIcon className="h-5 w-5 text-orange-500" />
			default:
				return <FileIcon className="h-5 w-5 text-gray-500" />
		}
	}

	const getFolderIcon = (type: Folder["type"]) => {
		switch (type) {
			case "default":
				return <FolderIcon className="h-5 w-5 text-yellow-500" />
			case "check":
				return <FolderCheckIcon className="h-5 w-5 text-green-500" />
			case "clock":
				return <FolderClockIcon className="h-5 w-5 text-blue-500" />
			case "service":
				return <FolderCogIcon className="h-5 w-5 text-indigo-500" />
			case "favorite":
				return <FolderHeartIcon className="h-5 w-5 text-red-500" />
			case "lock":
				return <FolderLockIcon className="h-5 w-5 text-gray-500" />
			default:
				return <FolderIcon className="h-5 w-5 text-yellow-500" />
		}
	}

	const { data, isLoading } = useDocuments({
		area: areaValue,
		folderSlug: actualFolderSlug,
	})

	return (
		<Table className={cn("rounded-md bg-white p-2", className)}>
			<TableHeader>
				<TableRow>
					<TableHead>Codigo-Nombre</TableHead>
					<TableHead>Estatus</TableHead>
					<TableHead>Descripcion</TableHead>
					<TableHead>Fecha de Registro</TableHead>
					<TableHead>Fecha de Expiracion</TableHead>
					<TableHead>Usuario</TableHead>
					<TableHead>Revisiones / Actualizacion</TableHead>
					{<TableHead></TableHead>}
				</TableRow>
			</TableHeader>

			<TableBody>
				{isLoading ? (
					Array.from({ length: 5 }).map((_, index) => (
						<TableRow key={index}>
							<TableCell colSpan={8}>
								<Skeleton className="h-9 w-full" />
							</TableCell>
						</TableRow>
					))
				) : (
					<>
						{data?.folders?.map((item) => (
							<TableRow key={item.id}>
								<TableCell>
									<div className="flex items-center gap-2">
										{getFolderIcon(item.type)}
										<Link
											href={`/dashboard/documentacion/${foldersSlugs.join("/")}/${item.slug}`}
											className="font-medium hover:underline"
										>
											{item.name}
										</Link>
									</div>
								</TableCell>
								<TableCell></TableCell>
								<TableCell className="max-w-52 overflow-hidden whitespace-normal">
									{item.description}
								</TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
								<TableCell>{item.user?.name}</TableCell>
								<TableCell>
									{formatDistanceToNow(item.updatedAt, {
										addSuffix: true,
										locale: es,
									})}
								</TableCell>

								{item.userId === userId && (
									<TableCell className="space-x-1">
										<Link
											href={`/dashboard/documentacion/actualizar-carpeta/${item.id}?lastPath=${lastPath}`}
										>
											<Button
												size="icon"
												variant="outline"
												className="text-primary hover:bg-primary bg-white hover:text-white"
											>
												<Edit className="h-4 w-4" />
											</Button>
										</Link>
										<DeleteConfirmationDialog id={item.id} name={item.name} type="folder" />
									</TableCell>
								)}
							</TableRow>
						))}

						{data?.files?.map((item) => (
							<TableRow key={item.id}>
								<TableCell>
									<div className="flex items-center gap-2">
										{getFileIcon(item)}
										<Link
											href={item.url}
											target="_blank"
											rel="noreferrer noopener"
											className="font-medium hover:underline"
										>
											{item?.code?.charAt(0) + "-" + item.name}
										</Link>
									</div>
								</TableCell>
								<TableCell>
									{item.expirationDate
										? item.expirationDate < new Date()
											? "Expirado"
											: "Vigente"
										: "Vigente"}
								</TableCell>
								<TableCell>{item.description}</TableCell>
								<TableCell>{format(item.registrationDate, "dd/MM/yyyy")}</TableCell>
								<TableCell>
									{item.expirationDate ? format(item.expirationDate, "dd/MM/yyyy") : "N/A"}
								</TableCell>
								<TableCell>{item.user?.name}</TableCell>
								<TableCell>{item.revisionCount}</TableCell>

								{item.userId === userId && (
									<TableCell className="space-x-1">
										<Link
											href={`/dashboard/documentacion/actualizar-archivo/${item.id}?lastPath=${lastPath}`}
										>
											<Button
												size="icon"
												variant="outline"
												className="text-primary hover:bg-primary bg-white hover:text-white"
											>
												<Edit className="h-4 w-4" />
											</Button>
										</Link>

										<DeleteConfirmationDialog id={item.id} name={item.name} type="file" />
									</TableCell>
								)}
							</TableRow>
						))}

						{data?.folders?.length === 0 && data?.files?.length === 0 && (
							<TableRow>
								<TableCell colSpan={8} className="py-8 text-center text-gray-500">
									No hay archivos ni carpetas en esta ubicación
								</TableCell>
							</TableRow>
						)}
					</>
				)}
			</TableBody>
		</Table>
	)
}
