"use client"

import { File, FileText, ImageIcon } from "lucide-react"

import { cn, getFileExtension, formatBytes } from "@/lib/utils"

import { Card } from "./card"

import type { FileSchema } from "@/lib/form-schemas/document-management/file.schema"

interface FileCardProps {
	file: FileSchema
	isSelected: boolean
	onClick: () => void
}

export function FileCard({ file, isSelected, onClick }: FileCardProps) {
	const getIcon = () => {
		if (file.type.startsWith("image/"))
			return <ImageIcon className="h-10 w-10 rounded-lg bg-yellow-500/20 p-1.5 text-yellow-500" />
		return file.type === "application/pdf" ? (
			<FileText className="h-10 w-10 rounded-lg bg-red-500/20 p-1.5 text-red-500" />
		) : (
			<File className="h-10 w-10 rounded-lg bg-blue-500/20 p-1.5 text-blue-500" />
		)
	}

	const Icon = getIcon()
	const size = formatBytes(file.fileSize)

	return (
		<Card
			className={cn(
				"h-full cursor-pointer border border-dashed border-green-500 bg-green-500/10 p-4 transition-all",
				{ "border-green-500 bg-green-500/40": isSelected }
			)}
			onClick={onClick}
		>
			<div className="flex flex-col items-center gap-3 text-center">
				{Icon}

				<div className="min-w-0 flex-1">
					<p
						className={cn("text-sm font-medium", {
							"font-bold": isSelected,
						})}
					>
						{file.title.length > 20
							? file.title.substring(0, 15) + "..." + getFileExtension(file.title)
							: file.title}
					</p>
					<p className="text-muted-foreground text-sm">{size}</p>
				</div>
			</div>
		</Card>
	)
}
