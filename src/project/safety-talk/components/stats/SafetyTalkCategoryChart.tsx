"use client"

import { Cell, Label, Pie, PieChart } from "recharts"
import { ChartPieIcon } from "lucide-react"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"

const COLORS = ["var(--color-sky-500)", "var(--color-emerald-500)", "var(--color-teal-500)"]

interface SafetyTalkCategoryChartProps {
	data: Array<{
		name: string
		value: number
	}>
}

export function SafetyTalkCategoryChart({ data }: SafetyTalkCategoryChartProps) {
	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Distribución por Categoría</CardTitle>
						<CardDescription>Total de charlas realizadas por categoría</CardDescription>
					</div>
					<ChartPieIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="flex justify-center">
				<ChartContainer
					config={{
						ENVIRONMENT: {
							label: "Medio Ambiente",
						},
						IRL: {
							label: "IRL",
						},
					}}
					className="h-[250px] w-full"
				>
					<PieChart>
						<Pie
							cy="50%"
							cx="50%"
							data={data}
							paddingAngle={3}
							innerRadius={45}
							dataKey="value"
							label
						>
							<Label
								content={({ viewBox }) => {
									if (viewBox && "cx" in viewBox && "cy" in viewBox) {
										return (
											<text
												x={viewBox.cx}
												y={viewBox.cy}
												textAnchor="middle"
												dominantBaseline="middle"
											>
												<tspan
													x={viewBox.cx}
													y={viewBox.cy}
													className="fill-foreground text-2xl font-semibold"
												>
													{data.reduce((acc, item) => acc + item.value, 0)?.toLocaleString()}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 24}
													className="fill-muted-foreground text-sm"
												>
													Total
												</tspan>
											</text>
										)
									}
								}}
							/>

							{data.map((_, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<ChartTooltip content={<ChartTooltipContent />} />
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
