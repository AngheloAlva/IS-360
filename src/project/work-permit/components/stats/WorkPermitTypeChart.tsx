"use client"

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts"
import { ChartColumnIcon } from "lucide-react"

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

export default function WorkPermitTypeChart({ data }: WorkPermitTypeChartProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-base font-medium">Tipos de Trabajo</CardTitle>
						<CardDescription>Tipos de trabajo agrupados por tipo</CardDescription>
					</div>
					<ChartColumnIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer config={{}} className="h-[250px] w-full max-w-[90dvw]">
					<BarChart data={data} margin={{ right: 15, top: 15, bottom: 10 }}>
						<ChartTooltip content={<ChartTooltipContent />} />

						<XAxis dataKey="type" angle={-20} tickMargin={10} />
						<YAxis />

						<Bar dataKey="count" fill="var(--color-rose-600)" radius={[4, 4, 4, 4]} maxBarSize={40}>
							<LabelList dataKey="count" position="top" />
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
