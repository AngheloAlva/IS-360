"use client"

import { SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { CriticalityOptions } from "@/lib/consts/criticality"
import type { UnifiedTreeFilters } from "@/project/equipment/types/unified-tree"
import { useEffect, useState } from "react"

interface UnifiedTreeSearchBarProps {
  filters: UnifiedTreeFilters
  onFiltersChange: (filters: UnifiedTreeFilters) => void
  className?: string
}

export function UnifiedTreeSearchBar({ filters, onFiltersChange, className }: UnifiedTreeSearchBarProps) {
  const [localSearch, setLocalSearch] = useState(filters.search)
  const debouncedSearch = useDebounce(localSearch, 300)

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const hasActiveFilters =
    !!filters.search || !!filters.status || !!filters.criticality || !!filters.type

  const clearFilters = () => {
    setLocalSearch("")
    onFiltersChange({ search: "", status: undefined, criticality: undefined, type: undefined })
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar equipos o ubicaciones..."
            className="pl-8"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground shrink-0"
          >
            <XIcon className="mr-1 size-3.5" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status ?? "all"}
          onValueChange={(val) =>
            onFiltersChange({
              ...filters,
              status: val === "all" ? undefined : (val as UnifiedTreeFilters["status"]),
            })
          }
        >
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="operational">Operacional</SelectItem>
            <SelectItem value="non-operational">No operacional</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.criticality ?? "all"}
          onValueChange={(val) =>
            onFiltersChange({
              ...filters,
              criticality: val === "all" ? undefined : (val as UnifiedTreeFilters["criticality"]),
            })
          }
        >
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue placeholder="Criticalidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda criticalidad</SelectItem>
            {CriticalityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
