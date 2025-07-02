"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, TooltipProps } from "recharts"
import { ChartSplineIcon } from "lucide-react"

import { ChartContainer, ChartTooltip } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface UserDocumentActivityChartProps {
	data: Array<{
		name: string
		activity: Array<{
			date: string
			documents: number
		}>
	}>
}

interface ChartData {
	date: string
	documents: number
	userActivity: Array<{
		name: string
		documents: number
	}>
}

const CustomTooltip = ({
	active,
	payload,
	label,
}: TooltipProps<number, string> & { payload?: Array<{ value: number; payload: ChartData }> }) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-background rounded-lg border p-2 shadow-sm">
				<div className="grid gap-2">
					<p className="text-muted-foreground text-[0.70rem] uppercase">{label}</p>
					<div className="flex items-center justify-between gap-2">
						<span className="font-bold">{payload[0].value} documentos</span>
					</div>
					<div className="space-y-1">
						{payload[0].payload.userActivity.map((user: { name: string; documents: number }) => (
							<div key={user.name} className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">{user.name}</span>
								<span className="font-medium">{user.documents}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		)
	}

	return null
}

export function UserDocumentActivityChart({ data }: UserDocumentActivityChartProps) {
	const chartData = data.reduce(
		(acc, user) => {
			user.activity.forEach((day) => {
				const existingDay = acc.find((d) => d.date === day.date)
				if (existingDay) {
					existingDay.documents += day.documents
					existingDay.userActivity.push({
						name: user.name,
						documents: day.documents,
					})
				} else {
					acc.push({
						date: day.date,
						documents: day.documents,
						userActivity: [
							{
								name: user.name,
								documents: day.documents,
							},
						],
					})
				}
			})
			return acc
		},
		[] as Array<{
			date: string
			documents: number
			userActivity: Array<{ name: string; documents: number }>
		}>
	)

	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Actividad de Documentos</CardTitle>
						<CardDescription>
							Documentos creados por día por usuario en los últimos 30 días
						</CardDescription>
					</div>
					<ChartSplineIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="px-2 py-0">
				<ChartContainer config={{}} className="h-[250px] w-full max-w-[90dvw]">
					<AreaChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" opacity={0.5} />
						<XAxis
							dataKey="date"
							tick={{ fontSize: 12 }}
							tickLine={false}
							axisLine={false}
							interval={0}
							angle={-25}
							textAnchor="end"
							height={65}
						/>
						<YAxis
							allowDecimals={false}
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 12 }}
						/>
						<ChartTooltip content={<CustomTooltip />} />

						<defs>
							<linearGradient id="fillDocuments" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-violet-500)" stopOpacity={0.8} />
								<stop offset="95%" stopColor="var(--color-violet-500)" stopOpacity={0.1} />
							</linearGradient>
						</defs>

						<Area
							type="monotone"
							dataKey="documents"
							stroke="var(--color-violet-500)"
							strokeWidth={2}
							dot={false}
							name="Documentos"
							fill="url(#fillDocuments)"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
