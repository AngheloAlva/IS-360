"use client"

import { Bar, BarChart, LabelList, XAxis, YAxis, Cell } from "recharts"
import { ChartColumnIcon } from "lucide-react"

import { useLockoutPermitFilters } from "../../hooks/use-lockout-permit-filters"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface LockoutPermitTypeChartProps {
	data: {
		type: string
		count: number
	}[]
}

const TYPE_COLORS: Record<string, string> = {
	"PREVENTIVE": "hsl(142, 76%, 36%)", // green-600
	"CORRECTIVE": "hsl(45, 93%, 47%)", // yellow-500
	"EMERGENCY": "hsl(0, 84%, 60%)", // red-500
	"OTHER": "hsl(220, 14%, 46%)", // gray-500
}

const TYPE_LABELS: Record<string, string> = {
	"PREVENTIVE": "Preventivo",
	"CORRECTIVE": "Correctivo", 
	"EMERGENCY": "Emergencia",
	"OTHER": "Otro",
}

export default function LockoutPermitTypeChart({ data }: LockoutPermitTypeChartProps) {
	const { filters, actions } = useLockoutPermitFilters()

	const chartData = data.map((item) => ({
		...item,
		label: TYPE_LABELS[item.type] || item.type,
		color: TYPE_COLORS[item.type] || "hsl(220, 14%, 46%)",
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
						<CardTitle className="text-lg font-semibold">Tipos de Bloqueo</CardTitle>
						<CardDescription>Permisos de bloqueo agrupados por tipo</CardDescription>
					</div>
					<ChartColumnIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer config={{}} className="h-[250px] w-full max-w-[90dvw]">
					<BarChart data={chartData} margin={{ right: 15, top: 15, bottom: 10 }}>
						<ChartTooltip content={<ChartTooltipContent nameKey="label" />} />

						<XAxis dataKey="label" angle={-20} tickMargin={10} />
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
