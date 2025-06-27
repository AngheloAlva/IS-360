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

interface DocumentsByFolderChartProps {
	data: {
		name: string
		data: {
			status: string
			count: number
		}[]
	}[]
}

const COLORS = {
	DRAFT: "var(--color-cyan-800)",
	SUBMITTED: "var(--color-cyan-500)",
	APPROVED: "var(--color-emerald-500)",
	REJECTED: "var(--color-rose-500)",
}

export function DocumentsByFolderChart({ data }: DocumentsByFolderChartProps) {
	// Transformar los datos para el gráfico de barras apiladas
	const chartData = data.map((folder) => ({
		name: folder.name,
		...folder.data.reduce(
			(acc, doc) => ({
				...acc,
				[doc.status]: doc.count,
			}),
			{}
		),
	}))

	return (
		<Card className="border-none xl:col-span-2">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Documentos por carpeta</CardTitle>
						<CardDescription>
							Distribución de documentos por estado en cada tipo de carpeta
						</CardDescription>
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
						}}
						className="h-full w-full"
					>
						<BarChart data={chartData} margin={{ right: 20 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend content={<ChartLegendContent />} />

							<Bar dataKey="DRAFT" stackId="a" fill={COLORS.DRAFT} radius={[4, 4, 0, 0]} />
							<Bar dataKey="SUBMITTED" stackId="b" fill={COLORS.SUBMITTED} radius={[4, 4, 0, 0]} />
							<Bar dataKey="APPROVED" stackId="c" fill={COLORS.APPROVED} radius={[4, 4, 0, 0]} />
							<Bar dataKey="REJECTED" stackId="d" fill={COLORS.REJECTED} radius={[4, 4, 0, 0]} />
						</BarChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}
