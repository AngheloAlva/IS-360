"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartTooltip, ChartContainer, ChartTooltipContent } from "@/shared/components/ui/chart"

interface MonthlyTrendsChartProps {
	data: Array<{ month: string; count: number }>
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
	return (
		<ChartContainer className="h-[300px] w-full" config={{}}>
			<AreaChart data={data}>
				<defs>
					<linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
						<stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
					</linearGradient>
				</defs>
				<XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
				<YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
				<CartesianGrid />
				<ChartTooltip
					content={<ChartTooltipContent />}
					cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "3 3" }}
				/>
				<Area
					type="monotone"
					dataKey="count"
					stroke="#3b82f6"
					strokeWidth={2}
					fill="url(#colorUploads)"
				/>
			</AreaChart>
		</ChartContainer>
	)
}
