/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo } from "react"
import {
	BarChart,
	Bar,
	PieChart,
	Pie,
	LineChart,
	Line,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Cell,
} from "recharts"
import { ChartContainer } from "@/shared/components/ui/chart"
import { Card, CardContent, CardDescription } from "@/shared/components/ui/card"
import { cn } from "@/lib/utils"

type ChartType = "bar" | "pie" | "line" | "area"

interface EnhancedChartProps {
	data: any[]
	type: ChartType
	selectedFields: Record<string, string[]>
}

// Paleta de colores para los gráficos
const COLORS = [
	"var(--color-blue-500)",
	"var(--color-purple-500)",
	"var(--color-indigo-500)",
	"var(--color-pink-500)",
	"var(--color-rose-500)",
	"var(--color-orange-500)",
	"var(--color-amber-500)",
	"var(--color-yellow-500)",
	"var(--color-lime-500)",
	"var(--color-green-500)",
	"var(--color-emerald-500)",
	"var(--color-teal-500)",
	"var(--color-cyan-500)",
]

export function EnhancedChart({ data, type }: EnhancedChartProps) {
	// Estado para zoom y filtrado
	const [activeIndex, setActiveIndex] = useState<number | null>(null)

	// Extrae todas las claves de campos numéricos para usar en gráficos
	const numericKeys = useMemo(() => {
		if (data.length === 0) return []

		return Object.keys(data[0]).filter((key) => {
			const value = data[0][key]
			return typeof value === "number"
		})
	}, [data])

	// Extrae todas las claves de campos categóricos para usar como X axis
	const categoryKeys = useMemo(() => {
		if (data.length === 0) return []

		return Object.keys(data[0]).filter((key) => {
			const value = data[0][key]
			return typeof value === "string"
		})
	}, [data])

	// Define valores por defecto para los ejes
	const defaultXKey = categoryKeys[0] || ""
	const defaultYKey = numericKeys[0] || ""

	if (numericKeys.length === 0) {
		return (
			<Card>
				<CardContent className="p-8 text-center">
					<CardDescription>
						No se encontraron campos numéricos para visualizar en un gráfico. Selecciona al menos un
						campo numérico o usa la vista de tabla.
					</CardDescription>
				</CardContent>
			</Card>
		)
	}

	// Función para determinar el gráfico a mostrar según el tipo
	const renderChart = () => {
		// Configuración común para gráficos cartesianos
		const cartesianProps = {
			data,
			margin: { top: 10, right: 30, left: 20, bottom: 40 },
		}

		switch (type) {
			case "bar":
				return (
					<BarChart {...cartesianProps}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis dataKey={defaultXKey} angle={-45} textAnchor="end" height={70} />
						<YAxis />
						<Tooltip content={<CustomTooltip />} />
						<Legend content={<CustomLegend />} />
						{numericKeys.map((key, index) => (
							<Bar
								key={key}
								dataKey={key}
								name={key}
								fill={COLORS[index % COLORS.length]}
								onClick={(data, index) => setActiveIndex(activeIndex === index ? null : index)}
								className={cn(activeIndex !== null && activeIndex !== index && "opacity-50")}
							/>
						))}
					</BarChart>
				)

			case "pie":
				return (
					<PieChart>
						<Tooltip content={<CustomTooltip />} />
						<Legend content={<CustomLegend />} />
						<Pie
							data={data}
							dataKey={defaultYKey}
							nameKey={defaultXKey}
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={120}
							paddingAngle={2}
							label
							onClick={(_, index) => setActiveIndex(activeIndex === index ? null : index)}
						>
							{data.map((_, index) => (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[index % COLORS.length]}
									className={cn(activeIndex !== null && activeIndex !== index && "opacity-50")}
								/>
							))}
						</Pie>
					</PieChart>
				)

			case "line":
				return (
					<LineChart {...cartesianProps}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis dataKey={defaultXKey} angle={-45} textAnchor="end" height={70} />
						<YAxis />
						<Tooltip content={<CustomTooltip />} />
						<Legend content={<CustomLegend />} />
						{numericKeys.map((key, index) => (
							<Line
								key={key}
								type="monotone"
								dataKey={key}
								name={key}
								stroke={COLORS[index % COLORS.length]}
								// activeDot={{
								// 	onClick: (_, index) => setActiveIndex(activeIndex === index ? null : index),
								// 	r: 8,
								// }}
								strokeWidth={2}
								className={cn(activeIndex !== null && "opacity-50")}
							/>
						))}
					</LineChart>
				)

			case "area":
				return (
					<AreaChart {...cartesianProps}>
						<defs>
							{numericKeys.map((key, index) => (
								<linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
									<stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.1} />
								</linearGradient>
							))}
						</defs>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis dataKey={defaultXKey} angle={-45} textAnchor="end" height={70} />
						<YAxis />
						<Tooltip content={<CustomTooltip />} />
						<Legend content={<CustomLegend />} />
						{numericKeys.map((key, index) => (
							<Area
								key={key}
								type="monotone"
								dataKey={key}
								name={key}
								stroke={COLORS[index % COLORS.length]}
								fillOpacity={1}
								fill={`url(#color${key})`}
								// activeDot={{
								// 	onClick: (_, index) => setActiveIndex(activeIndex === index ? null : index),
								// 	r: 8,
								// }}
								className={cn(activeIndex !== null && "opacity-50")}
							/>
						))}
					</AreaChart>
				)

			default:
				return <CardDescription>Tipo de gráfico no soportado</CardDescription>
		}
	}

	return (
		<Card className="w-full">
			<CardContent className="pt-6">
				<div className="h-[500px] w-full">
					<ChartContainer config={{}} className="h-full">
						<ResponsiveContainer width="100%" height="100%">
							{renderChart()}
						</ResponsiveContainer>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}

// Componente personalizado para el tooltip
function CustomTooltip(props: any) {
	if (!props.active || !props.payload) return null

	return (
		<div className="bg-background/90 rounded-md border p-2 shadow-md">
			<p className="text-sm font-medium">{props.label}</p>
			<div className="mt-1 space-y-1">
				{props.payload.map((item: any, index: number) => (
					<div key={index} className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
						<span className="text-xs">
							{item.name}: {item.value}
						</span>
					</div>
				))}
			</div>
		</div>
	)
}

// Componente personalizado para la leyenda
function CustomLegend(props: any) {
	if (!props.payload) return null

	return (
		<div className="mt-2 flex flex-wrap justify-center gap-4">
			{props.payload.map((entry: any, index: number) => (
				<div key={index} className="flex items-center gap-2">
					<div className="h-3 w-3 rounded-sm" style={{ backgroundColor: entry.color }} />
					<span className="text-xs">{entry.value}</span>
				</div>
			))}
		</div>
	)
}
