"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ActivityLineChartProps {
	data: {
		date: string
		archivos: number
		carpetas: number
	}[]
}

export function ActivityLineChart({ data }: ActivityLineChartProps) {
	return (
		<ChartContainer config={{}} className="h-[350px] w-full">
			<AreaChart data={data}>
				<CartesianGrid strokeDasharray="3 3" vertical={false} />

				<XAxis dataKey="date" />
				<YAxis />

				<ChartTooltip content={<ChartTooltipContent />} />

				<defs>
					<linearGradient id={"company-1"} x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={"var(--color-blue-500)"} stopOpacity={0.8} />
						<stop offset="95%" stopColor={"var(--color-blue-500)"} stopOpacity={0.1} />
					</linearGradient>
					<linearGradient id={"company-2"} x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={"var(--color-green-500)"} stopOpacity={0.8} />
						<stop offset="95%" stopColor={"var(--color-green-500)"} stopOpacity={0.1} />
					</linearGradient>
				</defs>

				<Area
					type="monotone"
					dataKey="archivos"
					stroke="var(--color-blue-500)"
					name="Archivos"
					fill="url(#company-1)"
				/>
				<Area
					type="monotone"
					dataKey="carpetas"
					stroke="var(--color-green-500)"
					name="Carpetas"
					fill="url(#company-2)"
				/>
			</AreaChart>
		</ChartContainer>
	)
}
