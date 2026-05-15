import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { fetchAllEquipments } from "./use-equipments"
import type { TreeSelectNode } from "@/shared/components/forms/TreeSelect"

// ─── Tree builder (pure) ──────────────────────────────────────────────────────

interface EquipmentFlat {
	id: string
	name: string
	tag: string | null
	location: { id: string; name: string; path: string }
	parentId: string | null
}

function buildTree(flat: EquipmentFlat[]): TreeSelectNode[] {
	const byId = new Map<string, TreeSelectNode>()
	const roots: TreeSelectNode[] = []

	// First pass: create all node objects
	for (const eq of flat) {
		byId.set(eq.id, {
			value: eq.id,
			label: eq.name,
			tag: eq.tag,
			location: eq.location?.path ?? null,
			children: [],
		})
	}

	// Second pass: wire parent-child or push to roots
	for (const eq of flat) {
		const node = byId.get(eq.id)!
		if (eq.parentId && byId.has(eq.parentId)) {
			byId.get(eq.parentId)!.children!.push(node)
		} else {
			// Orphaned nodes (parentId pointing to non-existent id) become roots
			roots.push(node)
		}
	}

	return roots
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useEquipmentTreeNodes() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["equipment-tree-nodes"],
		queryFn: () => fetchAllEquipments(null, true),
		staleTime: 10 * 60 * 1000,
	})

	const nodes = useMemo(() => buildTree(data ?? []), [data])

	return { nodes, isLoading, error }
}
