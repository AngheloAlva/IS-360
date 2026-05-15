import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { FileText } from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"
import {
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"

import type { WorkRequestsAreaChartItem } from "@/project/home/hooks/use-homepage-stats"

interface WorkRequestsAreaChartProps {
	data: WorkRequestsAreaChartItem[]
	isLoading: boolean
}

export function WorkRequestsAreaChart({ data, isLoading }: WorkRequestsAreaChartProps) {
	if (isLoading) {
		return <WorkRequestsAreaChartSkeleton />
	}

	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Solicitudes de Trabajo</CardTitle>
					<CardDescription>Solicitudes creadas por urgencia - últimos 3 meses</CardDescription>
				</div>
				<FileText className="text-muted-foreground h-4 w-4" />
			</CardHeader>
			<CardContent className="py-0 pl-2">
				<div className="h-[350px] w-full max-w-[90dvw]">
					<ChartContainer
						config={{
							urgente: {
								label: "Urgente",
								color: "var(--color-red-500)",
							},
							noUrgente: {
								label: "No Urgente",
								color: "var(--color-cyan-500)",
							},
						}}
						className="h-[350px] w-full max-w-[90dvw]"
					>
						<AreaChart data={data}>
							<ChartTooltip
								content={
									<ChartTooltipContent
										formatter={(value, name) => [
											`${value} solicitudes`,
											name === "urgente" ? "Urgente" : "No Urgente",
										]}
									/>
								}
							/>

							<CartesianGrid strokeDasharray="3 3" opacity={0.5} />
							<XAxis dataKey="month" />
							<YAxis />

							<ChartLegend className="flex-wrap" content={<ChartLegendContent />} />
							<defs>
								<linearGradient id="fillUrgente" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-red-500)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-red-500)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillNoUrgente" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-cyan-500)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-cyan-500)" stopOpacity={0.1} />
								</linearGradient>
							</defs>

							<Area
								type="monotone"
								dataKey="urgente"
								stroke="var(--color-red-500)"
								fill="url(#fillUrgente)"
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="noUrgente"
								stroke="var(--color-cyan-500)"
								fill="url(#fillNoUrgente)"
								strokeWidth={2}
							/>
						</AreaChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}

function WorkRequestsAreaChartSkeleton() {
	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<Skeleton className="mb-2 h-6 w-48" />
					<Skeleton className="h-4 w-36" />
				</div>
				<Skeleton className="h-4 w-4 rounded" />
			</CardHeader>
			<CardContent>
				<div className="h-[350px] w-full max-w-[90dvw]">
					<Skeleton className="h-full w-full rounded" />
				</div>
			</CardContent>
		</Card>
	)
}
