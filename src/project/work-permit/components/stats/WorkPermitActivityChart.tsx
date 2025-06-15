"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartSplineIcon } from "lucide-react"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface WorkPermitActivityChartProps {
	data: {
		date: string
		count: number
	}[]
}

export default function WorkPermitActivityChart({ data }: WorkPermitActivityChartProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-base font-medium">Actividad de Permisos (30 días)</CardTitle>
						<CardDescription>Equipos con más ocurrencias agrupados por tipo</CardDescription>
					</div>
					<ChartSplineIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer config={{}} className="h-[250px] w-full">
					<AreaChart data={data} margin={{ right: 15 }}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />

						<XAxis dataKey="date" />
						<YAxis />

						<ChartTooltip content={<ChartTooltipContent />} />

						<defs>
							<linearGradient id={"company-1"} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={"var(--color-fuchsia-500)"} stopOpacity={0.8} />
								<stop offset="95%" stopColor={"var(--color-fuchsia-500)"} stopOpacity={0.1} />
							</linearGradient>
						</defs>

						<Area
							type="monotone"
							dataKey="count"
							stroke="var(--color-fuchsia-500)"
							fill="url(#company-1)"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
