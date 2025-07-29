"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import { ChartTooltip, ChartContainer, ChartTooltipContent } from "@/shared/components/ui/chart"

interface TopContributorsChartProps {
	data: Array<{ name: string; value: number }>
}

export function TopContributorsChart({ data }: TopContributorsChartProps) {
	console.log(data)
	return (
		<ChartContainer className="h-[300px] w-full" config={{}}>
			<BarChart data={data} layout="vertical">
				<CartesianGrid strokeDasharray="3 3" horizontal={false} />

				<XAxis type="number" />
				<YAxis type="category" dataKey="name" />
				<ChartTooltip
					content={<ChartTooltipContent />}
					cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
				/>
				<Bar dataKey="value" fill="var(--color-purple-500)" radius={[0, 4, 4, 0]}>
					<LabelList dataKey="value" position="right" />
				</Bar>
			</BarChart>
		</ChartContainer>
	)
}
