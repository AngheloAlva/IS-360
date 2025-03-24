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

export default function PageName(): React.ReactElement {
	const pathname = usePathname()
	const path = pathname.split("/").slice(2)

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{path.map((item, i) => (
					<BreadcrumbItem key={i}>
						<BreadcrumbLink href={`/${path.slice(0, i + 1).join("/")}`}>
							<BreadcrumbPage className="capitalize">{item.split("-").join(" ")}</BreadcrumbPage>
						</BreadcrumbLink>
						{i < path.length - 1 && <BreadcrumbSeparator />}
					</BreadcrumbItem>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
