"use client"

import { cn } from "@/lib/utils"

import { RootFolderDataTable } from "./RootFolderDataTable"
import { useSidebar } from "@/components/ui/sidebar"

export default function MainAdminRootFolders(): React.ReactElement {
	const { state } = useSidebar()

	return (
		<div
			className={cn(
				"flex h-full w-full flex-col gap-8 transition-all md:max-w-[95dvw] lg:max-w-[98dvw]",
				{
					"md:max-w-[68dvw] lg:max-w-[75dvw] xl:max-w-[80dvw] 2xl:max-w-[85dvw]":
						state === "expanded",
				}
			)}
		>
			<RootFolderDataTable />
		</div>
	)
}
