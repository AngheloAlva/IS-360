"use client"

import { useState } from "react"
import { Alert, AlertTitle, AlertDescription } from "@/shared/components/ui/alert"
import { Spinner } from "@/shared/components/ui/spinner"
import { ChartTypeSelector } from "./ChartTypeSelector"
import { DataTable } from "./DataTable"
import { EnhancedChart } from "./EnhancedChart"
import { FilterCondition, useDynamicQuery } from "../../hooks/useDynamicQuery"

export type ChartType = "table" | "bar" | "pie" | "line" | "area"

interface VisualizationCanvasProps {
	selectedTables: string[]
	selectedFields: Record<string, string[]>
	filters: FilterCondition[]
}

export function VisualizationCanvas({
	selectedTables,
	selectedFields,
	filters,
}: VisualizationCanvasProps) {
	const [chartType, setChartType] = useState<ChartType>("table")

	// Utilizar el hook de consulta dinámica para obtener los datos
	const { data, error, isLoading, isError } = useDynamicQuery({
		tables: selectedTables,
		fields: selectedFields,
		filters,
		limit: 100, // Limitar a 100 resultados por defecto
	})

	// Si no hay tablas o campos seleccionados, mostrar mensaje
	if (selectedTables.length === 0 || Object.keys(selectedFields).length === 0) {
		return (
			<div className="flex h-full items-center justify-center">
				<Alert className="max-w-[500px]">
					<AlertTitle>No hay datos para visualizar</AlertTitle>
					<AlertDescription>
						Selecciona al menos una tabla y un campo para comenzar a visualizar datos.
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<Spinner size="lg" />
				<span className="ml-2">Cargando datos...</span>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="flex h-full items-center justify-center">
				<Alert variant="destructive" className="max-w-[500px]">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						{error instanceof Error ? error.message : "Error al cargar los datos"}
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	if (!data || data.results.length === 0) {
		return (
			<div className="flex h-full items-center justify-center">
				<Alert className="max-w-[500px]">
					<AlertTitle>Sin resultados</AlertTitle>
					<AlertDescription>
						Tu consulta no produjo resultados. Intenta modificar los filtros o seleccionar
						diferentes tablas.
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	return (
		<div className="flex h-full flex-col">
			<div className="mb-4 flex justify-end">
				<ChartTypeSelector chartType={chartType} onChartTypeChange={setChartType} />
			</div>

			<div className="flex-1">
				{chartType === "table" ? (
					<DataTable data={data.results} />
				) : (
					<EnhancedChart data={data.results} type={chartType} selectedFields={selectedFields} />
				)}
			</div>
		</div>
	)
}

// Función de consulta eliminada - ahora usamos el hook useDynamicQuery
