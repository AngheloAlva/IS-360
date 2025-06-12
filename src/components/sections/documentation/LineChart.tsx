"use client"

import { XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface LineChartProps {
	data: {
		date: string
		cambios: number
	}[]
}

export function LineChart({ data }: LineChartProps) {
	return (
		<ChartContainer config={{}} className="h-[300px] w-full">
			<AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
				<CartesianGrid strokeDasharray="3 3" vertical={false} />
				<XAxis dataKey="date" />
				<YAxis allowDecimals={false} />
				<ChartTooltip content={<ChartTooltipContent />} />

				<defs>
					<linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="var(--color-purple-500)" stopOpacity={0.8} />
						<stop offset="95%" stopColor="var(--color-purple-500)" stopOpacity={0.1} />
					</linearGradient>
				</defs>

				<Area
					type="monotone"
					dataKey="cambios"
					stroke="var(--color-purple-500)"
					fill="url(#colorTasks)"
					dot={{ r: 4, fill: "var(--color-purple-500)" }}
					activeDot={{ r: 6 }}
					name="Cambios"
				/>
			</AreaChart>
		</ChartContainer>
	)
}
