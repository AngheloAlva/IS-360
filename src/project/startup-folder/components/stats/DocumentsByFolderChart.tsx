"use client"

import { Bar, XAxis, YAxis, BarChart, CartesianGrid } from "recharts"
import { BarChartIcon } from "lucide-react"

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

interface SubfoldersByTypeChartProps {
	data: {
		name: string
		DRAFT: number
		SUBMITTED: number
		APPROVED: number
		REJECTED: number
		EXPIRED: number
		TO_UPDATE: number
	}[]
}

const COLORS = {
	DRAFT: "var(--color-neutral-600)",
	SUBMITTED: "var(--color-yellow-600)",
	APPROVED: "var(--color-emerald-600)",
	REJECTED: "var(--color-rose-600)",
	EXPIRED: "var(--color-purple-600)",
	TO_UPDATE: "var(--color-blue-600)",
}

export function DocumentsByFolderChart({ data }: SubfoldersByTypeChartProps) {
	// Los datos ya vienen en el formato correcto para el gráfico
	const chartData = data

	return (
		<Card className="border-none xl:col-span-2">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Subcarpetas por estado</CardTitle>
						<CardDescription>Distribución de subcarpetas por estado en cada tipo</CardDescription>
					</div>
					<BarChartIcon className="text-muted-foreground h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="max-w-[90dvw] items-center justify-center p-0">
				<div className="h-[300px] w-full">
					<ChartContainer
						config={{
							DRAFT: {
								label: "Borrador",
							},
							SUBMITTED: {
								label: "Enviado",
							},
							APPROVED: {
								label: "Aprobado",
							},
							REJECTED: {
								label: "Rechazado",
							},
							EXPIRED: {
								label: "Vencido",
							},
							TO_UPDATE: {
								label: "A actualizar",
							},
						}}
						className="h-full w-full"
					>
						<BarChart data={chartData} margin={{ right: 20 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend content={<ChartLegendContent />} />

							<Bar dataKey="DRAFT" stackId="a" fill={COLORS.DRAFT} radius={[0, 0, 4, 4]} />
							<Bar dataKey="SUBMITTED" stackId="a" fill={COLORS.SUBMITTED} radius={[0, 0, 0, 0]} />
							<Bar dataKey="REJECTED" stackId="a" fill={COLORS.REJECTED} radius={[0, 0, 0, 0]} />
							<Bar dataKey="EXPIRED" stackId="a" fill={COLORS.EXPIRED} radius={[0, 0, 0, 0]} />
							<Bar dataKey="TO_UPDATE" stackId="a" fill={COLORS.TO_UPDATE} radius={[0, 0, 0, 0]} />
							<Bar dataKey="APPROVED" stackId="a" fill={COLORS.APPROVED} radius={[4, 4, 0, 0]} />
						</BarChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}
