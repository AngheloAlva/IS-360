"use client"

import { Bar, XAxis, YAxis, BarChart, LabelList, CartesianGrid } from "recharts"
import { ChartBarDecreasingIcon } from "lucide-react"

import { EquipmentTypeData } from "@/project/equipment/hooks/use-equipment-stats"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface EquipmentTypeChartProps {
	data: EquipmentTypeData[]
}

export default function EquipmentTypeChart({ data }: EquipmentTypeChartProps) {
	// Transform data to handle long type names
	const chartData = data.map((item) => ({
		type: item.type.length > 12 ? `${item.type.substring(0, 12)}...` : item.type,
		count: item.count,
		fullName: item.type,
	}))

	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-base font-medium">Equipos por Tipo</CardTitle>
						<CardDescription>Equipos con más ocurrencias agrupados por tipo</CardDescription>
					</div>
					<ChartBarDecreasingIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>

			<CardContent className="p-4">
				<div className="h-[240px] w-full">
					<ChartContainer config={{}} className="h-[250px] w-full max-w-[90dvw]">
						<BarChart
							data={chartData}
							layout="vertical"
							margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" horizontal={false} />
							<XAxis type="number" />
							<YAxis dataKey="type" type="category" width={80} tick={{ fontSize: 12 }} />
							<ChartTooltip content={<ChartTooltipContent />} />

							<Bar dataKey="count" radius={[0, 4, 4, 0]} fill="var(--color-teal-600)">
								<LabelList dataKey="count" position="right" />
							</Bar>
						</BarChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}
