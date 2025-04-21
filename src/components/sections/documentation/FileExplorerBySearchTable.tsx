"use client"

import { Info, Sheet, FileText, Image as ImageIcon } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

import { useSearchDocuments } from "@/hooks/documents/use-search-documents"
import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { AreasLabels } from "@/lib/consts/areas"
import BackButton from "@/components/shared/BackButton"

export function FileExplorerBySearchTable() {
	const [search, setSearch] = useState("")

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

	const { data, isLoading } = useSearchDocuments({
		search,
		page: 1,
		limit: 20,
	})

	return (
		<div className="grid w-full gap-4 sm:grid-cols-2">
			<div className="mb-4 flex flex-col gap-4 sm:col-span-2 sm:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<BackButton href={"/dashboard/documentacion"} />

					<h1 className="text-text text-3xl font-bold">Búsqueda</h1>
				</div>

				<Input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Buscar por Nombre o Descripción..."
					className="bg-background ml-auto w-full sm:col-span-2 sm:w-60 xl:w-96"
				/>
			</div>

			{isLoading ? (
				Array.from({ length: 8 }).map((_, index) => (
					<Skeleton key={index} className="h-36 min-w-full animate-pulse"></Skeleton>
				))
			) : (
				<>
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

								<div className="text-muted-foreground mt-3 flex items-center justify-end gap-2 text-xs">
									<span className="mr-auto rounded-full bg-teal-500/10 px-2 py-1 font-semibold text-teal-500">
										{AreasLabels[item.area as keyof typeof AreasLabels]}
									</span>

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
											</div>
										</PopoverContent>
									</Popover>
								</div>
							</CardContent>
						</Card>
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
