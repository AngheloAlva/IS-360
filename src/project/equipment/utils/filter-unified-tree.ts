import type { UnifiedEquipmentNode, UnifiedLocationNode, UnifiedTreeFilters, UnifiedTreeNode } from "@/project/equipment/types/unified-tree"

interface FilterResult {
	tree: UnifiedTreeNode[]
	// IDs of nodes that should be auto-expanded because they contain matches
	autoExpandIds: Set<string>
	// IDs of nodes that directly matched search/filters (for highlight)
	matchedIds: Set<string>
}

function matchesEquipmentFilters(node: UnifiedEquipmentNode, filters: UnifiedTreeFilters): boolean {
	const { search, status, criticality, type } = filters

	if (search) {
		const term = search.toLowerCase()
		const nameMatch = node.data.name.toLowerCase().includes(term)
		const tagMatch = node.data.tag.toLowerCase().includes(term)
		if (!nameMatch && !tagMatch) return false
	}

	if (status === "operational" && !node.data.isOperational) return false
	if (status === "non-operational" && node.data.isOperational) return false
	if (criticality && node.data.criticality !== criticality) return false
	if (type && node.data.type !== type) return false

	return true
}

function filterEquipmentNode(
	node: UnifiedEquipmentNode,
	filters: UnifiedTreeFilters,
	autoExpandIds: Set<string>,
	matchedIds: Set<string>
): UnifiedEquipmentNode | null {
	const filteredChildren = node.children
		.map((child) => filterEquipmentNode(child, filters, autoExpandIds, matchedIds))
		.filter((c): c is UnifiedEquipmentNode => c !== null)

	const selfMatches = matchesEquipmentFilters(node, filters)

	if (selfMatches || filteredChildren.length > 0) {
		if (selfMatches) matchedIds.add(node.data.id)
		if (filteredChildren.length > 0) autoExpandIds.add(node.data.id)
		return { ...node, children: filteredChildren }
	}

	return null
}

function matchesLocationSearch(node: UnifiedLocationNode, search: string): boolean {
	if (!search) return false
	return node.data.path.toLowerCase().includes(search.toLowerCase())
}

function filterLocationNode(
	node: UnifiedLocationNode,
	filters: UnifiedTreeFilters,
	autoExpandIds: Set<string>,
	matchedIds: Set<string>
): UnifiedLocationNode | null {
	const filteredChildLocations = node.childLocations
		.map((child) => filterLocationNode(child, filters, autoExpandIds, matchedIds))
		.filter((c): c is UnifiedLocationNode => c !== null)

	const filteredEquipment = node.rootEquipment
		.map((eq) => filterEquipmentNode(eq, filters, autoExpandIds, matchedIds))
		.filter((e): e is UnifiedEquipmentNode => e !== null)

	const locationPathMatches = matchesLocationSearch(node, filters.search)
	const hasMatchingDescendants = filteredChildLocations.length > 0 || filteredEquipment.length > 0

	if (locationPathMatches || hasMatchingDescendants) {
		if (locationPathMatches) matchedIds.add(node.data.id)
		if (hasMatchingDescendants) autoExpandIds.add(node.data.id)
		return { ...node, childLocations: filteredChildLocations, rootEquipment: filteredEquipment }
	}

	return null
}

function isFilterEmpty(filters: UnifiedTreeFilters): boolean {
	return !filters.search && !filters.status && !filters.criticality && !filters.type
}

// When filters empty a subtree, hide it entirely (no "0 resultados" placeholder).
// Returns filtered tree + ancestor IDs to auto-expand + directly-matched node IDs for highlight.
export function filterUnifiedTree(tree: UnifiedTreeNode[], filters: UnifiedTreeFilters): FilterResult {
	if (isFilterEmpty(filters)) {
		return { tree, autoExpandIds: new Set(), matchedIds: new Set() }
	}

	const autoExpandIds = new Set<string>()
	const matchedIds = new Set<string>()

	const filtered = tree
		.map((node) => {
			if (node.kind === "location") {
				return filterLocationNode(node, filters, autoExpandIds, matchedIds)
			}
			return filterEquipmentNode(node, filters, autoExpandIds, matchedIds)
		})
		.filter((n): n is UnifiedTreeNode => n !== null)

	return { tree: filtered, autoExpandIds, matchedIds }
}
