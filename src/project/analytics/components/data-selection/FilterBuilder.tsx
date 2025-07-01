"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
// Definimos una interfaz para representar la estructura de tablas y campos
interface TableField {
  id: string
  displayName: string
  type: string
  // Otros campos que puedan existir
}

interface TableInfo {
  id: string
  displayName: string
  fields: TableField[]
  // Otros campos que puedan existir
}
import { FilterCondition } from "../../hooks/useDynamicQuery"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Input } from "@/shared/components/ui/input"

interface FilterBuilderProps {
  tables: TableInfo[] 
  selectedFields: Record<string, string[]>
  filters: FilterCondition[]
  onFilterChange: (filters: FilterCondition[]) => void
}

// Utilizamos FilterCondition importado del hook useDynamicQuery
// Agregamos campos internos para gestionar los filtros en la UI
interface InternalFilterCondition {
  id: string
  tableId: string
  fieldId: string
  table: string
  field: string
  operator: string
  value: string | number | boolean | null
}

// Operadores disponibles según el tipo de campo
const OPERATORS: Record<string, { label: string; value: string }[]> = {
  string: [
    { label: "Contiene", value: "contains" },
    { label: "Es igual a", value: "equals" },
    { label: "Comienza con", value: "startsWith" },
    { label: "Termina con", value: "endsWith" },
  ],
  number: [
    { label: "Es igual a", value: "equals" },
    { label: "Mayor que", value: "gt" },
    { label: "Mayor o igual que", value: "gte" },
    { label: "Menor que", value: "lt" },
    { label: "Menor o igual que", value: "lte" },
  ],
  date: [
    { label: "Es igual a", value: "equals" },
    { label: "Después de", value: "gt" },
    { label: "En o después de", value: "gte" },
    { label: "Antes de", value: "lt" },
    { label: "En o antes de", value: "lte" },
  ],
  boolean: [
    { label: "Es verdadero", value: "equals-true" },
    { label: "Es falso", value: "equals-false" },
  ],
  enum: [
    { label: "Es igual a", value: "equals" },
    { label: "No es igual a", value: "not" },
  ],
}

export function FilterBuilder({
  tables,
  selectedFields,
  filters,
  onFilterChange,
}: FilterBuilderProps) {
  const [newFilter, setNewFilter] = useState<Partial<InternalFilterCondition>>({})

  // Obtener todas las tablas que tienen campos seleccionados
  const availableTables = tables.filter((table) => 
    selectedFields[table.id] && selectedFields[table.id].length > 0
  )

  // Obtener los campos disponibles para la tabla seleccionada
  const getAvailableFields = (tableId?: string) => {
    if (!tableId) return []
    
    const table = tables.find(t => t.id === tableId)
    if (!table) return []
    
    return table.fields.filter((field) => 
      selectedFields[tableId]?.includes(field.id)
    )
  }

  const getFieldType = (tableId?: string, fieldId?: string) => {
    if (!tableId || !fieldId) return "string"
    
    const table = tables.find((t): t is TableInfo => t.id === tableId)
    if (!table) return "string"
    
    const field = table.fields.find((f): f is TableField => f.id === fieldId)
    return field?.type || "string"
  }

  const handleAddFilter = () => {
    if (!newFilter.tableId || !newFilter.fieldId || !newFilter.operator) return
    
    // Crear filtro interno para UI
    const internalFilter: InternalFilterCondition = {
      id: `filter-${Date.now()}`,
      table: newFilter.tableId,
      tableId: newFilter.tableId,
      field: newFilter.fieldId,
      fieldId: newFilter.fieldId,
      operator: newFilter.operator,
      value: newFilter.value || "",
    }
    
    // Convertir a formato API
    const apiFilter: FilterCondition = {
      table: internalFilter.tableId,
      field: internalFilter.fieldId,
      operator: internalFilter.operator,
      value: internalFilter.value
    }
    
    onFilterChange([...filters, apiFilter])
    setNewFilter({})
  }

  const handleRemoveFilter = (index: number) => {
    const newFilters = [...filters]
    newFilters.splice(index, 1)
    onFilterChange(newFilters)
  }

  // Encontrar el nombre para mostrar de una tabla o campo
  const getDisplayName = (tableId: string, fieldId?: string) => {
    const table = tables.find((t): t is TableInfo => t.id === tableId)
    if (!table) return tableId
    
    if (fieldId) {
      const field = table.fields.find((f): f is TableField => f.id === fieldId)
      return field?.displayName || fieldId
    }
    
    return table.displayName
  }

  const renderValueInput = () => {
    if (!newFilter.tableId || !newFilter.fieldId) return null
    
    const fieldType = getFieldType(newFilter.tableId, newFilter.fieldId)
    const selectedOperator = newFilter.operator || ""
    
    // Si el operador es equals-true o equals-false no necesitamos valor adicional
    if (selectedOperator === "equals-true" || selectedOperator === "equals-false") {
      return null
    }
    
    // Renderizar el input adecuado según el tipo de campo
    switch (fieldType) {
      case "number":
        return (
          <Input
            type="number"
            value={typeof newFilter.value === "number" ? newFilter.value : ""}
            onChange={(e) => setNewFilter({ 
              ...newFilter, 
              value: !isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : null
            })}
            className="w-full mt-2"
            placeholder="Valor numérico"
          />
        )
      case "boolean":
        return (
          <Select
            value={typeof newFilter.value === "boolean" ? (newFilter.value ? "true" : "false") : ""}
            onValueChange={(value) => setNewFilter({
              ...newFilter,
              value: value === "true"
            })}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Valor booleano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Verdadero</SelectItem>
              <SelectItem value="false">Falso</SelectItem>
            </SelectContent>
          </Select>
        )
      default: // string y otros tipos
        return (
          <Input
            type="text"
            value={typeof newFilter.value === "string" ? newFilter.value : ""}
            onChange={(e) => setNewFilter({ 
              ...newFilter, 
              value: e.target.value 
            })}
            className="w-full mt-2"
            placeholder="Valor"
          />
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-2 border rounded-md space-y-3">
        <p className="font-medium text-sm">Agregar nuevo filtro</p>
        
        <div className="grid grid-cols-1 gap-2">
          <Select
            value={newFilter.tableId}
            onValueChange={(value) => setNewFilter({ ...newFilter, tableId: value, fieldId: undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tabla" />
            </SelectTrigger>
            <SelectContent>
              {availableTables.map((table) => (
                <SelectItem key={table.id} value={table.id}>
                  {table.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={newFilter.fieldId}
            onValueChange={(value) => setNewFilter({ ...newFilter, fieldId: value })}
            disabled={!newFilter.tableId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar campo" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableFields(newFilter.tableId).map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={newFilter.operator}
            onValueChange={(value) => setNewFilter({ ...newFilter, operator: value })}
            disabled={!newFilter.fieldId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar operador" />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS[getFieldType(newFilter.tableId, newFilter.fieldId)].map(op => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {newFilter.operator && newFilter.operator !== "equals-true" && newFilter.operator !== "equals-false" && (
            renderValueInput()
          )}

          <Button 
            onClick={handleAddFilter}
            disabled={!newFilter.tableId || !newFilter.fieldId || !newFilter.operator}
            className="w-full mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar filtro
          </Button>
        </div>
      </div>
      
      {filters.length > 0 && (
        <div className="border rounded-md p-2">
          <p className="font-medium text-sm mb-2">Filtros aplicados</p>
          
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                <div className="text-sm">
                  <span className="font-medium">
                    {getDisplayName(filter.table, filter.field)}
                  </span>
                  <span className="mx-1 text-muted-foreground">
                    {OPERATORS[getFieldType(filter.table, filter.field)]
                      .find(op => op.value === filter.operator)?.label || filter.operator}
                  </span>
                  {filter.operator !== "equals-true" && filter.operator !== "equals-false" && (
                    <span className="font-medium">{filter.value !== null ? String(filter.value) : ""}</span>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveFilter(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {filters.length === 0 && (
        <div className="p-4 border rounded-md text-center text-muted-foreground">
          No hay filtros aplicados. Los datos se mostrarán sin filtrar.
        </div>
      )}
    </div>
  )
}
