"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartBarIcon } from "lucide-react"

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

interface DocumentReviewProgressChartProps {
	data: {
		company: string
		reviewed: number
		pending: number
		approved: number
		total: number
	}[]
}

const config = {
	reviewed: {
		label: "Revisados",
		color: "var(--color-indigo-500)",
	},
	pending: {
		label: "Pendientes",
		color: "var(--color-rose-500)",
	},
	approved: {
		label: "Aprobados",
		color: "var(--color-cyan-500)",
	},
} satisfies ChartConfig

export function DocumentReviewProgressChart({ data }: DocumentReviewProgressChartProps) {
	const chartData = data.map((item) => ({
		company: item.company.length > 12 ? `${item.company.substring(0, 12)}...` : item.company,
		reviewed: item.reviewed,
		pending: item.pending,
		approved: item.approved,
		fullName: item.company,
	}))

	console.log(data)

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
				<ChartContainer className="h-[350px] w-full" config={config}>
					<BarChart data={chartData} margin={{ right: 30, left: 0 }} layout="vertical">
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
							stackId="stack"
							name="Pendientes"
							dataKey="pending"
							fill={config.pending.color}
							radius={[4, 0, 0, 4]}
						/>
						<Bar dataKey="reviewed" fill={config.reviewed.color} name="Revisados" stackId="stack" />
						<Bar
							dataKey="approved"
							fill={config.approved.color}
							name="Aprobados"
							radius={[0, 4, 4, 0]}
							stackId="stack"
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
