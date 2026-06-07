"use client"

import { Fragment } from "react"
import { usePathname } from "next/navigation"

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb"

export default function PageName({ externalPath }: { externalPath: boolean }): React.ReactElement {
	const pathname = usePathname()
	const path = pathname.split("/").slice(externalPath ? 2 : 3)

	return (
		<Breadcrumb className="hidden md:block">
			<BreadcrumbList>
				{path.map((item, i) => {
					const slug = item.split("_")
					const name = slug[0].split("-").join(" ")

					return (
						<Fragment key={i}>
							<BreadcrumbItem>
								<BreadcrumbPage className="capitalize">{name}</BreadcrumbPage>
							</BreadcrumbItem>
							{i < path.length - 1 && <BreadcrumbSeparator />}
						</Fragment>
					)
				})}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
