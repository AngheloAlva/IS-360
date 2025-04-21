"use client"

import { WorkOrderDataTable } from "@/components/sections/work-order/WorkOrderDataTable"

export default function AdminUsersPage(): React.ReactElement {
	return (
		<div className={"flex h-full w-full flex-1 flex-col gap-8 transition-all"}>
			<WorkOrderDataTable />
		</div>
	)
}
