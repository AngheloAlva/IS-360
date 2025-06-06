import { PieChart as RechartsPieChart, Pie, Label } from "recharts"

import { cn } from "@/lib/utils"

import {
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	type ChartConfig,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/components/ui/chart"

interface Props {
	data: {
		name: string
		value: number
		fill: string
	}[]
	config: ChartConfig
	total?: number
	totalLabel?: string
	className?: string
}
export default function PieChart({
	data,
	config,
	total,
	totalLabel,
	className,
}: Props): React.ReactElement {
	return (
		<ChartContainer
			config={config}
			className={cn(
				"[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square h-full max-h-[300px] max-w-full pb-0",
				className
			)}
		>
			<RechartsPieChart>
				<ChartTooltip content={<ChartTooltipContent />} />

				<Pie data={data} innerRadius={40} dataKey="value" nameKey="name" label>
					<Label
						content={({ viewBox }) => {
							if (viewBox && "cx" in viewBox && "cy" in viewBox) {
								return (
									<text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
										<tspan
											x={viewBox.cx}
											y={viewBox.cy}
											className="fill-foreground text-3xl font-bold"
										>
											{total?.toLocaleString()}
										</tspan>
										<tspan
											x={viewBox.cx}
											y={(viewBox.cy || 0) + 24}
											className="fill-muted-foreground"
										>
											{totalLabel}
										</tspan>
									</text>
								)
							}
						}}
					/>
				</Pie>
				<ChartLegend
					content={<ChartLegendContent nameKey="name" />}
					className="flex-wrap gap-x-3 gap-y-1"
				/>
			</RechartsPieChart>
		</ChartContainer>
	)
}
