"use client"

import { PieChart, Pie, Label, Cell } from "recharts"
import { PieChartIcon } from "lucide-react"

import { useLockoutPermitFilters } from "../../hooks/use-lockout-permit-filters"

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

interface LockoutPermitStatusChartProps {
	data: {
		total: number
		active: number
		pending: number
		completed: number
		rejected: number
	}
	percentages: {
		active: number
		pending: number
		completed: number
		rejected: number
	}
}

export default function LockoutPermitStatusChart({ data, percentages }: LockoutPermitStatusChartProps) {
	const { filters, actions } = useLockoutPermitFilters()

	const chartData = [
		{
			status: "ACTIVE",
			label: "Activo",
			count: data.active,
			percentage: percentages.active,
			fill: "hsl(142, 76%, 36%)", // green-600
		},
		{
			status: "REVIEW_PENDING", 
			label: "Pendiente",
			count: data.pending,
			percentage: percentages.pending,
			fill: "hsl(45, 93%, 47%)", // yellow-500
		},
		{
			status: "COMPLETED",
			label: "Completado", 
			count: data.completed,
			percentage: percentages.completed,
			fill: "hsl(263, 70%, 50%)", // purple-600
		},
		{
			status: "REJECTED",
			label: "Rechazado",
			count: data.rejected,
			percentage: percentages.rejected,
			fill: "hsl(0, 84%, 60%)", // red-500
		},
	].filter(item => item.count > 0)

	const handleChartClick = (chartData: { status: string }) => {
		const clickedStatus = chartData.status

		if (filters.statusFilter === clickedStatus) {
			actions.setStatusFilter(null)
		} else {
			actions.setStatusFilter(clickedStatus)
		}
	}

	return (
		<Card className="border-none transition-shadow hover:shadow-md">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-lg font-semibold">Estado de Permisos de Bloqueo</CardTitle>
						<CardDescription>Estado de permisos de bloqueo agrupados por estado</CardDescription>
					</div>
					<PieChartIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="px-0">
				<ChartContainer
					config={{
						ACTIVE: {
							label: "Activo",
						},
						COMPLETED: {
							label: "Completado",
						},
						REVIEW_PENDING: {
							label: "Pendiente de Revisión",
						},
						REJECTED: {
							label: "Rechazado",
						},
					}}
					className="h-[250px] w-full max-w-[90dvw]"
				>
					<PieChart margin={{ top: 10 }}>
						<ChartTooltip content={<ChartTooltipContent nameKey="label" />} />

						<Pie
							label={(entry) => `${entry.percentage.toFixed(1)}%`}
							cx="50%"
							cy="50%"
							data={chartData}
							dataKey="count"
							nameKey="label"
							innerRadius={45}
							paddingAngle={5}
							onClick={handleChartClick}
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={entry.fill}
									strokeWidth={filters.statusFilter === entry.status ? 2 : 0}
									stroke={filters.statusFilter === entry.status ? "var(--text)" : "none"}
									className="cursor-pointer hover:brightness-75"
								/>
							))}
							<Label
								content={({ viewBox }) => {
									if (viewBox && "cx" in viewBox && "cy" in viewBox) {
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
													className="fill-foreground text-2xl font-semibold"
												>
													{data.total.toLocaleString()}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 24}
													className="fill-muted-foreground text-sm"
												>
													Total
												</tspan>
											</text>
										)
									}
								}}
							/>
						</Pie>

						<ChartLegend content={<ChartLegendContent nameKey="label" />} />
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
