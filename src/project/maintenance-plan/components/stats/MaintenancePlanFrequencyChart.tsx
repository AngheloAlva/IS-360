"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from "recharts"
import { ChartColumnIcon } from "lucide-react"

import { PieChartItem } from "@/project/maintenance-plan/hooks/use-maintenance-plan-stats"

import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"
import { ChartTooltip, ChartContainer, ChartTooltipContent } from "@/shared/components/ui/chart"

interface MaintenancePlanFrequencyChartProps {
	data: PieChartItem[]
}

const COLORS = [
	"var(--color-indigo-500)",
	"var(--color-purple-500)",
	"var(--color-rose-500)",
	"var(--color-violet-500)",
	"var(--color-fuchsia-500)",
	"var(--color-pink-500)",
	"var(--color-cyan-500)",
	"var(--color-cyan-500)",
]

export default function MaintenancePlanFrequencyChart({
	data,
}: MaintenancePlanFrequencyChartProps) {
	return (
		<Card className="border">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Tareas por Frecuencia</CardTitle>
						<CardDescription>Distribución de las tareas por frecuencia</CardDescription>
					</div>
					<ChartColumnIcon className="text-muted-foreground h-5 min-w-5" />
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<ChartContainer
					config={{
						Diario: {
							label: "Diario",
						},
						Semanal: {
							label: "Semanal",
						},
						Mensual: {
							label: "Mensual",
						},
						Anual: {
							label: "Anual",
						},
						Trimestral: {
							label: "Trimestral",
						},
						Semestral: {
							label: "Semestral",
						},
					}}
					className="h-[250px] w-full max-w-[90dvw]"
				>
					<BarChart data={data} margin={{ top: 15, right: 20 }}>
						<ChartTooltip content={<ChartTooltipContent nameKey="frequency" />} />

						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis dataKey="value" />

						<Bar dataKey="value" name="Tareas" radius={[4, 4, 0, 0]} maxBarSize={60}>
							{data.map((_, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}

							<LabelList dataKey="value" position="top" />
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
