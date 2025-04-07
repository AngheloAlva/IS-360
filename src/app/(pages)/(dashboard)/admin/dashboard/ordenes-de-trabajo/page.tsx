"use client"

import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

import { WorkOrderDataTable } from "@/components/sections/work-order/WorkOrderDataTable"

export default function AdminUsersPage(): React.ReactElement {
	const { state } = useSidebar()

	return (
		<div
			className={cn(
				"flex h-full w-full flex-col gap-8 transition-all md:max-w-[95dvw] lg:max-w-[98dvw]",
				{
					"md:max-w-[62dvw] lg:max-w-[70dvw] xl:max-w-[77dvw] 2xl:max-w-[80dvw]":
						state === "expanded",
				}
			)}
		>
			<WorkOrderDataTable />
		</div>
	)
}
