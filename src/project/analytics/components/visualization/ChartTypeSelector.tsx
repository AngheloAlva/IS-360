"use client"

import { BarChartIcon, PieChartIcon, LineChartIcon, ActivityIcon, TableIcon } from "lucide-react"
import { Toggle } from "@/shared/components/ui/toggle"

type ChartType = "bar" | "pie" | "line" | "area" | "table"

interface ChartTypeSelectorProps {
  chartType: ChartType
  onChartTypeChange: (type: ChartType) => void
}

interface ChartTypeOption {
  type: ChartType
  label: string
  icon: React.ReactNode
}

export function ChartTypeSelector({
  chartType,
  onChartTypeChange,
}: ChartTypeSelectorProps) {
  const chartOptions: ChartTypeOption[] = [
    {
      type: "table",
      label: "Tabla",
      icon: <TableIcon className="h-4 w-4" />
    },
    {
      type: "bar",
      label: "Barras",
      icon: <BarChartIcon className="h-4 w-4" />
    },
    {
      type: "pie",
      label: "Circular",
      icon: <PieChartIcon className="h-4 w-4" />
    },
    {
      type: "line",
      label: "Líneas",
      icon: <LineChartIcon className="h-4 w-4" />
    },
    {
      type: "area",
      label: "Área",
      icon: <ActivityIcon className="h-4 w-4" />
    },
  ]

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md bg-background">
      {chartOptions.map((option) => (
        <Toggle
          key={option.type}
          variant="outline"
          size="sm"
          pressed={chartType === option.type}
          onPressedChange={() => onChartTypeChange(option.type)}
          aria-label={`Cambiar a ${option.label}`}
        >
          <div className="flex items-center gap-1">
            {option.icon}
            <span>{option.label}</span>
          </div>
        </Toggle>
      ))}
    </div>
  )
}
