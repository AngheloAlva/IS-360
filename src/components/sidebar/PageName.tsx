"use client"

import { usePathname } from "next/navigation"

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb"

export default function PageName(): React.ReactElement {
	const pathname = usePathname()

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbPage className="capitalize">
						{pathname.split("/").slice(2).join("/").split("-").join(" ")}
					</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	)
}
