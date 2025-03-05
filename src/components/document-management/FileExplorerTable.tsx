import { FolderIcon, ImageIcon, VideoIcon, FileIcon, FileText } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

import { Codes } from "@/lib/consts/codes"

import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableCaption,
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

	console.log(foldersIds)

	return (
		<Table>
			<TableCaption>
				<div className="mx-auto flex w-fit items-center gap-10">
					{Codes.map((code) => (
						<div key={code}>
							{code.charAt(0)}: {code}
						</div>
					))}
				</div>
			</TableCaption>

			<TableHeader>
				<TableRow>
					<TableHead>Codigo-Nombre</TableHead>
					<TableHead>Estatus</TableHead>
					<TableHead>Descripcion</TableHead>
					<TableHead>Fecha de Registro</TableHead>
					<TableHead>Fecha de Expiracion</TableHead>
					<TableHead>Revisiones</TableHead>
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
						<TableCell>{item.description}</TableCell>
						<TableCell></TableCell>
						<TableCell></TableCell>
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
									{item.code.charAt(0) + "-" + item.name}
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
						<TableCell>{item.type}</TableCell>
						<TableCell>{format(item.registrationDate, "dd/MM/yyyy")}</TableCell>
						<TableCell>
							{item.expirationDate ? format(item.expirationDate, "dd/MM/yyyy") : "N/A"}
						</TableCell>
						<TableCell>{item.revisionCount}</TableCell>
					</TableRow>
				))}

				{folders.length === 0 && files.length === 0 && (
					<TableRow>
						<TableCell colSpan={6} className="py-8 text-center text-gray-500">
							No hay archivos ni carpetas en esta ubicación
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	)
}
