"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Label } from "@/shared/components/ui/label"

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/shared/components/ui/accordion"
import { Badge } from "@/shared/components/ui/badge"
import { Table } from "../../hooks/useSchemaInfo"

interface FieldPickerProps {
	tables: Table[]
	selectedTables: string[]
	selectedFields: Record<string, string[]>
	onFieldSelect: (fields: Record<string, string[]>) => void
}

export function FieldPicker({
	tables,
	selectedTables,
	selectedFields,
	onFieldSelect,
}: FieldPickerProps) {
	const [searchQuery, setSearchQuery] = useState("")

	const selectedTableInfos = tables.filter((table) => selectedTables.includes(table.id))

	const handleFieldToggle = (tableId: string, fieldId: string) => {
		const currentFields = selectedFields[tableId] || []
		const updatedFields = currentFields.includes(fieldId)
			? currentFields.filter((id) => id !== fieldId)
			: [...currentFields, fieldId]

		const newSelectedFields = {
			...selectedFields,
			[tableId]: updatedFields,
		}

		// Si no hay campos seleccionados para esta tabla, eliminar la entrada
		if (updatedFields.length === 0) {
			delete newSelectedFields[tableId]
		}

		onFieldSelect(newSelectedFields)
	}

	const filterField = (field: {
		id: string
		name: string
		displayName: string
		description?: string
	}) => {
		if (!searchQuery) return true

		const query = searchQuery.toLowerCase()
		return (
			field.displayName.toLowerCase().includes(query) ||
			field.name.toLowerCase().includes(query) ||
			field.description?.toLowerCase().includes(query)
		)
	}

	const getSelectedFieldCount = () => {
		return Object.values(selectedFields).reduce((acc, fields) => acc + fields.length, 0)
	}

	return (
		<div className="space-y-4">
			<div className="relative">
				<Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
				<Input
					placeholder="Buscar campos..."
					className="pl-8"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			{selectedTableInfos.length === 0 ? (
				<div className="text-muted-foreground rounded-md border p-4 text-center">
					Selecciona al menos una tabla en la pestaña anterior
				</div>
			) : (
				<Accordion type="multiple" className="w-full" defaultValue={selectedTables}>
					{selectedTableInfos.map((table) => {
						const filteredFields = table.fields.filter(filterField)
						const tableFieldsSelected = selectedFields[table.id]?.length || 0

						return (
							<AccordionItem key={table.id} value={table.id}>
								<AccordionTrigger className="hover:bg-muted/50 rounded-md px-3">
									<div className="flex items-center gap-2">
										<span>{table.displayName}</span>
										{tableFieldsSelected > 0 && (
											<Badge variant="secondary" className="ml-2">
												{tableFieldsSelected} seleccionados
											</Badge>
										)}
									</div>
								</AccordionTrigger>
								<AccordionContent>
									<div className="space-y-2 py-2 pl-4">
										{filteredFields.length > 0 ? (
											filteredFields.map((field) => (
												<div
													key={`${table.id}-${field.id}`}
													className="hover:bg-muted/50 flex items-center space-x-2 rounded-md p-1"
												>
													<Checkbox
														id={`field-${table.id}-${field.id}`}
														checked={selectedFields[table.id]?.includes(field.id) || false}
														onCheckedChange={() => handleFieldToggle(table.id, field.id)}
													/>
													<Label
														htmlFor={`field-${table.id}-${field.id}`}
														className="flex flex-1 cursor-pointer flex-col"
													>
														<span className="text-sm">{field.displayName}</span>
														{/* {field.description && (
                              <span className="text-xs text-muted-foreground">{field.description}</span>
                            )} */}
													</Label>
													<Badge variant="outline" className="text-xs">
														{field.type}
													</Badge>
												</div>
											))
										) : (
											<p className="text-muted-foreground py-2 text-sm">
												No se encontraron campos que coincidan con &quot;{searchQuery}&quot;
											</p>
										)}
									</div>
								</AccordionContent>
							</AccordionItem>
						)
					})}
				</Accordion>
			)}

			<div className="bg-muted/30 rounded p-2 text-sm">
				<p className="font-medium">Campos seleccionados: {getSelectedFieldCount()}</p>
				{getSelectedFieldCount() > 0 && (
					<p className="text-muted-foreground text-xs">
						Pasa a la pestaña &quot;Filtros&quot; para limitar los resultados o ve directamente a
						crear visualizaciones
					</p>
				)}
			</div>
		</div>
	)
}
