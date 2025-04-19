import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Table } from "@tanstack/react-table"

import { Button } from "./button"

interface TablePaginationProps<TData> {
	table: Table<TData>
	pageCount: number
	onPageChange: (page: number) => void
	isLoading?: boolean
}

export function TablePagination<TData>({
	table,
	pageCount,
	onPageChange,
	isLoading,
}: TablePaginationProps<TData>) {
	const currentPage = table.getState().pagination.pageIndex + 1

	return (
		<div className="text-text flex w-full items-center justify-between">
			<span className="flex items-center gap-1">
				<div>Página</div>
				<strong>
					{currentPage} de {pageCount}
				</strong>
			</span>

			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					className="text-primary border-primary hover:bg-primary"
					size="sm"
					onClick={() => onPageChange(1)}
					disabled={currentPage <= 1 || isLoading}
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					className="text-primary border-primary hover:bg-primary"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1 || isLoading}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					className="text-primary border-primary hover:bg-primary"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= pageCount || isLoading}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					className="text-primary border-primary hover:bg-primary"
					size="sm"
					onClick={() => onPageChange(pageCount)}
					disabled={currentPage >= pageCount || isLoading}
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
