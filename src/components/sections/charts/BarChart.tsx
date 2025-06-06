import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/utils"

import {
	ChartTooltip,
	ChartContainer,
	type ChartConfig,
	ChartTooltipContent,
} from "@/components/ui/chart"

interface Props {
	data: {
		name: string
		value: number
		fill: string
	}[]
	config: ChartConfig
	className?: string
}
export default function BarChart({ data, config, className }: Props): React.ReactElement {
	return (
		<ChartContainer config={config} className={cn("aspect-auto h-[250px] w-full", className)}>
			<RechartsBarChart
				data={data}
				accessibilityLayer
				margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
			>
				<CartesianGrid vertical={false} />
				<XAxis dataKey="name" angle={-20} textAnchor="end" height={80} />
				<YAxis />

				<ChartTooltip content={<ChartTooltipContent nameKey="type" />} />

				<Bar dataKey="value" />
			</RechartsBarChart>
		</ChartContainer>
	)
}
