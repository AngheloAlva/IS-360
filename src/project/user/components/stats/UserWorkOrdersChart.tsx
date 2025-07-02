"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { BarChart3Icon } from "lucide-react"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

import type { WORK_ORDER_STATUS } from "@prisma/client"

interface UserWorkOrdersChartProps {
	data: Array<{
		name: string
		workOrders: Record<WORK_ORDER_STATUS, number>
	}>
}

export function UserWorkOrdersChart({ data }: UserWorkOrdersChartProps) {
	const chartData = data.map((item) => ({
		name: item.name,
		...item.workOrders,
	}))

	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Usuarios con órdenes de trabajo</CardTitle>
						<CardDescription>Ordenes de trabajo divididas por estado</CardDescription>
					</div>
					<BarChart3Icon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer config={{}} className="h-[250px] w-full max-w-[90dvw]">
					<BarChart data={chartData}>
						<XAxis
							dataKey="name"
							tick={{ fontSize: 12 }}
							tickLine={false}
							axisLine={false}
							interval={0}
							angle={-25}
							textAnchor="end"
							height={65}
						/>
						<YAxis
							allowDecimals={false}
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 12 }}
						/>
						<ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "transparent" }} />
						<Bar
							dataKey="PLANNED"
							stackId="a"
							fill="var(--color-indigo-500)"
							name="Planificadas"
							radius={[0, 0, 4, 4]}
						/>
						<Bar dataKey="PENDING" stackId="a" fill="var(--color-purple-500)" name="Pendientes" />
						<Bar
							dataKey="IN_PROGRESS"
							stackId="a"
							fill="var(--color-fuchsia-500)"
							name="En Progreso"
						/>
						<Bar dataKey="COMPLETED" stackId="a" fill="var(--color-rose-500)" name="Completadas" />
						<Bar dataKey="CANCELLED" stackId="a" fill="var(--color-pink-500)" name="Canceladas" />
						<Bar
							dataKey="CLOSURE_REQUESTED"
							stackId="a"
							fill="var(--color-violet-500)"
							name="Cierre Solicitado"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
