"use client"

// import { useState } from "react"
// import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
// import { TableSelector } from "./TableSelector"
// import { FieldPicker } from "./FieldPicker"
// import { FilterBuilder } from "./FilterBuilder"
import { SchemaInfo } from "../../hooks/useSchemaInfo"
// import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { FilterCondition } from "../../hooks/useDynamicQuery"

interface DataSelectionPanelProps {
	schemaInfo: SchemaInfo
	selectedTables: string[]
	onTableSelect: (tables: string[]) => void
	selectedFields: Record<string, string[]>
	onFieldSelect: (fields: Record<string, string[]>) => void
	filters: FilterCondition[]
	onFilterChange: (filters: FilterCondition[]) => void
}

export function DataSelectionPanel({}: DataSelectionPanelProps) {
	// const [, setActiveTab] = useState("tables")

	return (
		<div className="h-full">
			{/* <Tabs defaultValue="tables" className="w-full" onValueChange={setActiveTab}>
				<div className="px-4 pt-4">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="tables">Tablas</TabsTrigger>
						<TabsTrigger value="fields" disabled={selectedTables.length === 0}>
							Campos
						</TabsTrigger>
						<TabsTrigger value="filters" disabled={Object.keys(selectedFields).length === 0}>
							Filtros
						</TabsTrigger>
					</TabsList>
				</div>

				<ScrollArea className="h-[calc(100vh-250px)] px-4 py-2">
					<TabsContents>
						<TabsContent value="tables" className="mt-0 pt-4">
							<TableSelector
								tables={schemaInfo?.tables || []}
								selectedTables={selectedTables}
								onTableSelect={onTableSelect}
							/>
						</TabsContent>

						<TabsContent value="fields" className="mt-0 pt-4">
							<FieldPicker
								tables={schemaInfo?.tables || []}
								selectedTables={selectedTables}
								selectedFields={selectedFields}
								onFieldSelect={onFieldSelect}
							/>
						</TabsContent>

						<TabsContent value="filters" className="mt-0 pt-4">
							<FilterBuilder
								tables={schemaInfo?.tables || []}
								selectedFields={selectedFields}
								filters={filters}
								onFilterChange={onFilterChange}
							/>
						</TabsContent>
					</TabsContents>
				</ScrollArea>
			</Tabs> */}
		</div>
	)
}
