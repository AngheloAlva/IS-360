"use client"

import { Cell, Pie, PieChart, Bar, BarChart, Tooltip, XAxis, YAxis, Label } from "recharts"
import { useState, useEffect } from "react"

import { getDocumentsChartData } from "@/actions/document-management/getDocumentsChartData"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"

const areaChartConfig = {
	value: {
		label: "Documentos",
	},
	OPERATIONS: {
		label: "Operaciones",
		color: "var(--chart-1)",
	},
	INSTRUCTIONS: {
		label: "Instructivos",
		color: "var(--chart-2)",
	},
	INTEGRITY_AND_MAINTENANCE: {
		label: "Integridad y Mantención",
		color: "var(--chart-3)",
	},
	ENVIRONMENT: {
		label: "Medio Ambiente",
		color: "var(--chart-4)",
	},
	OPERATIONAL_SAFETY: {
		label: "Prevención de Riesgos",
		color: "var(--chart-5)",
	},
	QUALITY_AND_OPERATIONAL_EXCELLENCE: {
		label: "Calidad y Excelencia Profesional",
		color: "var(--chart-6)",
	},
	REGULATORY_COMPLIANCE: {
		label: "HSEQ",
		color: "var(--chart-7)",
	},
	LEGAL: {
		label: "Jurídica",
		color: "var(--chart-8)",
	},
	COMMUNITIES: {
		label: "Comunidades",
		color: "var(--chart-9)",
	},
	PROJECTS: {
		label: "Proyectos",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig

type AreaData = {
	name: string
	value: number
	fill: string
}

type ExpirationData = {
	name: string
	value: number
}

type ResponsibleData = {
	name: string
	value: number
}

export default function DocumentCharts() {
	const [areaData, setAreaData] = useState<AreaData[]>([])
	const [expirationData, setExpirationData] = useState<ExpirationData[]>([])
	const [responsibleData, setResponsibleData] = useState<ResponsibleData[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchDocumentsChartData = async () => {
			try {
				const data = await getDocumentsChartData()
				setAreaData(data.areaData)
				setExpirationData(data.expirationData)
				setResponsibleData(data.responsibleData)
			} catch (error) {
				console.error("Error fetching chart data:", error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchDocumentsChartData()
	}, [])

	return (
		<div className="grid w-full gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Documentos por Área</CardTitle>
				</CardHeader>
				<CardContent>
					{/* [
          {
              "name": "HSEQ",
              "value": 0,
              "fill": "#dc2626"
          },
          {
              "name": "Jurídica",
              "value": 2,
              "fill": "#8b5cf6"
          },
          {
              "name": "Comunidades",
              "value": 0,
              "fill": "#ec4899"
          },
          {
              "name": "Operaciones",
              "value": 1,
              "fill": "#2563eb"
          },
          {
              "name": "Instructivos",
              "value": 0,
              "fill": "#60a5fa"
          },
          {
              "name": "Medio Ambiente",
              "value": 0,
              "fill": "#84cc16"
          },
          {
              "name": "Prevención de Riesgos",
              "value": 0,
              "fill": "#eab308"
          },
          {
              "name": "Integridad y Mantención",
              "value": 0,
              "fill": "#10b981"
          },
          {
              "name": "Calidad y Excelencia Profesional",
              "value": 0,
              "fill": "#f59e0b"
          }
      ] */}
					<div className="flex h-[400px] items-center justify-center">
						{isLoading ? (
							<div className="text-muted-foreground">Cargando datos...</div>
						) : areaData.length === 0 ? (
							<div className="text-muted-foreground">No hay datos disponibles</div>
						) : (
							<ChartContainer
								config={areaChartConfig}
								className="mx-auto aspect-square max-h-[250px]"
							>
								<PieChart>
									<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
									<Pie
										data={areaData}
										dataKey="value"
										nameKey="name"
										innerRadius={60}
										strokeWidth={5}
									>
										<Label
											content={({ viewBox }) => {
												if (viewBox && "cx" in viewBox && "cy" in viewBox) {
													const total = areaData.reduce((acc, curr) => acc + curr.value, 0)
													return (
														<text
															x={viewBox.cx}
															y={viewBox.cy}
															textAnchor="middle"
															dominantBaseline="middle"
														>
															<tspan
																x={viewBox.cx}
																y={viewBox.cy}
																className="fill-foreground text-3xl font-bold"
															>
																{total}
															</tspan>
															<tspan
																x={viewBox.cx}
																y={(viewBox.cy || 0) + 24}
																className="fill-muted-foreground"
															>
																Documentos
															</tspan>
														</text>
													)
												}
											}}
										/>
										{areaData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.fill} />
										))}
									</Pie>
								</PieChart>
							</ChartContainer>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Documentos por Vencimiento</CardTitle>
				</CardHeader>
				<CardContent>
					<div>
						{isLoading ? (
							<div className="flex h-full items-center justify-center">
								<div className="text-muted-foreground">Cargando datos...</div>
							</div>
						) : expirationData.length === 0 ? (
							<div className="flex h-full items-center justify-center">
								<div className="text-muted-foreground">No hay datos disponibles</div>
							</div>
						) : (
							<BarChart
								data={expirationData}
								layout="vertical"
								width={500}
								height={400}
								margin={{ left: 175 }}
							>
								<XAxis type="number" />
								<YAxis type="category" dataKey="name" width={170} />
								<Tooltip />
								<Bar dataKey="value" fill="#2563eb" />
							</BarChart>
						)}
					</div>
				</CardContent>
			</Card>

			<Card className="md:col-span-2">
				<CardHeader>
					<CardTitle>Documentos por Responsable</CardTitle>
				</CardHeader>
				<CardContent className="w-full">
					<div>
						{isLoading ? (
							<div className="flex h-full items-center justify-center">
								<div className="text-muted-foreground">Cargando datos...</div>
							</div>
						) : responsibleData.length === 0 ? (
							<div className="flex h-full w-full items-center justify-center">
								<div className="text-muted-foreground">No hay datos disponibles</div>
							</div>
						) : (
							<BarChart data={responsibleData} width={1000} height={400} margin={{ bottom: 100 }}>
								<XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
								<YAxis />
								<Tooltip />
								<Bar dataKey="value" fill="#2563eb" />
							</BarChart>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
