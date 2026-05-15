"use client"

import { Fragment } from "react"
import { flexRender, type Cell, type Row } from "@tanstack/react-table"

import { EquipmentDraggableRow } from "@/project/equipment/components/data/EquipmentTreeDndProvider"
import { useDataGrid } from "@/shared/components/data-grid/data-grid"
import {
	DataGridTableBase,
	DataGridTableHead,
	DataGridTableHeadRow,
	DataGridTableHeadRowCell,
	DataGridTableHeadRowCellResize,
	DataGridTableBody,
	DataGridTableBodyRowCell,
	DataGridTableBodyRowExpandded,
	DataGridTableEmpty,
	DataGridTableRowSpacer,
} from "@/shared/components/data-grid/data-grid-table"

import type { WorkEquipment } from "@/project/equipment/hooks/use-equipments"

export function EquipmentDraggableTableRenderer() {
	const { table, isLoading, props } = useDataGrid()

	return (
		<DataGridTableBase>
			<DataGridTableHead>
				{table.getHeaderGroups().map((headerGroup, index) => (
					<DataGridTableHeadRow headerGroup={headerGroup} key={index}>
						{headerGroup.headers.map((header, i) => {
							const { column } = header
							return (
								<DataGridTableHeadRowCell header={header} key={i}>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
									{props.tableLayout?.columnsResizable && column.getCanResize() && (
										<DataGridTableHeadRowCellResize header={header} />
									)}
								</DataGridTableHeadRowCell>
							)
						})}
					</DataGridTableHeadRow>
				))}
			</DataGridTableHead>

			{(props.tableLayout?.stripped || !props.tableLayout?.rowBorder) && <DataGridTableRowSpacer />}

			<DataGridTableBody>
				{isLoading ? null : table.getRowModel().rows.length ? (
					table.getRowModel().rows.map((row: Row<WorkEquipment>) => (
						<Fragment key={row.id}>
							<EquipmentDraggableRow
								id={row.original.id}
								parentId={row.original.parentId}
								name={row.original.name}
								tag={row.original.tag}
								hasChildren={row.original._count.children > 0}
							>
								{row.getVisibleCells().map((cell: Cell<WorkEquipment, unknown>, colIndex) => (
									<DataGridTableBodyRowCell cell={cell} key={colIndex}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</DataGridTableBodyRowCell>
								))}
							</EquipmentDraggableRow>
							{row.getIsExpanded() && <DataGridTableBodyRowExpandded row={row} />}
						</Fragment>
					))
				) : (
					<DataGridTableEmpty />
				)}
			</DataGridTableBody>
		</DataGridTableBase>
	)
}
