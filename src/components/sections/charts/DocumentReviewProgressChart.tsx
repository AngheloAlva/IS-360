"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartBarIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
	ChartConfig,
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/components/ui/chart"

import type { DocumentReviewProgressData } from "@/hooks/companies/useCompanyStats"

interface DocumentReviewProgressChartProps {
	data: DocumentReviewProgressData[]
}

const config = {
	reviewed: {
		label: "Revisados",
		color: "var(--color-indigo-500)",
	},
	pending: {
		label: "Pendientes",
		color: "var(--color-blue-500)",
	},
} satisfies ChartConfig

export function DocumentReviewProgressChart({ data }: DocumentReviewProgressChartProps) {
	const chartData = data.map((item) => ({
		company: item.company.length > 12 ? `${item.company.substring(0, 12)}...` : item.company,
		reviewed: item.reviewed,
		pending: item.pending,
		fullName: item.company,
	}))

	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Progreso de Revisión de Documentos</CardTitle>
						<CardDescription>
							Documentos de las Carpetas de Arranque revisados vs. pendientes por cada empresa
						</CardDescription>
					</div>
					<ChartBarIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<ChartContainer className="h-[300px] w-full" config={config}>
					<BarChart data={chartData} margin={{ top: 10, right: 30, left: 0 }} layout="vertical">
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis type="number" />
						<YAxis
							width={100}
							type="category"
							dataKey="company"
							tickLine={false}
							axisLine={false}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									labelFormatter={(label) => {
										const item = chartData.find((d) => d.company === label)
										return item?.fullName || label
									}}
								/>
							}
						/>
						<ChartLegend content={<ChartLegendContent />} />
						<Bar
							dataKey="reviewed"
							fill="var(--color-indigo-500)"
							name="Revisados"
							radius={[4, 0, 0, 4]}
							stackId="stack"
						/>
						<Bar
							dataKey="pending"
							fill="var(--color-blue-500)"
							name="Pendientes"
							radius={[0, 4, 4, 0]}
							stackId="stack"
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
