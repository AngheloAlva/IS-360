"use client"

import { Bar, BarChart, LabelList, XAxis, YAxis, Cell } from "recharts"
import { ChartColumnIcon } from "lucide-react"

import { useWorkPermitFilters } from "../../hooks/use-work-permit-filters"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface WorkPermitTypeChartProps {
	data: {
		type: string
		count: number
	}[]
}

const TYPE_COLORS: Record<string, string> = {
	"Altura fisica": "var(--color-blue-500)",
	"Espacio confinado": "var(--color-purple-500)",
	"Acceso Limitado": "var(--color-red-500)",
	"En Caliente": "var(--color-yellow-500)",
	"Electrico": "var(--color-green-500)",
	"General": "var(--color-rose-500)",
	"Otro": "var(--color-neutral-500)",
}

export default function WorkPermitTypeChart({ data }: WorkPermitTypeChartProps) {
	const { filters, actions } = useWorkPermitFilters()

	const chartData = data.map((item) => ({
		...item,
		color: TYPE_COLORS[item.type] || "var(--color-gray-500)",
	}))

	const handleBarClick = (data: { type: string }) => {
		const clickedType = data.type

		if (filters.typeFilter === clickedType) {
			actions.setTypeFilter(null)
		} else {
			actions.setTypeFilter(clickedType)
		}
	}

	return (
		<Card className="border-none transition-shadow hover:shadow-md">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-lg font-semibold">Tipos de Trabajo</CardTitle>
						<CardDescription>Tipos de trabajo agrupados por tipo</CardDescription>
					</div>
					<ChartColumnIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer config={{}} className="h-[250px] w-full max-w-[90dvw]">
					<BarChart data={chartData} margin={{ right: 15, top: 15, bottom: 10 }}>
						<ChartTooltip content={<ChartTooltipContent nameKey="type" />} />

						<XAxis dataKey="type" angle={-20} tickMargin={10} />
						<YAxis />

						<Bar
							dataKey="count"
							radius={[4, 4, 4, 4]}
							maxBarSize={40}
							onClick={handleBarClick}
							style={{ cursor: "pointer" }}
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={entry.color}
									className="cursor-pointer hover:brightness-75"
									stroke={filters.typeFilter === entry.type ? "var(--text)" : "none"}
									strokeWidth={filters.typeFilter === entry.type ? 1 : 0}
								/>
							))}
							<LabelList dataKey="count" position="top" />
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
