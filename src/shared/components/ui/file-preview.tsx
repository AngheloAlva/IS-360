"use client"

import { FileText, FileSpreadsheet, FileImage } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

import { cn, formatBytes, getFileExtension } from "@/lib/utils"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"

import type { FileSchema } from "@/shared/schemas/file.schema"

interface FilePreviewProps {
	file: FileSchema | null
	className?: string
}

export function FilePreview({ file, className }: FilePreviewProps) {
	const [activeTab, setActiveTab] = useState("preview")

	if (!file)
		return (
			<div className={cn("h-fit", className)}>
				<h3 className="text-lg font-medium">Vista Previa</h3>
				<p className="text-muted-foreground">Selecciona un archivo para ver su vista previa</p>
			</div>
		)

	return (
		<div className={cn("h-fit", className)}>
			<h3 className="text-lg font-medium">Vista Previa</h3>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2 h-full">
				<TabsList className="w-full">
					<TabsTrigger value="preview">Vista Previa</TabsTrigger>
					<TabsTrigger value="details">Detalles</TabsTrigger>
				</TabsList>

				<TabsContent value="preview">
					{file.type.includes("pdf") ? (
						<div className="h-full max-h-96 w-full overflow-hidden rounded-lg border">
							<iframe
								loading="lazy"
								allowFullScreen
								allow="fullscreen"
								src={file.preview}
								className="min-h-96 w-full"
							/>
						</div>
					) : file.type.includes("image") ? (
						<div className="relative h-full min-h-96 w-full overflow-hidden rounded-lg border p-4">
							<Image fill alt={file.title} src={file.preview} className="object-contain" />
						</div>
					) : (
						<div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-lg border p-4">
							{file.type.includes("sheet") || file.type.includes("excel") ? (
								<FileSpreadsheet className="h-16 w-16 text-gray-400 xl:h-20 xl:w-20" />
							) : file.type.includes("image") ? (
								<FileImage className="h-16 w-16 text-gray-400 xl:h-20 xl:w-20" />
							) : (
								<FileText className="h-16 w-16 text-gray-400 xl:h-20 xl:w-20" />
							)}
							<div className="text-center">
								<p className="font-medium xl:text-lg">{file.title}</p>
								<p className="text-sm text-gray-500">
									Vista previa no disponible para este tipo de archivo
								</p>
							</div>
						</div>
					)}
				</TabsContent>

				<TabsContent value="details">
					<div className="space-y-4">
						<div>
							<h4 className="font-medium">Nombre</h4>
							<p className="text-muted-foreground">{file.title}</p>
						</div>
						<div>
							<h4 className="font-medium">Tipo</h4>
							<p className="text-muted-foreground">{getFileExtension(file.type)}</p>
						</div>
						<div>
							<h4 className="font-medium">Tamaño</h4>
							<p className="text-muted-foreground">{formatBytes(file.fileSize)}</p>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
