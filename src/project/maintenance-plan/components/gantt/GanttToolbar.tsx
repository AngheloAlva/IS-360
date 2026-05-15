"use client"

import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import {
	RANGE_OPTIONS,
	type RangeKey,
} from "@/project/maintenance-plan/hooks/use-maintenance-schedule"

import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"

interface GanttToolbarProps {
	startMonth: number
	startYear: number
	rangeKey: RangeKey
	onNavigate: (startMonth: number, startYear: number) => void
	onRangeChange: (key: RangeKey) => void
	onExport: () => void
	isExporting: boolean
}

export default function GanttToolbar({
	startMonth,
	startYear,
	rangeKey,
	onNavigate,
	onRangeChange,
	onExport,
	isExporting,
}: GanttToolbarProps) {
	const rangeMonths = RANGE_OPTIONS[rangeKey].months

	const handlePrev = () => {
		let newMonth = startMonth - rangeMonths
		let newYear = startYear
		while (newMonth < 1) {
			newMonth += 12
			newYear--
		}
		onNavigate(newMonth, newYear)
	}

	const handleNext = () => {
		let newMonth = startMonth + rangeMonths
		let newYear = startYear
		while (newMonth > 12) {
			newMonth -= 12
			newYear++
		}
		onNavigate(newMonth, newYear)
	}

	const handleToday = () => {
		const now = new Date()
		onNavigate(now.getMonth() + 1, now.getFullYear())
	}

	const getLabel = () => {
		const start = new Date(startYear, startMonth - 1, 1)
		if (rangeKey === "MONTHLY") {
			const label = format(start, "MMMM yyyy", { locale: es })
			return label.charAt(0).toUpperCase() + label.slice(1)
		}
		const endMonth = startMonth + rangeMonths - 1
		const endYear = endMonth > 12 ? startYear + 1 : startYear
		const endM = endMonth > 12 ? endMonth - 12 : endMonth
		const end = new Date(endYear, endM - 1, 1)

		const startLabel = format(start, "MMM yyyy", { locale: es })
		const endLabel = format(end, "MMM yyyy", { locale: es })
		return `${startLabel.charAt(0).toUpperCase() + startLabel.slice(1)} — ${endLabel.charAt(0).toUpperCase() + endLabel.slice(1)}`
	}

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon-sm" className="size-7" onClick={handlePrev}>
						<ChevronLeftIcon />
					</Button>
					<div className="bg-background flex h-7 items-center rounded-md p-0.5">
						<span className="min-w-42.5 px-2 text-center text-sm font-medium">{getLabel()}</span>
					</div>
					<Button variant="outline" size="icon-sm" className="size-7" onClick={handleNext}>
						<ChevronRightIcon />
					</Button>

					<Button variant="outline" onClick={handleToday}>
						Hoy
					</Button>
				</div>

				<div className="flex items-center gap-2">
					<div className="bg-background flex rounded-md p-0.5">
						{(Object.keys(RANGE_OPTIONS) as RangeKey[]).map((key) => (
							<Button
								key={key}
								size="sm"
								variant={rangeKey === key ? "default" : "ghost"}
								className="h-7 px-3 text-xs"
								onClick={() => onRangeChange(key)}
							>
								{RANGE_OPTIONS[key].label}
							</Button>
						))}
					</div>

					<Button onClick={onExport} disabled={isExporting} size="sm">
						{isExporting ? <Spinner className="size-4" /> : <DownloadIcon />}
						Exportar Excel
					</Button>
				</div>
			</div>

			<div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px]">
				<LegendDot color="bg-amber-400" label="Pendiente manual" />
				<LegendDot color="bg-cyan-400" label="Pendiente automática" />
				<LegendDot color="bg-blue-500" label="OT generada (en curso)" />
				<LegendDot color="bg-emerald-500" label="Completada" />
				<LegendDot color="bg-red-500" label="Atorada (OT previa sin cerrar)" pulsing />
				<span className="flex items-center gap-1.5">
					<span className="h-3 w-5 rounded bg-cyan-50 ring-1 ring-cyan-200 dark:bg-cyan-950/30 dark:ring-cyan-900" />
					Ventana de activación automática
				</span>
			</div>
		</div>
	)
}

function LegendDot({ color, label, pulsing }: { color: string; label: string; pulsing?: boolean }) {
	return (
		<span className="flex items-center gap-1.5">
			<span className={`size-2.5 rounded-full ${color} ${pulsing ? "animate-pulse" : ""}`} />
			{label}
		</span>
	)
}
