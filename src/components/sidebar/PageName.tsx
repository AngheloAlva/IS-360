"use client"

import { usePathname } from "next/navigation"

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function PageName({ externalPath }: { externalPath: boolean }): React.ReactElement {
	const pathname = usePathname()
	const path = pathname.split("/").slice(externalPath ? 1 : 2)

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{path.map((item, i) => (
					<BreadcrumbItem key={i}>
						<BreadcrumbPage className="capitalize">{item.split("-").join(" ")}</BreadcrumbPage>
						{i < path.length - 1 && <BreadcrumbSeparator />}
					</BreadcrumbItem>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
