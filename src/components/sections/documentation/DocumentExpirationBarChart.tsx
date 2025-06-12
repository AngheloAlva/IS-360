"use client"

import { useRouter } from "next/navigation"
import {
	Bar,
	Cell,
	YAxis,
	XAxis,
	CartesianGrid,
	BarChart as RechartsBarChart,
	LabelList,
} from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DocumentExpirationBarChartProps {
	data: Array<{ name: string; value: number; fill?: string; id: string }>
	colors?: string[]
}

export function DocumentExpirationBarChart({ data, colors }: DocumentExpirationBarChartProps) {
	const router = useRouter()

	return (
		<ChartContainer config={{}} className="h-[350px] w-full">
			<RechartsBarChart data={data} margin={{ top: 15 }}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
				<YAxis />
				<ChartTooltip content={<ChartTooltipContent formatter={(value) => value} />} />
				<Bar dataKey="value" radius={[4, 4, 0, 0]}>
					<LabelList dataKey="value" position="top" />
					{data.map((entry, index) => (
						<Cell
							className="cursor-pointer"
							onClick={() =>
								router.push(`/admin/dashboard/documentacion/busqueda?expiration=${entry.id}`)
							}
							key={`cell-${index}`}
							fill={
								entry.fill ||
								(colors
									? colors[index % colors.length]
									: `#${Math.floor(Math.random() * 16777215).toString(16)}`)
							}
						/>
					))}
				</Bar>
			</RechartsBarChart>
		</ChartContainer>
	)
}
