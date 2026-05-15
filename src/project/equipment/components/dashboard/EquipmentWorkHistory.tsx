"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { HistoryIcon } from "lucide-react"

import { TreeSelect } from "@/shared/components/forms/TreeSelect"
import { useEquipmentTreeNodes } from "@/project/equipment/hooks/use-equipment-tree-nodes"

import { EquipmentTimeline } from "@/project/equipment/components/data/EquipmentTimeline"

// ─── Empty selector state ─────────────────────────────────────────────────────

function NoEquipmentSelected() {
	return (
		<div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
			<HistoryIcon className="h-12 w-12 text-muted-foreground/30" />
			<div className="space-y-1">
				<p className="text-sm font-medium text-muted-foreground">
					Selecciona un equipo para ver su historial
				</p>
				<p className="text-xs text-muted-foreground/70">
					Usa el selector superior para elegir un equipo o ubicación
				</p>
			</div>
		</div>
	)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EquipmentWorkHistory() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()

	const equipmentId = searchParams.get("equipmentId")

	const { nodes, isLoading } = useEquipmentTreeNodes()

	function handleEquipmentChange(value: string | null) {
		const next = new URLSearchParams(searchParams.toString())
		if (value) {
			next.set("equipmentId", value)
		} else {
			next.delete("equipmentId")
		}
		router.replace(`${pathname}?${next.toString()}`, { scroll: false })
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Equipment selector */}
			<div className="flex flex-col gap-1.5">
				<span className="text-sm font-medium text-foreground">Equipo</span>
				<TreeSelect
					mode="single"
					nodes={nodes}
					value={equipmentId}
					onChange={handleEquipmentChange}
					isLoading={isLoading}
					placeholder="Seleccionar equipo..."
					className="w-full max-w-md"
				/>
			</div>

			{/* Timeline or placeholder */}
			{equipmentId ? (
				<EquipmentTimeline equipmentId={equipmentId} />
			) : (
				<NoEquipmentSelected />
			)}
		</div>
	)
}
