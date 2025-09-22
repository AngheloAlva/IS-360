"use client"

import { Info, Sheet, FileText, Image as ImageIcon, FileArchive } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { useSearchDocuments } from "@/project/document/hooks/use-search-documents"
import { DocumentExpirations } from "@/lib/consts/document-expirations"

import { Skeleton } from "@/shared/components/ui/skeleton"
import BackButton from "@/shared/components/BackButton"
import { Input } from "@/shared/components/ui/input"
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
				return <FileText className="min-h-6 min-w-6 text-red-600" />
			case type.includes("image"):
				return <ImageIcon className="min-h-6 min-w-6 text-yellow-600" />
			case type.includes("excel"):
				return <Sheet className="min-h-6 min-w-6 text-green-600" />
			case type.includes("sheet"):
				return <Sheet className="min-h-6 min-w-6 text-green-600" />
			case type.includes("zip"):
				return <FileArchive className="min-h-6 min-w-6 text-purple-600" />
			case type.includes("word"):
				return <FileText className="min-h-6 min-w-6 text-blue-600" />
			default:
				return <FileText className="min-h-6 min-w-6 text-red-600" />
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

	return (
		<div className="grid w-full gap-4 sm:grid-cols-2">
			<div className="mb-4 flex flex-col gap-4 sm:col-span-2 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<BackButton href={"/admin/dashboard/documentacion"} />

					<h1 className="text-text text-3xl font-bold">Búsqueda</h1>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<Select
						value={expiration}
						onValueChange={(value: string) => handleExpirationChange(value)}
					>
						<SelectTrigger className="bg-background w-full lg:w-52">
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
						className="bg-background ml-auto w-full sm:col-span-2 lg:w-52 xl:w-72"
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
							areaValue={item.area || "IT"}
							icon={getFileIcon(item.type)}
						/>
					))}

					{data?.files?.length === 0 && (
						<div className="text-text bg-primary/10 border-primary col-span-full mx-auto flex items-center gap-2 rounded-xl border px-8 py-4 text-center font-medium">
							<Info className="text-primary h-7 w-7" />
							No hay archivos en esta ubicación
						</div>
					)}
				</>
			)}
		</div>
	)
}
