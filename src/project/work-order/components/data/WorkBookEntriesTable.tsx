"use client"

import { useCallback, useState } from "react"
import { DownloadIcon } from "lucide-react"
import { toast } from "sonner"
import {
	type OnChangeFn,
	type PaginationState,
	useReactTable,
	getCoreRowModel,
} from "@tanstack/react-table"

import { useWorkEntries, WorkEntry } from "@/project/work-order/hooks/use-work-entries"
import { getWorkEntryColumns } from "../../columns/work-entry-columns"
import { WorkBookEntryDetails } from "./WorkBookEntryDetails"
import { downloadAttachmentsAsZip } from "@/lib/view-document"

import { DataGridPagination } from "@/shared/components/data-grid/data-grid-pagination"
import { DataGrid, DataGridContainer } from "@/shared/components/data-grid/data-grid"
import { DataGridTable } from "@/shared/components/data-grid/data-grid-table"
import WorkOrderPDFViewer from "../pdf/WorkOrderPDFViewer"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"

export default function WorkBookEntriesTable({
	userId,
	isOtcMember,
	workOrderId,
	workOrderNumber,
	tutorialMode = false,
	tutorialEntries,
}: {
	userId: string
	workOrderId: string
	isOtcMember: boolean
	hasPermission: boolean
	workOrderNumber: string
	tutorialMode?: boolean
	tutorialEntries?: WorkEntry[]
}): React.ReactElement {
	const [selectedEntry, setSelectedEntry] = useState<WorkEntry | null>(null)
	const [rowSelection, setRowSelection] = useState({})
	const [isDownloading, setIsDownloading] = useState(false)
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)

	const { data, isLoading } = useWorkEntries({
		page,
		limit: pageSize,
		workOrderId,
		enabled: !tutorialMode,
	})

	const tableData = tutorialMode
		? {
				entries: tutorialEntries ?? [],
				total: tutorialEntries?.length ?? 0,
				pages: 1,
			}
		: data

	const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
		(updater) => {
			const currentPagination = {
				pageIndex: page - 1,
				pageSize,
			}

			const nextPagination = typeof updater === "function" ? updater(currentPagination) : updater

			if (nextPagination.pageSize !== currentPagination.pageSize) {
				setPageSize(nextPagination.pageSize)
				setPage(1)
				return
			}

			if (nextPagination.pageIndex !== currentPagination.pageIndex) {
				setPage(nextPagination.pageIndex + 1)
			}
		},
		[page, pageSize]
	)

	const columns = getWorkEntryColumns({ isOtcMember })

	const table = useReactTable<WorkEntry>({
		data: tableData?.entries ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		onPaginationChange: handlePaginationChange,
		onRowSelectionChange: setRowSelection,
		state: {
			pagination: {
				pageIndex: page - 1,
				pageSize,
			},
			rowSelection,
		},
		manualPagination: true,
		pageCount: tableData?.pages ?? 0,
	})

	const selectedRows = table.getFilteredSelectedRowModel().rows
	const hasSelectedRows = selectedRows.length > 0

	const handleDownloadAttachments = async () => {
		if (!hasSelectedRows) return

		setIsDownloading(true)
		try {
			const allAttachments = selectedRows.flatMap((row) =>
				row.original.attachments.map((attachment) => ({
					name: attachment.name,
					url: attachment.url,
				}))
			)

			if (allAttachments.length === 0) {
				toast.info("Las filas seleccionadas no tienen adjuntos")
				return
			}

			await downloadAttachmentsAsZip(allAttachments)

			toast.success(`Descargados ${allAttachments.length} adjuntos`)
		} catch (error) {
			console.error("Error downloading attachments:", error)
			toast.error("Error al descargar los adjuntos")
		} finally {
			setIsDownloading(false)
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex w-full items-center justify-between">
				{isOtcMember && hasSelectedRows && (
					<Button
						variant="outline"
						size="sm"
						disabled={isDownloading}
						onClick={handleDownloadAttachments}
						className="gap-2"
					>
						<DownloadIcon className="h-4 w-4" />
						{isDownloading ? "Descargando..." : `Descargar Adjuntos (${selectedRows.length})`}
					</Button>
				)}
				<div className={isOtcMember && hasSelectedRows ? "" : "ml-auto"}>
					<WorkOrderPDFViewer workOrderId={workOrderId} workOrderNumber={workOrderNumber} />
				</div>
			</div>

			<Card>
				<CardContent className="flex w-full flex-col gap-4">
					<DataGrid<WorkEntry>
						table={table}
						recordCount={tableData?.total ?? 0}
						isLoading={tutorialMode ? false : isLoading}
						onRowClick={(row) => setSelectedEntry(row)}
						emptyMessage="No hay entradas"
						tableLayout={{
							width: "fixed",
							columnsVisibility: false,
							columnsResizable: false,
							columnsPinnable: false,
						}}
					>
						<DataGridContainer border={false} className="w-full overflow-x-auto">
							<DataGridTable<WorkEntry> />
						</DataGridContainer>
						<DataGridPagination
							rowsPerPageLabel="Filas por pagina"
							previousPageLabel="Pagina anterior"
							nextPageLabel="Pagina siguiente"
							info="{from} - {to} de {count}"
						/>
					</DataGrid>
				</CardContent>
			</Card>

			{selectedEntry && (
				<WorkBookEntryDetails
					userId={userId}
					isLoading={false}
					entry={selectedEntry}
					isOtcMember={isOtcMember}
					onClose={() => setSelectedEntry(null)}
				/>
			)}
		</div>
	)
}
