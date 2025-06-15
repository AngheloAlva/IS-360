"use client"

import {
	BarChart as RechartsBarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface FolderMonthlyChartProps {
	data: Array<{
		month: number
		count: number
	}>
}

interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{
		value: number
		name: string
		dataKey: string
	}>
	label?: string
}

const monthNames = [
	"Ene",
	"Feb",
	"Mar",
	"Abr",
	"May",
	"Jun",
	"Jul",
	"Ago",
	"Sep",
	"Oct",
	"Nov",
	"Dic",
]

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		const monthName = monthNames[Number(label) - 1]
		return (
			<div className="bg-background rounded-lg border p-2 shadow-sm">
				<div className="grid grid-cols-2 gap-2">
					<div className="flex flex-col">
						<span className="text-muted-foreground text-[0.70rem] uppercase">Mes</span>
						<span className="text-muted-foreground font-bold">{monthName}</span>
					</div>
					<div className="flex flex-col">
						<span className="text-muted-foreground text-[0.70rem] uppercase">Carpetas</span>
						<span className="font-bold">{payload[0].value}</span>
					</div>
				</div>
			</div>
		)
	}
	return null
}

export function FolderMonthlyChart({ data }: FolderMonthlyChartProps) {
	// Transformar datos para incluir nombres de meses
	const chartData = data.map((item) => ({
		...item,
		name: monthNames[item.month - 1],
	}))

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">Carpetas por mes</CardTitle>
				<p className="text-muted-foreground text-sm">Carpetas de arranque creadas mensualmente</p>
			</CardHeader>
			<CardContent>
				<div className="h-[200px] w-full">
					<ResponsiveContainer width="100%" height="100%">
						<RechartsBarChart
							data={chartData}
							margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
						>
							<XAxis
								dataKey="month"
								tickFormatter={(value) => monthNames[value - 1]}
								tick={{ fontSize: 12 }}
								axisLine={false}
								tickLine={false}
							/>
							<YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickCount={5} />
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
							<Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
						</RechartsBarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	)
}
