"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Label } from "@/shared/components/ui/label"
import { Table } from "../../hooks/useSchemaInfo"

interface TableSelectorProps {
	tables: Table[]
	selectedTables: string[]
	onTableSelect: (tables: string[]) => void
}

export function TableSelector({ tables, selectedTables, onTableSelect }: TableSelectorProps) {
	const [searchQuery, setSearchQuery] = useState("")

	const filteredTables = tables.filter(
		(table) =>
			table.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			table.description?.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const handleTableToggle = (tableId: string) => {
		if (selectedTables.includes(tableId)) {
			onTableSelect(selectedTables.filter((id) => id !== tableId))
		} else {
			onTableSelect([...selectedTables, tableId])
		}
	}

	return (
		<div className="space-y-4">
			<div className="relative">
				<Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
				<Input
					placeholder="Buscar módulos o tablas..."
					className="pl-8"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			<div className="rounded-md border">
				<div className="bg-muted/50 p-2">
					<p className="text-sm font-medium">Módulos disponibles</p>
				</div>

				<div className="space-y-2 p-2">
					{filteredTables.length > 0 ? (
						filteredTables.map((table) => (
							<div
								key={table.id}
								className="hover:bg-muted/50 flex items-center space-x-2 rounded-md p-2"
							>
								<Checkbox
									id={`table-${table.id}`}
									checked={selectedTables.includes(table.id)}
									onCheckedChange={() => handleTableToggle(table.id)}
								/>
								<Label
									htmlFor={`table-${table.id}`}
									className="flex flex-1 cursor-pointer flex-col"
								>
									<span className="font-medium">{table.displayName}</span>
									{table.description && (
										<span className="text-muted-foreground text-xs">{table.description}</span>
									)}
								</Label>
							</div>
						))
					) : (
						<p className="text-muted-foreground p-2 text-center text-sm">
							No se encontraron tablas con &quot;{searchQuery}&quot;
						</p>
					)}
				</div>
			</div>

			{selectedTables.length > 0 && (
				<div className="bg-muted/30 rounded p-2 text-sm">
					<p className="font-medium">Tablas seleccionadas: {selectedTables.length}</p>
					<p className="text-muted-foreground text-xs">
						Pasa a la pestaña &quot;Campos&quot; para seleccionar qué datos mostrar
					</p>
				</div>
			)}
		</div>
	)
}
