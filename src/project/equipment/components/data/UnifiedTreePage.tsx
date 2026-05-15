"use client"

import { useMemo, useState } from "react"

import { Card, CardContent } from "@/shared/components/ui/card"
import { buildUnifiedTree } from "@/project/equipment/utils/build-unified-tree"
import { filterUnifiedTree } from "@/project/equipment/utils/filter-unified-tree"
import { useUnifiedTreeData } from "@/project/equipment/hooks/use-unified-tree-data"
import {
  UnifiedTreePermissionsContext,
  type UnifiedTreePermissions,
} from "@/project/equipment/contexts/unified-tree-permissions-context"
import {
  UnifiedTreeSearchContext,
} from "@/project/equipment/contexts/unified-tree-search-context"
import { UnifiedTreeDndProvider } from "@/project/equipment/components/data/UnifiedTreeDndProvider"
import { UnifiedTreeNode } from "@/project/equipment/components/data/UnifiedTreeNode"
import { UnifiedTreeSearchBar } from "@/project/equipment/components/data/UnifiedTreeSearchBar"
import type { UnifiedTreeFilters } from "@/project/equipment/types/unified-tree"

interface UnifiedTreePageProps {
  permissions: UnifiedTreePermissions
}

export function UnifiedTreePage({ permissions }: UnifiedTreePageProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<UnifiedTreeFilters>({ search: "" })
  // Tracks IDs auto-expanded by search so clearing search doesn't collapse user-expanded nodes.
  const [searchExpandedIds, setSearchExpandedIds] = useState<Set<string>>(new Set())

  const { locations, equipmentMap, isLoading, isError } = useUnifiedTreeData(expanded)

  const locationTree = useMemo(
    () => buildUnifiedTree({ locations, equipmentMap }),
    [locations, equipmentMap]
  )

  const { tree: filteredTree, matchedIds } = useMemo(
    () => filterUnifiedTree(locationTree, filters),
    [locationTree, filters]
  )

  const handleToggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleAutoExpand = (id: string) => {
    setExpanded((prev) => {
      if (prev.has(id)) return prev
      return new Set([...prev, id])
    })
  }

  const handleFiltersChange = (next: UnifiedTreeFilters) => {
    const prevSearch = filters.search
    const nextSearch = next.search

    if (nextSearch !== prevSearch) {
      if (nextSearch) {
        const { autoExpandIds: nextAutoExpandIds } = filterUnifiedTree(locationTree, next)
        setSearchExpandedIds(nextAutoExpandIds)
        setExpanded((prev) => new Set([...prev, ...nextAutoExpandIds]))
      } else {
        setExpanded((prev) => {
          const cleared = new Set(prev)
          for (const id of searchExpandedIds) {
            cleared.delete(id)
          }
          return cleared
        })
        setSearchExpandedIds(new Set())
      }
    }

    setFilters(next)
  }

  const searchState = useMemo(
    () => ({ searchTerm: filters.search, matchedIds }),
    [filters.search, matchedIds]
  )

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-12 text-sm">
        Cargando ubicaciones...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-red-500">
        Error al cargar las ubicaciones. Intenta recargar la página.
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-12 text-sm">
        No hay ubicaciones cargadas
      </div>
    )
  }

  return (
    <UnifiedTreePermissionsContext.Provider value={permissions}>
      <UnifiedTreeSearchContext.Provider value={searchState}>
        <div className="flex flex-col gap-3">
          <Card>
            <CardContent className="p-4">
              <UnifiedTreeSearchBar filters={filters} onFiltersChange={handleFiltersChange} />
            </CardContent>
          </Card>

          <UnifiedTreeDndProvider
            locations={locations}
            equipmentMap={equipmentMap}
            expanded={expanded}
            onAutoExpand={handleAutoExpand}
          >
            <Card className="bg-background">
              <CardContent className="p-0">
                {filteredTree.length === 0 ? (
                  <div className="text-muted-foreground flex items-center justify-center py-8 text-sm">
                    Sin resultados para los filtros aplicados
                  </div>
                ) : (
                  <div className="py-1">
                    {filteredTree.map((node) => (
                      <UnifiedTreeNode
                        key={node.data.id}
                        node={node}
                        depth={0}
                        expanded={expanded}
                        onToggleExpand={handleToggleExpand}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </UnifiedTreeDndProvider>
        </div>
      </UnifiedTreeSearchContext.Provider>
    </UnifiedTreePermissionsContext.Provider>
  )
}
