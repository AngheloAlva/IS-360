"use client"

import { usePathname } from "next/navigation"

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbLink,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function PageName({ externalPath }: { externalPath: boolean }): React.ReactElement {
	const pathname = usePathname()
	const path = pathname.split("/").slice(externalPath ? 2 : 3)
	const firstPath = externalPath ? "/dashboard" : "/admin/dashboard"

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{path.map((item, i) => (
					<BreadcrumbItem key={i}>
						<BreadcrumbLink href={`${firstPath}/${path.slice(0, i + 1).join("/")}`}>
							<BreadcrumbPage className="capitalize">{item.split("-").join(" ")}</BreadcrumbPage>
						</BreadcrumbLink>
						{i < path.length - 1 && <BreadcrumbSeparator />}
					</BreadcrumbItem>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
