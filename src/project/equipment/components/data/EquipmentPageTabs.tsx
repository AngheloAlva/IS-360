"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { EquipmentTable } from "@/project/equipment/components/data/EquipmentTable"
import { UnifiedTreePage } from "@/project/equipment/components/data/UnifiedTreePage"
import type { UnifiedTreePermissions } from "@/project/equipment/contexts/unified-tree-permissions-context"

type TabView = "table" | "tree"

interface EquipmentPageTabsProps {
	canSeeTree: boolean
	canCreateEquipment: boolean
	canUpdateEquipment: boolean
	canDeleteEquipment: boolean
	canCreateLocation: boolean
	canUpdateLocation: boolean
	canDeleteLocation: boolean
}

function isValidView(value: string | null): value is TabView {
	return value === "table" || value === "tree"
}

export function EquipmentPageTabs({
	canSeeTree,
	canCreateEquipment,
	canUpdateEquipment,
	canDeleteEquipment,
	canCreateLocation,
	canUpdateLocation,
	canDeleteLocation,
}: EquipmentPageTabsProps): React.ReactElement {
	const router = useRouter()
	const searchParams = useSearchParams()

	const rawView = searchParams.get("view")
	const activeView: TabView =
		isValidView(rawView) && (rawView !== "tree" || canSeeTree) ? rawView : "table"

	const handleTabChange = (value: string) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set("view", value)
		router.replace(`?${params.toString()}`, { scroll: false })
	}

	// If URL has ?view=tree but user lacks permission, correct the URL silently
	useEffect(() => {
		if (rawView === "tree" && !canSeeTree) {
			const params = new URLSearchParams(searchParams.toString())
			params.set("view", "table")
			router.replace(`?${params.toString()}`, { scroll: false })
		}
	}, [rawView, canSeeTree, router, searchParams])

	const treePermissions: UnifiedTreePermissions = {
		canCreateEquipment,
		canUpdateEquipment,
		canDeleteEquipment,
		canCreateLocation,
		canUpdateLocation,
		canDeleteLocation,
	}

	return (
		<Tabs value={activeView} onValueChange={handleTabChange} className="w-full">
			<TabsList className="w-full">
				<TabsTrigger value="table">Tabla</TabsTrigger>
				{canSeeTree && <TabsTrigger value="tree">Árbol</TabsTrigger>}
			</TabsList>

			<TabsContent value="table" className="mt-4">
				<EquipmentTable id="equipment-table" parentId={null} />
			</TabsContent>

			{canSeeTree && (
				<TabsContent value="tree" className="mt-4">
					<UnifiedTreePage permissions={treePermissions} />
				</TabsContent>
			)}
		</Tabs>
	)
}
