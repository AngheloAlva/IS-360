"use client"

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { ChartBarIcon } from "lucide-react"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"

const STATUS_COLORS = {
	PENDING: "var(--color-amber-500)",
	PASSED: "var(--color-blue-500)",
	FAILED: "var(--color-red-500)",
	MANUALLY_APPROVED: "var(--color-emerald-500)",
	EXPIRED: "var(--color-gray-500)",
}

const STATUS_LABELS = {
	PENDING: "Pendiente",
	PASSED: "Aprobado",
	FAILED: "Reprobado",
	MANUALLY_APPROVED: "Aprobado Manual",
	EXPIRED: "Expirado",
}

interface SafetyTalkStatusChartProps {
	data: Array<{
		name: string
		value: number
	}>
}

export function SafetyTalkStatusChart({ data }: SafetyTalkStatusChartProps) {
	const formattedData = data.map((item) => ({
		...item,
		name: STATUS_LABELS[item.name as keyof typeof STATUS_LABELS] || item.name,
		color: STATUS_COLORS[item.name as keyof typeof STATUS_COLORS] || "var(--color-gray-500)",
	}))

	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Distribución por Estado</CardTitle>
						<CardDescription>Total de charlas por estado actual</CardDescription>
					</div>
					<ChartBarIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="px-0">
				<ChartContainer config={{}} className="h-[250px] w-full">
					<BarChart data={formattedData} margin={{ bottom: 20, top: 10, right: 15 }}>
						<ChartTooltip content={<ChartTooltipContent />} />
						<CartesianGrid strokeDasharray="3 3" opacity={0.5} />
						<XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" />
						<YAxis />
						<Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]}>
							{formattedData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.color} />
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
