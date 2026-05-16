"use client"

import { PieChart, Pie, Label, Cell } from "recharts"
import { PieChartIcon } from "lucide-react"
import { useState } from "react"

import { useWorkPermitFilters } from "../../hooks/use-work-permit-filters"

import { ChartTooltip, ChartContainer, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface WorkPermitStatusChartProps {
	data: {
		status: string
		count: number
		fill: string
	}[]
	total: number
}

const STATUS_LABELS = {
	ACTIVE: "Activo",
	COMPLETED: "Completado",
	REVIEW_PENDING: "Pendiente de Revision",
	REJECTED: "Rechazado",
} as const

export default function WorkPermitStatusChart({ data, total }: WorkPermitStatusChartProps) {
	const { filters, actions } = useWorkPermitFilters()
	const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)

	const chartItems = data
		.filter((item) => item.count > 0)
		.map((item) => ({
			...item,
			percentage: total === 0 ? 0 : (item.count / total) * 100,
		}))

	const handleChartClick = (data: unknown) => {
		const clickedStatus = (data as { status?: string; payload?: { status?: string } })
			.payload?.status ?? (data as { status?: string }).status
		if (!clickedStatus) return

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
						<CardTitle className="text-lg font-semibold">Estado de Permisos de Trabajo</CardTitle>
						<CardDescription>Estado de permisos de trabajo agrupados por estado</CardDescription>
					</div>
					<div className="rounded-lg bg-purple-500/10 p-1.5">
						<PieChartIcon className="size-5 text-purple-500" />
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row md:items-center md:justify-between">
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
						className="h-62.5 w-full md:max-w-72"
					>
						<PieChart margin={{ top: 10 }}>
							<ChartTooltip content={<ChartTooltipContent nameKey="status" />} />

							<Pie
								cx="50%"
								cy="50%"
								data={chartItems}
								dataKey="count"
								nameKey="status"
								innerRadius={45}
								paddingAngle={3}
								cornerRadius={8}
								onClick={handleChartClick}
								onMouseLeave={() => setHoveredStatus(null)}
							>
								{chartItems.map((entry) => (
									<Cell
										key={`cell-${entry.status}`}
										fill={entry.fill}
										fillOpacity={hoveredStatus && hoveredStatus !== entry.status ? 0.25 : 1}
										strokeWidth={
											filters.statusFilter === entry.status || hoveredStatus === entry.status
												? 2
												: 0
										}
										className="cursor-pointer"
										onMouseEnter={() => setHoveredStatus(entry.status)}
										onMouseLeave={() => setHoveredStatus(null)}
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
														{total.toLocaleString()}
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
						</PieChart>
					</ChartContainer>

					<div className="w-full md:max-w-75">
						{chartItems.map((item) => (
							<div
								key={item.status}
								className="flex cursor-pointer items-center justify-between gap-4 rounded-md px-2 py-2 transition-opacity"
								style={{ opacity: hoveredStatus && hoveredStatus !== item.status ? 0.35 : 1 }}
								onMouseEnter={() => setHoveredStatus(item.status)}
								onMouseLeave={() => setHoveredStatus(null)}
								onClick={() => handleChartClick({ status: item.status })}
							>
								<div className="flex min-w-0 items-center gap-2">
									<span
										className="h-2.5 w-2.5 shrink-0 rounded-full"
										style={{ backgroundColor: item.fill }}
									/>
									<p className="truncate text-sm font-medium">
										{STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] ?? item.status}
									</p>
								</div>

								<p className="text-muted-foreground shrink-0 text-sm">
									{item.count.toLocaleString("es-CL")} ({item.percentage.toFixed(1)}%)
								</p>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
