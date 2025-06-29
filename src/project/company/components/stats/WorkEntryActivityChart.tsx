"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartSplineIcon } from "lucide-react"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import {
	ChartConfig,
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"

import type { WorkEntryActivityData } from "@/project/company/hooks/use-company-stats"

interface WorkEntryActivityChartProps {
	data: WorkEntryActivityData[]
}

// Función auxiliar para agrupar datos por fecha
function prepareChartData(data: WorkEntryActivityData[]) {
	const companiesMap = new Map<string, { name: string; id: string }>()

	// Primero, identificar todas las empresas únicas
	data.forEach((entry) => {
		if (!companiesMap.has(entry.companyId)) {
			companiesMap.set(entry.companyId, {
				name: entry.companyName,
				id: entry.companyId,
			})
		}
	})

	// Filtrar para incluir solo las 5 empresas más activas
	const topCompanyIds = Array.from(companiesMap.values())
		// Calcular el total de entradas por empresa
		.map((company) => {
			const totalEntries = data
				.filter((entry) => entry.companyId === company.id)
				.reduce((sum, entry) => sum + entry.count, 0)
			return { ...company, totalEntries }
		})
		// Ordenar por número de entradas (descendente)
		.sort((a, b) => b.totalEntries - a.totalEntries)
		// Tomar las primeras 5 empresas
		.slice(0, 5)
		// Extraer solo los IDs
		.map((company) => company.id)

	// Organizar datos por fecha
	const groupedByDate = new Map<string, Record<string, number>>()

	data.forEach((entry) => {
		// Solo incluir las empresas top
		if (!topCompanyIds.includes(entry.companyId)) return

		if (!groupedByDate.has(entry.date)) {
			groupedByDate.set(entry.date, {})
		}

		const dateEntry = groupedByDate.get(entry.date)!
		dateEntry[entry.companyId] = entry.count
	})

	// Convertir a formato para gráfico
	return (
		Array.from(groupedByDate.entries())
			.map(([date, counts]) => {
				// Crear un objeto base con la fecha formateada
				const formattedDate = new Date(date).toLocaleDateString("es-ES", {
					day: "2-digit",
					month: "2-digit",
				})

				const result: Record<string, string | number> = { date: formattedDate }

				// Añadir conteos para cada empresa
				topCompanyIds.forEach((companyId) => {
					const companyInfo = companiesMap.get(companyId)!
					// Usar nombre corto de la empresa como clave
					const shortName =
						companyInfo.name.length > 10
							? `${companyInfo.name.substring(0, 10)}...`
							: companyInfo.name

					result[shortName] = counts[companyId] || 0
					// También guardar el ID para referencias
					result[`${shortName}_id`] = companyId
				})

				return result
			})
			// Ordenar por fecha (ascendente)
			.sort((a, b) => {
				const dateA = String(a.date).split("/").reverse().join("")
				const dateB = String(b.date).split("/").reverse().join("")
				return dateA.localeCompare(dateB)
			})
	)
}

// Crear config dinámicamente en base a las empresas en los datos
function createConfig(data: WorkEntryActivityData[]): ChartConfig {
	const uniqueCompanies = new Set<string>()
	data.forEach((entry) => {
		uniqueCompanies.add(entry.companyName)
	})

	const companyArray = Array.from(uniqueCompanies)
	const config: Record<string, { label: string; color?: string }> = {}

	// Asignar colores predefinidos a las primeras 5 empresas
	const colors = [
		"var(--color-blue-500)",
		"var(--color-indigo-500)",
		"var(--color-green-500)",
		"var(--color-purple-500)",
		"var(--color-pink-500)",
	]

	companyArray.slice(0, 5).forEach((company, index) => {
		const shortName = company.length > 10 ? `${company.substring(0, 10)}...` : company

		config[shortName] = {
			label: company,
			color: colors[index % colors.length],
		}
	})

	return config as ChartConfig
}

export function WorkEntryActivityChart({ data }: WorkEntryActivityChartProps) {
	const chartData = prepareChartData(data)
	const config = createConfig(data)

	const companyKeys = Object.keys(config)

	return (
		<Card className="shadow-md">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Actividad de Entradas de Trabajo</CardTitle>
						<CardDescription>Entradas por día en los últimos 30 días</CardDescription>
					</div>
					<ChartSplineIcon className="text-muted-foreground h-5 min-w-5" />
				</div>
			</CardHeader>

			<CardContent className="max-w-[90dvw] p-0">
				<ChartContainer config={config} className="h-[350px] w-full">
					<AreaChart data={chartData} margin={{ top: 10, left: 15, right: 15 }}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis dataKey="date" tickLine={false} axisLine={false} label="Fecha" />
						<YAxis
							tickLine={false}
							axisLine={false}
							label={{
								angle: -90,
								value: "Entradas",
								position: "insideLeft",
							}}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />

						<defs>
							<linearGradient id={"company-1"} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={"var(--color-blue-500)"} stopOpacity={0.8} />
								<stop offset="95%" stopColor={"var(--color-blue-500)"} stopOpacity={0.1} />
							</linearGradient>
							<linearGradient id={"company-2"} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={"var(--color-indigo-500)"} stopOpacity={0.8} />
								<stop offset="95%" stopColor={"var(--color-indigo-500)"} stopOpacity={0.1} />
							</linearGradient>
							<linearGradient id={"company-3"} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={"var(--color-green-500)"} stopOpacity={0.8} />
								<stop offset="95%" stopColor={"var(--color-green-500)"} stopOpacity={0.1} />
							</linearGradient>
							<linearGradient id={"company-4"} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={"var(--color-green-500)"} stopOpacity={0.8} />
								<stop offset="95%" stopColor={"var(--color-green-500)"} stopOpacity={0.1} />
							</linearGradient>
							<linearGradient id={"company-5"} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={"var(--color-pink-500)"} stopOpacity={0.8} />
								<stop offset="95%" stopColor={"var(--color-pink-500)"} stopOpacity={0.1} />
							</linearGradient>
						</defs>

						{companyKeys.map((company, index) => (
							<Area
								stackId="1"
								key={company}
								type="monotone"
								dataKey={company}
								stroke={config[company].color}
								fill={`url(#company-${index + 1})`}
							/>
						))}
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
