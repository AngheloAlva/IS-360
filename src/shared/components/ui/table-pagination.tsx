import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Table } from "@tanstack/react-table"

import { cn } from "@/lib/utils"

import { Button } from "./button"

interface TablePaginationProps<TData> {
	total?: number
	pageCount: number
	className?: string
	isLoading?: boolean
	table: Table<TData>
	onPageChange: (page: number) => void
}

export function TablePagination<TData>({
	table,
	total,
	className,
	isLoading,
	pageCount,
	onPageChange,
}: TablePaginationProps<TData>) {
	const currentPage = table.getState().pagination.pageIndex + 1

	return (
		<div className="text-text flex w-full items-center justify-between">
			<div className="flex flex-col items-start">
				<span className="flex items-center gap-1 text-sm">
					<div>Página</div>
					<strong className="font-semibold">
						{currentPage} de {pageCount}
					</strong>
				</span>

				{total && <span className="text-muted-foreground text-sm"> {total} resultados</span>}
			</div>

			<div className="flex items-center gap-1">
				<Button
					size="sm"
					variant="outline"
					className={cn("text-primary border-primary hover:bg-primary", className)}
					onClick={() => onPageChange(1)}
					disabled={currentPage <= 1 || isLoading}
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>
				<Button
					size="sm"
					variant="outline"
					className={cn("text-primary border-primary hover:bg-primary", className)}
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1 || isLoading}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<Button
					size="sm"
					variant="outline"
					className={cn("text-primary border-primary hover:bg-primary", className)}
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= pageCount || isLoading}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
				<Button
					size="sm"
					variant="outline"
					className={cn("text-primary border-primary hover:bg-primary", className)}
					onClick={() => onPageChange(pageCount)}
					disabled={currentPage >= pageCount || isLoading}
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
