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
		<Breadcrumb className="hidden md:block">
			<BreadcrumbList>
				{path.map((item, i) => {
					const slug = item.split("_")
					const name = slug[0].split("-").join(" ")

					return (
						<BreadcrumbItem key={i}>
							<BreadcrumbPage className="capitalize">{name}</BreadcrumbPage>
							{i < path.length - 1 && <BreadcrumbSeparator />}
						</BreadcrumbItem>
					)
				})}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
