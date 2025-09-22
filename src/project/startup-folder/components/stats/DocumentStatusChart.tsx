"use client"

import { PieChart, Pie, Cell } from "recharts"
import { PieChartIcon } from "lucide-react"

import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"
import {
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"

interface DocumentStatusChartProps {
	data: {
		status: string
		count: number
	}[]
}

const COLORS = {
	DRAFT: "var(--color-neutral-600)",
	SUBMITTED: "var(--color-yellow-600)",
	APPROVED: "var(--color-emerald-600)",
	REJECTED: "var(--color-rose-600)",
	EXPIRED: "var(--color-purple-600)",
	TO_UPDATE: "var(--color-blue-600)",
}

export function DocumentStatusChart({ data }: DocumentStatusChartProps) {
	return (
		<Card className="overflow-hidden border-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Estado de documentos</CardTitle>
						<CardDescription>Distribución total de documentos por estado</CardDescription>
					</div>
					<PieChartIcon className="text-muted-foreground h-5 min-w-5" />
				</div>
			</CardHeader>

			<CardContent className="flex max-w-[90dvw] items-center justify-center">
				<ChartContainer
					className="h-[300px]"
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
						EXPIRED: {
							label: "Vencido",
						},
						TO_UPDATE: {
							label: "A actualizar",
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
							paddingAngle={3}
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
						<ChartLegend
							className="mx-auto flex w-11/12 flex-wrap items-center justify-center gap-y-1.5 overflow-hidden"
							content={<ChartLegendContent />}
						/>
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
