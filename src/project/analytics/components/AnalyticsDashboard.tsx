"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { DataSelectionPanel } from "./data-selection/DataSelectionPanel"
import { VisualizationCanvas } from "./visualization/VisualizationCanvas"
import { DashboardControls } from "./dashboard/DashboardControls"
import { useSchemaInfo } from "../hooks/useSchemaInfo"
import { FilterCondition } from "../hooks/useDynamicQuery"

export function AnalyticsDashboard() {
	const [selectedTables, setSelectedTables] = useState<string[]>([])
	const [selectedFields, setSelectedFields] = useState<Record<string, string[]>>({})
	const [filters, setFilters] = useState<FilterCondition[]>([])

	// Fetch available schema info (tables, fields, relationships)
	const { data: schemaInfo, isLoading: schemaLoading, error: schemaError } = useSchemaInfo()

	if (schemaLoading) {
		return <div className="w-full p-8">Cargando información del esquema...</div>
	}

	if (schemaError) {
		return (
			<Card className="w-full">
				<CardHeader className="bg-destructive/10">
					<CardTitle>Error</CardTitle>
				</CardHeader>
				<CardContent>
					<p>No se pudo cargar la información del esquema: {schemaError.message}</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="w-full space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Analítica Interactiva</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<div className="flex w-full flex-col lg:flex-row">
						{/* Panel de selección de datos */}
						<div className="border-border w-full border-r lg:w-1/4">
							<DataSelectionPanel
								schemaInfo={
									schemaInfo || {
										relationships: [],
										tables: [],
									}
								}
								selectedTables={selectedTables}
								onTableSelect={setSelectedTables}
								selectedFields={selectedFields}
								onFieldSelect={setSelectedFields}
								filters={filters}
								onFilterChange={setFilters}
							/>
						</div>

						{/* Área principal para las visualizaciones */}
						<div className="w-full lg:w-3/4">
							<DashboardControls />

							<div className="p-4">
								<VisualizationCanvas
									selectedTables={selectedTables}
									selectedFields={selectedFields}
									filters={filters}
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
