"use client"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react"

import { getWorkersLaborControlFoldersColumns } from "../../columns/workers-labor-control-folders-columns"
import { useWorkersAcreditacionFolders } from "../../hooks/use-labor-control-folder-documents"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
	Table,
	TableRow,
	TableCell,
	TableBody,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

interface WorkersAccreditationFolderDocumentsProps {
	folderId: string
	companyId: string
	isOtcMember: boolean
}

export default function WorkersAccreditationFolderDocuments({
	folderId,
	companyId,
	isOtcMember,
}: WorkersAccreditationFolderDocumentsProps): React.ReactElement {
	const [rowSelection, setRowSelection] = useState({})

	const splitCompanyId = companyId.split("_")[1]
	const splitFolderId = folderId.split("_")[1]

	const { data, isLoading } = useWorkersAcreditacionFolders({
		folderId: splitFolderId,
		companyId: splitCompanyId,
	})
	const foldersData = data?.workerFolders ?? []

	const table = useReactTable({
		columns: getWorkersLaborControlFoldersColumns({
			companyId,
			folderId,
			isOtcMember,
		}),
		data: foldersData,
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection,
		},
	})

	return (
		<Card className="gap-2">
			<CardHeader className="flex flex-row items-start justify-between">
				<CardTitle className="text-xl font-semibold">
					Documentos de Acreditacion Trabajadores
				</CardTitle>
			</CardHeader>

			<CardContent>
				<Table className="bg-background">
					<TableHeader className="bg-background">
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
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={8} className="h-24 text-center">
									Cargando carpetas...
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}
