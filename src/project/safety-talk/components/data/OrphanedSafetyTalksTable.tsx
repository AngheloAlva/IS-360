"use client"

import { FolderOpenIcon } from "lucide-react"
import { useEffect, useState } from "react"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	ColumnFiltersState,
} from "@tanstack/react-table"

import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"
import {
	Table,
	TableRow,
	TableCell,
	TableBody,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

import {
	orphanedSafetyTalkColumns,
	OrphanedSafetyTalkRecord,
} from "../../columns/orphaned-safety-talk-columns"

interface OrphanedRecordsResponse {
	metadata: {
		generatedAt: string
		totalRecords: number
		filteredRecords: number
		currentPage: number
		totalPages: number
		limit: number
		hasNextPage: boolean
		hasPreviousPage: boolean
		description: string
	}
	records: OrphanedSafetyTalkRecord[]
}

export function OrphanedSafetyTalksTable() {
	const [orphanedData, setOrphanedData] = useState<OrphanedRecordsResponse | null>(null)
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])
	const [error, setError] = useState<string | null>(null)
	const [searchInput, setSearchInput] = useState("")
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setSearch(searchInput.trim())
		}, 400)

		return () => clearTimeout(timeoutId)
	}, [searchInput])

	useEffect(() => {
		const loadOrphanedRecords = async () => {
			try {
				setLoading(true)
				setError(null)

				const params = new URLSearchParams({
					page: page.toString(),
					limit: "15",
					...(search && { search }),
				})

				const response = await fetch(`/api/orphaned-records?${params}`)

				if (!response.ok) {
					throw new Error("No se encontraron archivos de registros huérfanos")
				}

				const data: OrphanedRecordsResponse = await response.json()
				setOrphanedData(data)
			} catch (err) {
				console.error("Error loading orphaned records:", err)
				setError(err instanceof Error ? err.message : "Error desconocido")
			} finally {
				setLoading(false)
			}
		}

		loadOrphanedRecords()
	}, [page, search])

	useEffect(() => {
		setPage(1)
	}, [search])

	const table = useReactTable<OrphanedSafetyTalkRecord>({
		data: orphanedData?.records ?? [],
		columns: orphanedSafetyTalkColumns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		state: {
			sorting,
			columnFilters,
			pagination: {
				pageIndex: page - 1,
				pageSize: 15,
			},
		},
		manualPagination: true,
		pageCount: orphanedData?.metadata.totalPages ?? 0,
	})

	if (loading) {
		return (
			<Card className="mt-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">Registros sin usuario asociado</CardTitle>
					<CardDescription>Cargando registros sin usuario asociado...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{Array.from({ length: 5 }).map((_, index) => (
							<Skeleton key={index} className="h-12 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
		)
	}

	if (error) {
		return (
			<Card className="mt-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">Registros sin usuario asociado</CardTitle>
					<CardDescription className="text-red-600">{error}</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col items-center justify-center py-8 text-center">
					<FolderOpenIcon className="mb-4 h-12 w-12 text-gray-400" />
					<p className="text-gray-500">
						No se encontraron archivos de registros sin usuario asociado
					</p>
					<p className="mt-2 text-sm text-gray-400">
						Los registros sin usuario asociado se generan automáticamente al importar datos de Excel
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="mt-6">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">Registros sin usuario asociado</CardTitle>
				<CardDescription>
					Registros de charlas de seguridad que no pudieron ser asociados a un usuario o empresa en
					el sistema
				</CardDescription>
			</CardHeader>

			<CardContent className="flex w-full flex-col items-start gap-4">
				<div className="flex w-full flex-col items-start justify-between lg:flex-row">
					<div className="my-4 flex w-full flex-col flex-wrap gap-2 md:w-fit md:flex-row lg:my-0">
						<Input
							type="text"
							value={searchInput}
							placeholder="Buscar por nombre, RUT o empresa..."
							className="bg-background w-full md:w-80"
							onChange={(e) => setSearchInput(e.target.value)}
						/>
					</div>
				</div>

				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="font-medium">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={orphanedSafetyTalkColumns.length} className="h-24 text-center">
									No se encontraron registros con los filtros aplicados.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				<div className="flex w-full items-center justify-between space-x-2 py-4">
					<div className="text-muted-foreground text-sm">
						{orphanedData?.metadata.filteredRecords &&
							orphanedData.metadata.filteredRecords > 0 && (
								<span>
									Página {orphanedData.metadata.currentPage} de {orphanedData.metadata.totalPages} (
									{orphanedData.metadata.filteredRecords} registros total)
								</span>
							)}
					</div>
					<div className="space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((prev) => prev - 1)}
							disabled={!orphanedData?.metadata.hasPreviousPage}
						>
							Anterior
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((prev) => prev + 1)}
							disabled={!orphanedData?.metadata.hasNextPage}
						>
							Siguiente
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
