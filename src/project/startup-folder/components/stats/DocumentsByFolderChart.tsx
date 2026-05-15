"use client"

import { useState } from "react"
import { Bar, XAxis, YAxis, BarChart, CartesianGrid } from "recharts"
import { ChartColumnStackedIcon } from "lucide-react"

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
	ChartTooltipContent,
} from "@/shared/components/ui/chart"
import { StartupFolderStatus } from "@/generated/prisma/enums"

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

const STATUS_LABELS = {
	DRAFT: "Borrador",
	SUBMITTED: "Enviado",
	APPROVED: "Aprobado",
	REJECTED: "Rechazado",
	EXPIRED: "Vencido",
	TO_UPDATE: "A actualizar",
} as const

const STATUS_ORDER = ["DRAFT", "SUBMITTED", "REJECTED", "EXPIRED", "TO_UPDATE", "APPROVED"] as const

export function DocumentsByFolderChart({ data }: SubfoldersByTypeChartProps) {
	const [hoveredSeries, setHoveredSeries] = useState<string | null>(null)

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
					<div className="rounded-lg bg-emerald-500/10 p-1.5">
						<ChartColumnStackedIcon className="size-5 text-emerald-500" />
					</div>
				</div>
			</CardHeader>
			<CardContent className="max-w-[90dvw] items-center justify-center p-0">
				<div className="h-72 w-full">
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
							<CartesianGrid vertical={false} strokeDasharray="2 2" />
							<XAxis
								dataKey="name"
								tickLine={false}
								axisLine={false}
								tickFormatter={(value: string) =>
									value.length > 16 ? `${value.slice(0, 16)}...` : value
								}
							/>
							<YAxis tickLine={false} axisLine={false} />
							<ChartTooltip
								content={
									<ChartTooltipContent
										labelFormatter={(label) => `Carpeta: ${label}`}
										formatter={(value, name, item) => {
											const statusKey = name as keyof typeof STATUS_LABELS
											const itemLabel = STATUS_LABELS[statusKey] ?? name
											const payloadRow = item.payload as Record<string, number | string | undefined>
											const folderTotal = STATUS_ORDER.reduce(
												(sum, key) => sum + Number(payloadRow[key] ?? 0),
												0
											)
											const numericValue = Number(value ?? 0)
											const percentage = folderTotal === 0 ? 0 : (numericValue / folderTotal) * 100

											return (
												<div className="flex w-full items-center justify-between gap-3">
													<span className="text-muted-foreground">{itemLabel}</span>
													<span className="font-mono font-semibold tabular-nums">
														{numericValue.toLocaleString("es-CL")} ({percentage.toFixed(1)}%)
													</span>
												</div>
											)
										}}
									/>
								}
							/>
							<ChartLegend
								content={({ payload }) => {
									if (!payload?.length) return null

									return (
										<div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-3">
											{payload
												.filter((entry) => entry.type !== "none")
												.map((entry) => {
													const key = String(entry.dataKey)
													const itemLabel = STATUS_LABELS[key as keyof typeof STATUS_LABELS] ?? key

													return (
														<button
															type="button"
															key={key}
															className="flex items-center gap-2 text-xs transition-opacity"
															style={{ opacity: hoveredSeries && hoveredSeries !== key ? 0.35 : 1 }}
															onMouseEnter={() => setHoveredSeries(key)}
															onMouseLeave={() => setHoveredSeries(null)}
														>
															<span
																className="h-2.5 w-2.5 rounded-[2px]"
																style={{ backgroundColor: entry.color }}
															/>
															{itemLabel}
														</button>
													)
												})}
										</div>
									)
								}}
							/>

							{STATUS_ORDER.map((status, index) => (
								<Bar
									key={status}
									dataKey={status}
									stackId="a"
									fill={COLORS[status]}
									shape={
										<CustomDuotoneBarMultiple hoveredSeries={hoveredSeries} docStatus={status} />
									}
									onMouseEnter={() => setHoveredSeries(status)}
									onMouseLeave={() => setHoveredSeries(null)}
								/>
							))}
						</BarChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}

const CustomDuotoneBarMultiple = (
	props: React.SVGProps<SVGRectElement> & {
		dataKey?: string
		hoveredSeries: string | null
		docStatus: Omit<StartupFolderStatus, "DRAFT">
	}
) => {
	const { fill, x, y, width, height, dataKey, hoveredSeries, docStatus } = props

	return (
		<>
			<rect
				rx={4}
				x={x}
				y={y}
				width={width}
				height={height}
				stroke="none"
				className="transition-all duration-300"
				fill={`url(#duotone-bar-pattern-${dataKey})`}
				fillOpacity={hoveredSeries && hoveredSeries !== docStatus ? 0.2 : 1}
			/>
			<defs>
				<linearGradient
					key={dataKey}
					id={`duotone-bar-pattern-${dataKey}`}
					x1="0"
					y1="0"
					x2="1"
					y2="0"
				>
					<stop offset="50%" stopColor={fill} stopOpacity={0.8} />
					<stop offset="50%" stopColor={fill} />
				</linearGradient>
			</defs>
		</>
	)
}
