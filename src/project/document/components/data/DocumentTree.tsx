"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { extractFilenameFromUrl, openDocumentSecurely } from "@/lib/view-document"
import { Areas } from "@/lib/consts/areas"
import { cn } from "@/lib/utils"

import { Files, Folder, File } from "@/shared/components/ui/files"
import { Skeleton } from "@/shared/components/ui/skeleton"

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
	folderId?: string
	className?: string
}

const TreeNodeItem = ({
	node,
	area,
	loadedNodes,
	loadingNodes,
	expandedNodes,
	toggleNode,
	setFileLoading,
	clearFileLoading,
	router,
}: {
	node: TreeNode
	area: string
	loadedNodes: Record<string, TreeNode[]>
	loadingNodes: Set<string>
	expandedNodes: Set<string>
	toggleNode: (nodeId: string) => void
	setFileLoading: (fileId: string) => void
	clearFileLoading: (fileId: string) => void
	router: ReturnType<typeof useRouter>
}) => {
	const childNodes = loadedNodes[node.id] || []
	const isExpanded = expandedNodes.has(node.id)
	const isLoading = loadingNodes.has(node.id)

	const handleFolderClick = () => {
		toggleNode(node.id)
	}

	const handleFolderDoubleClick = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (node.type === "folder" && node.slug) {
			router.push(`/admin/dashboard/documentacion/${area}/${node.slug + "_" + node.id}`)
		}
	}

	const handleFileClick = async () => {
		if (!node.url) return

		const filename = extractFilenameFromUrl(node.url)
		if (!filename) {
			toast.error("No se pudo determinar el nombre del archivo")
			return
		}

		setFileLoading(node.id)
		try {
			await openDocumentSecurely(filename, "documents")
		} finally {
			clearFileLoading(node.id)
		}
	}

	if (node.type === "folder") {
		return (
			<Folder
				key={node.id}
				name={node.name}
				defaultOpen={isExpanded ? [node.id] : []}
				onClick={handleFolderClick}
				onDoubleClick={handleFolderDoubleClick}
			>
				{isLoading ? (
					<div className="space-y-2 py-2">
						<Skeleton className="h-6 w-3/4" />
						<Skeleton className="h-6 w-3/4" />
						<Skeleton className="h-6 w-3/4" />
					</div>
				) : childNodes.length > 0 ? (
					<>
						{childNodes.map((childNode) => (
							<TreeNodeItem
								area={area}
								router={router}
								node={childNode}
								key={childNode.id}
								toggleNode={toggleNode}
								loadedNodes={loadedNodes}
								loadingNodes={loadingNodes}
								expandedNodes={expandedNodes}
								setFileLoading={setFileLoading}
								clearFileLoading={clearFileLoading}
							/>
						))}
					</>
				) : null}
			</Folder>
		)
	} else {
		// Para archivos, verificamos si están en estado de carga
		const isFileLoading = loadingNodes.has(node.id)

		if (isFileLoading) {
			return (
				<div key={node.id} className="flex items-center gap-2 py-1">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
					<span className="text-sm text-gray-600">{node.name}</span>
				</div>
			)
		}

		return (
			<File
				key={node.id}
				name={node.name}
				onClick={handleFileClick}
				className="cursor-pointer hover:underline"
			/>
		)
	}
}

const RenderTreeNodes = ({
	nodes,
	area,
	loadedNodes,
	loadingNodes,
	expandedNodes,
	toggleNode,
	setFileLoading,
	clearFileLoading,
	router,
}: {
	nodes: TreeNode[]
	area: string
	loadedNodes: Record<string, TreeNode[]>
	loadingNodes: Set<string>
	expandedNodes: Set<string>
	toggleNode: (nodeId: string) => void
	setFileLoading: (fileId: string) => void
	clearFileLoading: (fileId: string) => void
	router: ReturnType<typeof useRouter>
}) => {
	if (!nodes.length) return null

	return (
		<>
			{nodes.map((node) => (
				<TreeNodeItem
					key={node.id}
					node={node}
					area={area}
					loadedNodes={loadedNodes}
					loadingNodes={loadingNodes}
					expandedNodes={expandedNodes}
					toggleNode={toggleNode}
					setFileLoading={setFileLoading}
					clearFileLoading={clearFileLoading}
					router={router}
				/>
			))}
		</>
	)
}

const useFetchTreeData = (areaValue: string) => {
	const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
	const [loadedNodes, setLoadedNodes] = useState<Record<string, TreeNode[]>>({})
	const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set())

	const fetchNodeData = useCallback(
		async (nodeId: string | null) => {
			try {
				const response = await fetch(
					`/api/document-management/tree?area=${areaValue}${nodeId ? `&folderId=${nodeId}` : ""}`
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
		async (nodeId: string) => {
			setExpandedNodes((prev) => {
				const newExpanded = new Set(prev)
				if (prev.has(nodeId)) {
					newExpanded.delete(nodeId)
				} else {
					newExpanded.add(nodeId)
				}
				return newExpanded
			})

			// Luego cargamos los datos si es necesario (similar al archivo original)
			if (!loadedNodes[nodeId]) {
				setLoadingNodes((prev) => new Set([...prev, nodeId]))
				const { folders, files } = await fetchNodeData(nodeId)
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

	const setFileLoading = useCallback((fileId: string) => {
		setLoadingNodes((prev) => new Set([...prev, fileId]))
	}, [])

	const clearFileLoading = useCallback((fileId: string) => {
		setLoadingNodes((prev) => {
			const newLoading = new Set(prev)
			newLoading.delete(fileId)
			return newLoading
		})
	}, [])

	useEffect(() => {
		const initializeTree = async () => {
			const { folders, files } = await fetchNodeData(null)
			setLoadedNodes((prev) => ({ ...prev, root: [...folders, ...files] }))
		}

		initializeTree()
	}, [fetchNodeData])

	return { expandedNodes, loadedNodes, loadingNodes, toggleNode, setFileLoading, clearFileLoading }
}

export function DocumentTree({ area, className }: DocumentTreeProps) {
	const areaValue = Areas[area as keyof typeof Areas]?.value
	const { expandedNodes, loadedNodes, loadingNodes, toggleNode, setFileLoading, clearFileLoading } = useFetchTreeData(areaValue)

	const router = useRouter()

	const rootNodes = useMemo(() => loadedNodes.root || [], [loadedNodes.root])

	return (
		<div
			className={cn(
				"relative hidden h-full max-h-[88dvh] w-full overflow-y-auto border-r p-4 lg:block",
				className
			)}
		>
			<h2 className="truncate font-semibold">Ramificación de {area.split("-").join(" ")}</h2>
			<p className="text-muted-foreground mb-4 line-clamp-2 w-full max-w-64 truncate text-sm text-wrap">
				Click en una carpeta para expandirla, o doble click para ir a la carpeta
			</p>

			{!rootNodes.length && !loadedNodes.root ? (
				<div className="space-y-2 pt-2">
					<Skeleton className="h-6 w-3/4" />
					<Skeleton className="h-6 w-3/4" />
					<Skeleton className="h-6 w-3/4" />
				</div>
			) : rootNodes.length > 0 ? (
				<Files className="border-none">
					<RenderTreeNodes
						area={area}
						nodes={rootNodes}
						router={router}
						toggleNode={toggleNode}
						loadedNodes={loadedNodes}
						loadingNodes={loadingNodes}
						expandedNodes={expandedNodes}
						setFileLoading={setFileLoading}
						clearFileLoading={clearFileLoading}
					/>
				</Files>
			) : (
				<p className="text-text px-4">No hay carpetas ni archivos para mostrar</p>
			)}
		</div>
	)
}
