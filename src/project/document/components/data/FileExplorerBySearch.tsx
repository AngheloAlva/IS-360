"use client"

import {
	Info,
	Sheet,
	FileText,
	SquareXIcon,
	FileArchive,
	DownloadIcon,
	Image as ImageIcon,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { downloadMultipleDocumentsSecurely, extractFilenameFromUrl } from "@/lib/view-document"
import { useFileSelectionStore } from "@/project/document/stores/use-file-selection-store"
import { useSearchDocuments } from "@/project/document/hooks/use-search-documents"
import { DocumentExpirations } from "@/lib/consts/document-expirations"

import { Skeleton } from "@/shared/components/ui/skeleton"
import BackButton from "@/shared/components/BackButton"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import Spinner from "@/shared/components/Spinner"
import FileExplorerItem from "./FileExplorerItem"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger,
} from "@/shared/components/ui/select"

export function FileExplorerBySearch() {
	const searchParams = useSearchParams()

	const [expiration, setExpiration] = useState<string>(searchParams.get("expiration") || "all")
	const [search, setSearch] = useState("")

	const { replace } = useRouter()

	const getFileIcon = (type: string) => {
		switch (true) {
			case type.includes("pdf"):
				return <FileText className="min-h-5 min-w-5 text-red-600" />
			case type.includes("image"):
				return <ImageIcon className="min-h-5 min-w-5 text-yellow-600" />
			case type.includes("excel"):
				return <Sheet className="min-h-5 min-w-5 text-green-600" />
			case type.includes("sheet"):
				return <Sheet className="min-h-5 min-w-5 text-green-600" />
			case type.includes("zip"):
				return <FileArchive className="min-h-5 min-w-5 text-purple-600" />
			case type.includes("word"):
				return <FileText className="min-h-5 min-w-5 text-blue-600" />
			default:
				return <FileText className="min-h-5 min-w-6 text-red-600" />
		}
	}

	const { data, isLoading } = useSearchDocuments({
		search,
		page: 1,
		limit: 20,
		expiration,
	})

	const handleExpirationChange = (value: string) => {
		setExpiration(value)
		const params = new URLSearchParams(searchParams)
		params.set("expiration", value)
		replace(`?${params.toString()}`)
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
		<div className="grid w-full gap-4 sm:grid-cols-2">
			<div className="mb-4 flex flex-col gap-4 sm:col-span-2 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<BackButton href={"/admin/dashboard/documentacion"} />

					<h1 className="text-text text-3xl font-bold">Búsqueda</h1>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					{selectedFiles.length > 0 && (
						<div className="flex items-center gap-2">
							<Button
								size={"sm"}
								variant="outline"
								onClick={() => clearSelection()}
								className="text-muted-foreground"
							>
								<SquareXIcon className="h-4 w-4" /> ({selectedFiles.length})
							</Button>
							<Button
								size={"sm"}
								variant="default"
								onClick={handleDownloadSelected}
								disabled={isDownloading}
							>
								{isDownloading ? (
									<Spinner className="h-4 w-4" />
								) : (
									<DownloadIcon className="h-4 w-4" />
								)}
							</Button>
						</div>
					)}

					<Select
						value={expiration}
						onValueChange={(value: string) => handleExpirationChange(value)}
					>
						<SelectTrigger className="bg-background w-full data-[size=default]:h-9 lg:w-52">
							<SelectValue placeholder="Filtrar por vencimiento" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos</SelectItem>
							{DocumentExpirations.map((exp) => (
								<SelectItem key={exp.id} value={exp.id}>
									{exp.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Buscar por Nombre o Descripción..."
						className="bg-background ml-auto h-9 w-full sm:col-span-2 lg:w-52 xl:w-72"
					/>
				</div>
			</div>

			{isLoading ? (
				Array.from({ length: 8 }).map((_, index) => (
					<Skeleton key={index} className="h-36 min-w-full animate-pulse"></Skeleton>
				))
			) : (
				<>
					{data?.files?.map((item) => (
						<FileExplorerItem
							item={item}
							key={item.id}
							canEdit={false}
							userId={item.userId}
							icon={getFileIcon(item.type)}
						/>
					))}

					{data?.files?.length === 0 && (
						<div className="text-text bg-primary/10 border-primary col-span-full mx-auto flex items-center gap-2 rounded-xl border px-8 py-4 text-center font-semibold">
							<Info className="text-primary h-7 w-7" />
							No hay archivos en esta ubicación
						</div>
					)}
				</>
			)}
		</div>
	)
}
