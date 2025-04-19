"use client"

import { ChevronRight, ChevronDown, Folder, File, FolderOpen } from "lucide-react"
import { useCallback, useMemo, memo, useState, useEffect } from "react"
import Link from "next/link"

import { Areas } from "@/lib/consts/areas"
import { cn } from "@/lib/utils"

import { Skeleton } from "@/components/ui/skeleton"

type TreeNode = {
	id: string
	name: string
	url?: string
	slug?: string
	hasChildren?: boolean
	type: "file" | "folder"
}

type DocumentTreeProps = {
	area: string
	className?: string
}

const TreeNode = memo(function TreeNode({
	node,
	level,
	nodes,
	expandedNodes,
	loadingNodes,
	loadedNodes,
	onToggle,
}: {
	node: TreeNode
	level: number
	nodes: TreeNode[]
	expandedNodes: Set<string>
	loadingNodes: Set<string>
	loadedNodes: Record<string, TreeNode[]>
	onToggle: (nodeId: string, slug?: string) => void
}) {
	const handleToggle = useCallback(() => {
		if (node.type === "folder") {
			onToggle(node.id, node.slug)
		}
	}, [node, onToggle])

	return (
		<div>
			<div
				className={cn(
					"hover:bg-accent/50 flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm",
					"transition-colors duration-200",
					{
						"ml-4": level === 0,
						"ml-8": level === 1,
						"ml-12": level === 2,
						"ml-16": level === 3,
						"ml-20": level === 4,
						"ml-24": level === 5,
						"ml-28": level === 6,
						"ml-32": level > 6,
					}
				)}
				onClick={handleToggle}
			>
				{node.type === "folder" && (
					<div className="flex h-5 w-5 items-center justify-center">
						{node.hasChildren &&
							(expandedNodes.has(node.id) ? (
								<ChevronDown className="h-5 w-5" />
							) : (
								<ChevronRight className="h-5 w-5" />
							))}
					</div>
				)}

				{node.type === "folder" ? (
					!expandedNodes.has(node.id) ? (
						<Folder className="h-5 min-h-5 w-5 min-w-5 text-blue-500" />
					) : (
						<FolderOpen className="h-5 min-h-5 w-5 min-w-5 text-blue-800" />
					)
				) : (
					<File className="ml-5 h-5 min-h-5 w-5 min-w-5 text-sky-500" />
				)}

				<span className="truncate text-base font-semibold">
					{node.type === "file" && node.url ? (
						<Link
							target="_blank"
							href={node.url || "#"}
							rel="noopener noreferrer"
							className="hover:underline"
							onClick={(e) => e.stopPropagation()}
						>
							{node.name}
						</Link>
					) : (
						node.name
					)}
				</span>
			</div>

			{expandedNodes.has(node.id) && (
				<div className="space-y-1">
					{loadingNodes.has(node.id) && (
						<div className="space-y-2 pt-2 pl-8">
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-6 w-3/4" />
						</div>
					)}
					{nodes.length > 0 && (
						<div className="space-y-1">
							{nodes.map((child) => (
								<TreeNode
									key={child.id}
									node={child}
									level={level + 1}
									nodes={loadedNodes[child.id] || []}
									expandedNodes={expandedNodes}
									loadingNodes={loadingNodes}
									loadedNodes={loadedNodes}
									onToggle={onToggle}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	)
})

const useFetchTreeData = (areaValue: string) => {
	const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
	const [loadedNodes, setLoadedNodes] = useState<Record<string, TreeNode[]>>({})
	const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set())

	const fetchNodeData = useCallback(
		async (nodeId: string, slug?: string | null) => {
			try {
				const response = await fetch(
					`/api/document-management/tree?area=${areaValue}${slug ? `&folderSlug=${slug}` : ""}`
				)
				if (!response.ok) throw new Error("Error fetching node data")
				const data = await response.json()

				if (!data || typeof data !== "object") throw new Error("Invalid response format")

				return {
					folders: Array.isArray(data.folders) ? data.folders : [],
					files: Array.isArray(data.files) ? data.files : [],
				}
			} catch (error) {
				console.error(`Error fetching node data: ${error}`)
				return { folders: [], files: [] }
			}
		},
		[areaValue]
	)

	const toggleNode = useCallback(
		async (nodeId: string, slug?: string) => {
			setExpandedNodes((prev) => {
				const newExpanded = new Set(prev)
				if (prev.has(nodeId)) {
					newExpanded.delete(nodeId)
				} else {
					newExpanded.add(nodeId)
				}
				return newExpanded
			})

			if (!loadedNodes[nodeId]) {
				setLoadingNodes((prev) => new Set([...prev, nodeId]))
				const { folders, files } = await fetchNodeData(nodeId, slug)
				setLoadedNodes((prev) => ({ ...prev, [nodeId]: [...folders, ...files] }))
				setLoadingNodes((prev) => {
					const newLoading = new Set(prev)
					newLoading.delete(nodeId)
					return newLoading
				})
			}
		},
		[loadedNodes, fetchNodeData]
	)

	useEffect(() => {
		const initializeTree = async () => {
			const { folders, files } = await fetchNodeData("root", null)
			setLoadedNodes((prev) => ({ ...prev, root: [...folders, ...files] }))
		}

		initializeTree()
	}, [fetchNodeData])

	return { expandedNodes, loadedNodes, loadingNodes, toggleNode }
}

export function DocumentTree({ area, className }: DocumentTreeProps) {
	const areaValue = Areas[area as keyof typeof Areas]?.value
	const { expandedNodes, loadedNodes, loadingNodes, toggleNode } = useFetchTreeData(areaValue)

	const rootNodes = useMemo(() => loadedNodes.root || [], [loadedNodes.root])

	return (
		<div
			className={cn(
				"relative hidden h-full max-h-[88dvh] w-full overflow-y-scroll border-r lg:block",
				className
			)}
		>
			{!rootNodes.length && !loadedNodes.root ? (
				<div className="space-y-2 pt-2 pl-8">
					<Skeleton className="h-6 w-3/4" />
					<Skeleton className="h-6 w-3/4" />
					<Skeleton className="h-6 w-3/4" />
				</div>
			) : rootNodes.length > 0 ? (
				<div className="space-y-1 pr-2">
					{rootNodes.map((node) => (
						<TreeNode
							key={node.id}
							node={node}
							level={0}
							nodes={loadedNodes[node.id] || []}
							expandedNodes={expandedNodes}
							loadingNodes={loadingNodes}
							loadedNodes={loadedNodes}
							onToggle={toggleNode}
						/>
					))}
				</div>
			) : (
				<p className="text-text px-4">No hay carpetas ni archivos para mostrar</p>
			)}
		</div>
	)
}
