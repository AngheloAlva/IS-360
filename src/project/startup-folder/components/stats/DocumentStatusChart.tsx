"use client"

import { PieChart, Pie, Cell } from "recharts"
import { PieChartIcon } from "lucide-react"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"

interface DocumentStatusChartProps {
	data: {
		status: string
		count: number
	}[]
}

const COLORS = {
	DRAFT: "var(--color-cyan-800)",
	SUBMITTED: "var(--color-cyan-500)",
	APPROVED: "var(--color-emerald-500)",
	REJECTED: "var(--color-rose-500)",
}

export function DocumentStatusChart({ data }: DocumentStatusChartProps) {
	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Estado de documentos</CardTitle>
						<CardDescription>Distribución total de documentos por estado</CardDescription>
					</div>
					<PieChartIcon className="text-muted-foreground h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent>
				<ChartContainer
					className="h-[300px] w-full"
					config={{
						DRAFT: {
							label: "Borrador",
						},
						SUBMITTED: {
							label: "Enviado",
						},
						APPROVED: {
							label: "Aprobado",
						},
						REJECTED: {
							label: "Rechazado",
						},
					}}
				>
					<PieChart>
						<Pie
							cx="50%"
							cy="50%"
							data={data}
							dataKey="count"
							nameKey="status"
							innerRadius={45}
							paddingAngle={5}
							label={({ percent }) => `${(percent * 100).toFixed(2)}%`}
						>
							{data.map((entry) => (
								<Cell
									key={`cell-${entry.status}`}
									fill={COLORS[entry.status as keyof typeof COLORS]}
								/>
							))}
						</Pie>
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
