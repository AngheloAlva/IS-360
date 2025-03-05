import { FolderIcon, FileTextIcon, ImageIcon, VideoIcon, FileIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

import { formatBytes } from "@/utils/formatBytes"

import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/components/ui/table"

import type { File, Folder } from "@prisma/client"

type FullFolder = Folder & {
	files: File[]
	subFolders: Folder[]
}

interface FileExplorerTableProps {
	files: File[]
	foldersIds: string[]
	folders: FullFolder[]
}

export function FileExplorerTable({ files, folders, foldersIds }: FileExplorerTableProps) {
	const getFileIcon = (item: File) => {
		const type = item.type.split("/")[0]

		switch (type) {
			case "document":
				return <FileTextIcon className="h-5 w-5 text-blue-500" />
			case "image":
				return <ImageIcon className="h-5 w-5 text-green-500" />
			case "video":
				return <VideoIcon className="h-5 w-5 text-red-500" />
			default:
				return <FileIcon className="h-5 w-5 text-gray-500" />
		}
	}

	console.log(foldersIds)

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[40%]">Nombre</TableHead>
					<TableHead className="w-[20%]">Tipo</TableHead>
					<TableHead className="w-[20%]">Tamaño</TableHead>
					<TableHead className="w-[20%]">Última Modificación</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{folders?.map((item) => (
					<TableRow key={item.id}>
						<TableCell>
							<div className="flex items-center gap-2">
								<FolderIcon className="h-5 w-5 text-yellow-500" />
								<Link
									href={`/dashboard/documentacion/${foldersIds.join("/")}/${item.id}`}
									className="font-medium hover:underline"
								>
									{item.name}
								</Link>
							</div>
						</TableCell>
						<TableCell></TableCell>
						<TableCell>
							Carpeta con {item.subFolders.length} subcarpetas y {item.files.length} archivos
						</TableCell>
						<TableCell>
							{formatDistanceToNow(item.updatedAt, {
								addSuffix: true,
								locale: es,
							})}
						</TableCell>
					</TableRow>
				))}

				{files?.map((item) => (
					<TableRow key={item.id}>
						<TableCell>
							<div className="flex items-center gap-2">
								{getFileIcon(item)}
								<Link href={item.url} className="font-medium hover:underline">
									{item.name}
								</Link>
							</div>
						</TableCell>
						<TableCell>{item.type}</TableCell>
						<TableCell>{formatBytes(item.size)}</TableCell>
						<TableCell>
							{formatDistanceToNow(item.updatedAt, {
								addSuffix: true,
								locale: es,
							})}
						</TableCell>
					</TableRow>
				))}

				{folders.length === 0 && files.length === 0 && (
					<TableRow>
						<TableCell colSpan={4} className="py-8 text-center text-gray-500">
							No hay archivos ni carpetas en esta ubicación
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	)
}
