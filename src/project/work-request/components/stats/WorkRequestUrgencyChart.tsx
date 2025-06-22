"use client"

import { Bar, XAxis, YAxis, BarChart, LabelList, CartesianGrid } from "recharts"
import { ChartColumnIcon } from "lucide-react"

import { WorkRequestStatsResponse } from "@/project/work-request/hooks/use-work-request-stats"

import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface WorkRequestUrgencyChartProps {
	data: WorkRequestStatsResponse["urgencyStats"]
}

export default function WorkRequestUrgencyChart({ data }: WorkRequestUrgencyChartProps) {
	const chartData = [
		{
			name: "Urgente",
			atendidas: data.urgent.attended,
			pendientes: data.urgent.pending,
		},
		{
			name: "No Urgente",
			atendidas: data.nonUrgent.attended,
			pendientes: data.nonUrgent.pending,
		},
	]

	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-base font-medium">Solicitudes por Urgencia</CardTitle>
						<CardDescription>
							Solicitudes atendidas y pendientes según su nivel de urgencia
						</CardDescription>
					</div>
					<ChartColumnIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<div className="h-[240px] w-full">
					<ChartContainer
						config={{
							atendidas: {
								label: "Atendidas",
							},
							pendientes: {
								label: "Pendientes",
							},
						}}
						className="h-[250px] w-full"
					>
						<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend content={<ChartLegendContent />} />

							<Bar
								dataKey="atendidas"
								name="Atendidas"
								radius={[4, 4, 0, 0]}
								fill="var(--color-sky-500)"
							>
								<LabelList dataKey="atendidas" position="top" />
							</Bar>
							<Bar
								dataKey="pendientes"
								name="Pendientes"
								radius={[4, 4, 0, 0]}
								fill="var(--color-blue-500)"
							>
								<LabelList dataKey="pendientes" position="top" />
							</Bar>
						</BarChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}
