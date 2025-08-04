"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { ChartBarBigIcon } from "lucide-react"

import { ChartTooltip, ChartContainer, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface WorkRequestOperatorChartProps {
	data: {
		operatorId: string
		operatorName: string
		count: number
	}[]
}

export default function WorkRequestOperatorChart({ data }: WorkRequestOperatorChartProps) {
	const chartData = data.map((item) => ({
		operator: item.operatorName,
		count: item.count,
		fill: "var(--color-cyan-500)",
	}))

	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Solicitudes por Operadores</CardTitle>
						<CardDescription>Cantidad de solicitudes de trabajo por operador</CardDescription>
					</div>
					<ChartBarBigIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>

			<CardContent className="h-full w-full max-w-[90dvw] p-0">
				<ChartContainer
					config={{
						count: {
							label: "Solicitudes",
							color: "var(--color-cyan-500)",
						},
					}}
					className="h-full w-full"
				>
					<BarChart data={chartData} margin={{ right: 30 }} layout="vertical">
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis type="number" allowDecimals={false} />
						<YAxis dataKey="operator" width={100} type="category" />

						<ChartTooltip
							content={<ChartTooltipContent />}
							labelFormatter={(label) => `Operador: ${label}`}
						/>
						<Bar dataKey="count" fill="var(--color-teal-500)" radius={[0, 4, 4, 0]}>
							<LabelList dataKey="count" position="right" />
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
