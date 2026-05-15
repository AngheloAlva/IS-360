"use client"

import { PieChart, Pie, Cell, Label } from "recharts"
import { PieChartIcon } from "lucide-react"
import { useState } from "react"

import { ChartContainer } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

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

const STATUS_LABELS = {
	DRAFT: "Borrador",
	SUBMITTED: "Enviado",
	APPROVED: "Aprobado",
	REJECTED: "Rechazado",
	EXPIRED: "Vencido",
	TO_UPDATE: "A actualizar",
} as const

export function DocumentStatusChart({ data }: DocumentStatusChartProps) {
	const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)

	const totalDocuments = data.reduce((acc, item) => acc + item.count, 0)

	const chartItems = data.map((item) => {
		const percentage = totalDocuments === 0 ? 0 : (item.count / totalDocuments) * 100

		return {
			...item,
			label: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] ?? item.status,
			percentage,
		}
	})

	return (
		<Card className="overflow-hidden border-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Estado de documentos</CardTitle>
						<CardDescription>Distribución total de documentos por estado</CardDescription>
					</div>

					<div className="rounded-lg bg-emerald-500/10 p-1.5">
						<PieChartIcon className="size-5 text-emerald-500" />
					</div>
				</div>
			</CardHeader>

			<CardContent className="flex max-w-[90dvw] flex-col items-center justify-center gap-6 md:flex-row md:items-center md:justify-between">
				<ChartContainer
					className="h-70 w-full md:max-w-64"
					config={{
						DRAFT: {
							label: STATUS_LABELS.DRAFT,
						},
						SUBMITTED: {
							label: STATUS_LABELS.SUBMITTED,
						},
						APPROVED: {
							label: STATUS_LABELS.APPROVED,
						},
						REJECTED: {
							label: STATUS_LABELS.REJECTED,
						},
						EXPIRED: {
							label: STATUS_LABELS.EXPIRED,
						},
						TO_UPDATE: {
							label: STATUS_LABELS.TO_UPDATE,
						},
					}}
				>
					<PieChart>
						<Pie
							cx="50%"
							cy="50%"
							radius={10}
							dataKey="count"
							nameKey="status"
							innerRadius={45}
							paddingAngle={3}
							cornerRadius={8}
							data={chartItems}
							onMouseLeave={() => setHoveredStatus(null)}
						>
							{chartItems.map((entry) => (
								<Cell
									key={`cell-${entry.status}`}
									fill={COLORS[entry.status as keyof typeof COLORS] ?? "var(--color-neutral-500)"}
									fillOpacity={hoveredStatus && hoveredStatus !== entry.status ? 0.25 : 1}
									stroke={
										hoveredStatus === entry.status ? "var(--color-background)" : "transparent"
									}
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
													className="fill-foreground text-2xl font-bold"
												>
													{totalDocuments}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 24}
													className="fill-muted-foreground"
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

				<div className="w-full">
					{chartItems.map((item) => (
						<div
							key={item.status}
							className="flex items-center justify-between gap-4 py-1.5 transition-opacity select-none"
							style={{ opacity: hoveredStatus && hoveredStatus !== item.status ? 0.35 : 1 }}
							onMouseEnter={() => setHoveredStatus(item.status)}
							onMouseLeave={() => setHoveredStatus(null)}
						>
							<div className="flex min-w-0 items-center gap-2">
								<span
									className="h-2.5 w-2.5 shrink-0 rounded-full"
									style={{
										backgroundColor:
											COLORS[item.status as keyof typeof COLORS] ?? "var(--color-neutral-500)",
									}}
								/>
								<p className="truncate text-sm font-medium">{item.label}</p>
							</div>

							<p className="text-muted-foreground shrink-0 text-sm">
								{item.count.toLocaleString("es-CL")} ({item.percentage.toFixed(1)}%)
							</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
