import type {
	ScheduleLocation,
	ScheduleTask,
} from "@/project/maintenance-plan/hooks/use-maintenance-schedule"

export interface LocationTreeNode {
	id: string
	name: string
	depth: number
	tasks: ScheduleTask[]
	children: LocationTreeNode[]
	subtreeTaskCount: number
	isSentinel: boolean
}

interface BuildParams {
	locations: ScheduleLocation[]
	tasksByLocationId: Record<string, ScheduleTask[]>
}

const NO_LOCATION_ID = "__no_location__"

function buildNode(
	loc: ScheduleLocation,
	childrenByParent: Map<string | null, ScheduleLocation[]>,
	tasksByLocationId: Record<string, ScheduleTask[]>,
	depth: number
): LocationTreeNode {
	const tasks = tasksByLocationId[loc.id] ?? []
	const children = (childrenByParent.get(loc.id) ?? [])
		.slice()
		.sort((a, b) => a.name.localeCompare(b.name, "es"))
		.map((child) => buildNode(child, childrenByParent, tasksByLocationId, depth + 1))

	const subtreeTaskCount =
		tasks.length + children.reduce((sum, c) => sum + c.subtreeTaskCount, 0)

	return {
		id: loc.id,
		name: loc.name,
		depth,
		tasks,
		children,
		subtreeTaskCount,
		isSentinel: loc.id === NO_LOCATION_ID,
	}
}

// Hides nodes whose entire subtree has zero tasks (defensive — API should already prune them)
function pruneEmpty(node: LocationTreeNode): LocationTreeNode | null {
	if (node.subtreeTaskCount === 0) return null
	const prunedChildren = node.children
		.map(pruneEmpty)
		.filter((c): c is LocationTreeNode => c !== null)
	return { ...node, children: prunedChildren }
}

export function buildLocationTree({
	locations,
	tasksByLocationId,
}: BuildParams): LocationTreeNode[] {
	const childrenByParent = new Map<string | null, ScheduleLocation[]>()
	for (const loc of locations) {
		const key = loc.parentId
		if (!childrenByParent.has(key)) childrenByParent.set(key, [])
		childrenByParent.get(key)!.push(loc)
	}

	const roots = (childrenByParent.get(null) ?? [])
		.slice()
		.sort((a, b) => {
			// Real locations first, sentinel last
			if (a.id === NO_LOCATION_ID) return 1
			if (b.id === NO_LOCATION_ID) return -1
			return a.name.localeCompare(b.name, "es")
		})
		.map((loc) => buildNode(loc, childrenByParent, tasksByLocationId, 0))

	return roots
		.map(pruneEmpty)
		.filter((n): n is LocationTreeNode => n !== null)
}

// Flatten the tree depth-first for exports — preserves visual order, exposes path string
export interface FlatGroup {
	location: string
	tasks: ScheduleTask[]
}

export function flattenTreeForExport(tree: LocationTreeNode[]): FlatGroup[] {
	const out: FlatGroup[] = []
	const walk = (node: LocationTreeNode, ancestorNames: string[]) => {
		const pathNames = [...ancestorNames, node.name]
		if (node.tasks.length > 0) {
			out.push({ location: pathNames.join(" / "), tasks: node.tasks })
		}
		for (const child of node.children) walk(child, pathNames)
	}
	for (const root of tree) walk(root, [])
	return out
}
