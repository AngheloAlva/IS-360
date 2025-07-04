"use client"

import { FileSpreadsheetIcon, RefreshCcw } from "lucide-react"
import { toast } from "sonner"

import { fetchAllEquipments, WorkEquipment } from "@/project/equipment/hooks/use-equipments"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import Spinner from "@/shared/components/Spinner"
import {
  Select,
  SelectItem,
  SelectGroup,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/shared/components/ui/select"
import { useState } from "react"

interface EquipmentFiltersProps {
  search: string
  showAll: boolean
  onSearchChange: (value: string) => void
  onShowAllChange: (value: boolean) => void
  refetch: () => void
  isFetching: boolean
}

export default function EquipmentFilters({
  search,
  showAll,
  onSearchChange,
  onShowAllChange,
  refetch,
  isFetching
}: EquipmentFiltersProps) {
  const [exportLoading, setExportLoading] = useState<boolean>(false)

  const handleExportToExcel = async () => {
    try {
      setExportLoading(true)
      const equipments = await fetchAllEquipments(null)
      if (!equipments?.length) {
        toast.error("No hay equipos para exportar")
        return
      }

      const XLSX = await import("xlsx")

      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(
        equipments.map((equipment: WorkEquipment) => ({
          "TAG": equipment.tag,
          "Nombre": equipment.name,
          "Ubicación": equipment.location,
          "Descripción": equipment.description,
          "Estado": equipment.isOperational ? "Operativo" : "No Operativo",
          "Tipo": equipment.type || "N/A",
          "Órdenes de Trabajo": equipment._count.workOrders,
          "Equipos Hijos": equipment._count.children,
          "Fecha de Creación": new Date(equipment.createdAt).toLocaleDateString(),
          "Última Actualización": new Date(equipment.updatedAt).toLocaleDateString(),
        }))
      )

      XLSX.utils.book_append_sheet(workbook, worksheet, "Equipos")
      XLSX.writeFile(workbook, "equipos.xlsx")
      toast.success("Equipos exportados exitosamente")
    } catch (error) {
      console.error("[EXPORT_EXCEL]", error)
      toast.error("Error al exportar equipos")
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-emerald-700">Filtros</h2>
        
        <Button
          onClick={handleExportToExcel}
          disabled={exportLoading}
          variant="outline"
          size="sm"
          className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
        >
          {exportLoading ? <Spinner /> : <FileSpreadsheetIcon className="mr-2 h-4 w-4" />}
          Exportar
        </Button>
      </div>

      <div className="space-y-3">
        <Input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-background w-full"
          placeholder="Buscar por nombre, TAG o ubicación..."
        />

        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => onShowAllChange(value === "true")}
            value={showAll ? "true" : "false"}
          >
            <SelectTrigger className="border-input bg-background w-full border">
              <SelectValue placeholder="Mostrar todos los equipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="true">Todos los equipos</SelectItem>
                <SelectItem value="false">Equipos padres</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button 
            onClick={() => refetch()} 
            disabled={isFetching} 
            variant="outline" 
            size="icon"
            className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          >
            {isFetching ? <Spinner /> : <RefreshCcw className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
