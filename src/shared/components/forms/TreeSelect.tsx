"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Button } from "@/shared/components/ui/button"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
	Command,
	CommandList,
	CommandItem,
	CommandEmpty,
	CommandGroup,
	CommandInput,
} from "@/shared/components/ui/command"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TreeSelectNode {
	value: string
	label: string
	tag?: string | null
	location?: string | null
	children?: TreeSelectNode[]
}

interface FlatNode {
	value: string
	label: string
	tag?: string | null
	location?: string | null
	depth: number
	pathLabels: string[]
	searchText: string
}

type BaseProps = {
	nodes: TreeSelectNode[]
	placeholder?: string
	disabled?: boolean
	className?: string
	isLoading?: boolean
}

type SingleProps = BaseProps & {
	mode?: "single"
	value: string | null
	onChange: (value: string | null) => void
}

type MultipleProps = BaseProps & {
	mode: "multiple"
	value: string[]
	onChange: (value: string[]) => void
}

export type TreeSelectProps = SingleProps | MultipleProps

// ─── flattenTree (pure) ───────────────────────────────────────────────────────

function flattenTree(nodes: TreeSelectNode[]): FlatNode[] {
	const result: FlatNode[] = []

	function dfs(nodeList: TreeSelectNode[], depth: number, pathLabels: string[]) {
		for (const node of nodeList) {
			const searchText = [node.label, node.tag ?? "", node.location ?? "", ...pathLabels]
				.filter(Boolean)
				.join(" ")
				.toLowerCase()

			result.push({
				value: node.value,
				label: node.label,
				tag: node.tag,
				location: node.location,
				depth,
				pathLabels,
				searchText,
			})

			if (node.children?.length) {
				dfs(node.children, depth + 1, [...pathLabels, node.label])
			}
		}
	}

	dfs(nodes, 0, [])
	return result
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TreeSelect(props: TreeSelectProps) {
	const { nodes, placeholder, disabled, className, isLoading } = props

	const [open, setOpen] = useState(false)

	const flatNodes = useMemo(() => flattenTree(nodes), [nodes])

	function isSelected(id: string): boolean {
		if (props.mode === "multiple") return props.value.includes(id)
		return props.value === id
	}

	function handleSelect(id: string) {
		if (props.mode === "multiple") {
			const next = props.value.includes(id)
				? props.value.filter((v) => v !== id)
				: [...props.value, id]
			props.onChange(next)
			// popover stays open
		} else {
			props.onChange(props.value === id ? null : id)
			setOpen(false)
		}
	}

	function renderTriggerLabel(): string {
		if (props.mode === "multiple") {
			if (!props.value.length) return placeholder ?? "Seleccionar"
			if (props.value.length === 1) {
				const node = flatNodes.find((n) => n.value === props.value[0])
				return node?.label ?? "1 seleccionado"
			}
			return `${props.value.length} seleccionados`
		}
		// single
		if (!props.value) return placeholder ?? "Seleccionar"
		const node = flatNodes.find((n) => n.value === props.value)
		return node
			? `${node.label}${node.tag ? ` (${node.tag})` : ""}`
			: (placeholder ?? "Seleccionar")
	}

	const isMultiple = props.mode === "multiple"
	const multiValue = isMultiple ? props.value : []

	return (
		<Popover open={open} onOpenChange={setOpen} modal>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					disabled={disabled}
					className={cn(
						"justify-between overflow-hidden",
						isMultiple
							? !multiValue.length && "text-muted-foreground"
							: !props.value && "text-muted-foreground",
						className
					)}
				>
					{renderTriggerLabel()}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-fit p-0">
				<Command>
					<CommandInput placeholder="Buscar..." className="h-9" disabled={isLoading} />
					<CommandList>
						{isLoading ? (
							<div className="space-y-2 px-2 py-3">
								<Skeleton className="h-8 w-full" />
								<Skeleton className="h-8 w-5/6" />
								<Skeleton className="h-8 w-4/5" />
								<Skeleton className="h-8 w-3/4" />
								<Skeleton className="h-8 w-2/3" />
							</div>
						) : (
							<>
								<CommandEmpty>No hay resultados.</CommandEmpty>
								<ScrollArea className="h-72">
									<CommandGroup>
										{flatNodes.map((node) => {
											const indent = 12 + Math.min(node.depth * 16, 96)

											return (
												<CommandItem
													key={node.value}
													value={node.searchText}
													onSelect={() => handleSelect(node.value)}
													className={cn({ "bg-accent": isSelected(node.value) })}
													style={{ paddingLeft: `${indent}px` }}
												>
													<div className="min-w-0 flex-1">
														<div className="truncate">
															<span className="font-medium">{node.label}</span>
															{node.tag && (
																<span className="text-muted-foreground ml-1 text-xs">
																	({node.tag})
																</span>
															)}
														</div>
														{node.pathLabels.length > 0 && (
															<div className="text-muted-foreground truncate text-xs">
																{node.pathLabels.join(" › ")}
															</div>
														)}
													</div>
													{isSelected(node.value) && (
														<Check className="ml-auto shrink-0 opacity-100" />
													)}
												</CommandItem>
											)
										})}
									</CommandGroup>
								</ScrollArea>
							</>
						)}
					</CommandList>

					{isMultiple && (
						<div className="flex items-center justify-between border-t p-2 text-sm">
							<span className="text-muted-foreground">
								{multiValue.length} seleccionado{multiValue.length === 1 ? "" : "s"}
							</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => (props as MultipleProps).onChange([])}
								disabled={!multiValue.length}
							>
								Limpiar
							</Button>
						</div>
					)}
				</Command>
			</PopoverContent>
		</Popover>
	)
}
