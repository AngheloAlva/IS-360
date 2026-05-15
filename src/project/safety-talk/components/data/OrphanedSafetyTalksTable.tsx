"use client"

import { FolderOpenIcon, Loader2Icon, Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	ColumnFiltersState,
} from "@tanstack/react-table"

import {
	useInPersonSafetyTalks,
	useDeleteInPersonSafetyTalk,
} from "../../hooks/use-in-person-safety-talks"
import { InPersonSafetyTalkForm } from "../forms/InPersonSafetyTalkForm"
import {
	orphanedSafetyTalkColumns,
	OrphanedSafetyTalkRecord,
} from "../../columns/orphaned-safety-talk-columns"

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
	AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogDescription,
} from "@/shared/components/ui/alert-dialog"

import type { ColumnDef } from "@tanstack/react-table"

export function OrphanedSafetyTalksTable() {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])
	const [searchInput, setSearchInput] = useState("")
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)

	const { data, isLoading, isError, error } = useInPersonSafetyTalks({
		page,
		limit: 15,
		search,
	})

	const deleteMutation = useDeleteInPersonSafetyTalk()

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setSearch(searchInput.trim())
		}, 400)

		return () => clearTimeout(timeoutId)
	}, [searchInput])

	useEffect(() => {
		setPage(1)
	}, [search])

	const handleDelete = async (id: string) => {
		try {
			await deleteMutation.mutateAsync(id)
			toast.success("Registro eliminado correctamente")
		} catch {
			toast.error("Error al eliminar el registro")
		}
	}

	const columnsWithActions: ColumnDef<OrphanedSafetyTalkRecord>[] = [
		...orphanedSafetyTalkColumns,
		{
			id: "actions",
			header: "",
			cell: ({ row }) => {
				const record = row.original

				return (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="text-red-500 hover:text-red-700"
							>
								<Trash2Icon className="h-4 w-4" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
								<AlertDialogDescription>
									Se eliminará el registro de <strong>{record.name}</strong> ({record.rut}).
									Esta acción no se puede deshacer.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={deleteMutation.isPending}>
									Cancelar
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => handleDelete(record.id)}
									disabled={deleteMutation.isPending}
									className="bg-red-600 hover:bg-red-700"
								>
									{deleteMutation.isPending ? (
										<>
											<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
											Eliminando...
										</>
									) : (
										<>
											<Trash2Icon className="mr-2 h-4 w-4" />
											Eliminar
										</>
									)}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)
			},
		},
	]

	const table = useReactTable<OrphanedSafetyTalkRecord>({
		data: data?.records ?? [],
		columns: columnsWithActions,
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
		pageCount: data?.metadata.totalPages ?? 0,
	})

	if (isLoading) {
		return (
			<Card className="mt-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">Registros Presenciales</CardTitle>
					<CardDescription>Cargando registros presenciales...</CardDescription>
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

	if (isError) {
		return (
			<Card className="mt-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">Registros Presenciales</CardTitle>
					<CardDescription className="text-red-600">
						{error instanceof Error ? error.message : "Error desconocido"}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col items-center justify-center py-8 text-center">
					<FolderOpenIcon className="mb-4 h-12 w-12 text-gray-400" />
					<p className="text-gray-500">
						No se pudieron cargar los registros presenciales
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="mt-6">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">Registros Presenciales</CardTitle>
						<CardDescription>
							Registros de charlas de seguridad presenciales de contratistas y visitas
						</CardDescription>
					</div>
					<InPersonSafetyTalkForm />
				</div>
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
										<TableCell key={cell.id} className="font-semibold">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columnsWithActions.length} className="h-24 text-center">
									No se encontraron registros con los filtros aplicados.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				<div className="flex w-full items-center justify-between space-x-2 py-4">
					<div className="text-muted-foreground text-sm">
						{data?.metadata.filteredRecords && data.metadata.filteredRecords > 0 && (
							<span>
								Página {data.metadata.currentPage} de {data.metadata.totalPages} (
								{data.metadata.filteredRecords} registros total)
							</span>
						)}
					</div>
					<div className="space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((prev) => prev - 1)}
							disabled={!data?.metadata.hasPreviousPage}
						>
							Anterior
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((prev) => prev + 1)}
							disabled={!data?.metadata.hasNextPage}
						>
							Siguiente
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
