"use client"

import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"
import { CalendarCheckIcon } from "lucide-react"

import { MaintenancePlanMonthlyStat } from "@/project/maintenance-plan/hooks/use-maintenance-plan-specific-stats"

import { ChartTooltip, ChartContainer, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface MaintenancePlanMonthlyChartProps {
	data: MaintenancePlanMonthlyStat[]
}

export default function MaintenancePlanMonthlyChart({ data }: MaintenancePlanMonthlyChartProps) {
	return (
		<Card className="border pb-0 shadow-md">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Tareas Cumplidas por Mes</CardTitle>
						<CardDescription>Visualización de tareas completadas mensualmente</CardDescription>
					</div>

					<div className="rounded-lg bg-emerald-500/10 p-1.5">
						<CalendarCheckIcon className="size-5 text-emerald-500" />
					</div>
				</div>
			</CardHeader>

			<CardContent className="px-2 pt-0 pb-0">
				<ChartContainer
					config={{
						tasks: {
							label: "Tareas Completadas",
							color: "var(--color-indigo-500)",
						},
					}}
					className="h-70 w-full"
				>
					<AreaChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
						<defs>
							<linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-indigo-500)" stopOpacity={0.8} />
								<stop offset="95%" stopColor="var(--color-indigo-500)" stopOpacity={0.1} />
							</linearGradient>
						</defs>

						<CartesianGrid strokeDasharray="3 3" vertical={false} />

						<XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
						<YAxis tickLine={false} axisLine={false} tickMargin={10} />
						<ChartTooltip content={<ChartTooltipContent indicator="line" />} />
						<Area
							dataKey="value"
							type="monotone"
							stroke="var(--color-indigo-500)"
							strokeWidth={2}
							fill="url(#colorUploads)"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
