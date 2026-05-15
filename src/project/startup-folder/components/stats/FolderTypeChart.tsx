"use client"

import { PieChart, Pie, Cell } from "recharts"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import {
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"
import { PieChartIcon } from "lucide-react"

interface FolderTypeChartProps {
	data: {
		name: string
		value: number
		fill: string
	}[]
}

export function FolderTypeChart({ data }: FolderTypeChartProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Estados de documentos</CardTitle>
						<CardDescription>Distribución según estado de documentos por carpeta</CardDescription>
					</div>
					<PieChartIcon className="text-muted-foreground h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="h-[200px] w-full">
					<ChartContainer config={{}} className="h-full w-full">
						<PieChart>
							<Pie cx="50%" cy="50%" data={data} outerRadius={80} dataKey="value" nameKey="name">
								<Cell />
							</Pie>
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend
								layout="horizontal"
								verticalAlign="bottom"
								align="center"
								content={<ChartLegendContent nameKey="name" />}
								formatter={(value) => <span className="text-xs">{value}</span>}
							/>
						</PieChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}
