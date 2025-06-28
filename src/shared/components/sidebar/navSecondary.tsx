import Link from "next/link"

import {
	SidebarMenu,
	SidebarGroup,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/shared/components/ui/sidebar"

import type { LucideIcon } from "lucide-react"

export function NavSecondary({
	items,
	...props
}: {
	items: {
		title: string
		url: string
		icon: LucideIcon
	}[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	return (
		<SidebarGroup {...props}>
			<SidebarMenu>
				{items.map((item) => (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton
							asChild
							size="sm"
							className="hover:bg-text/10 hover:border-text hover:text-text rounded-full border border-transparent font-medium transition-colors"
						>
							<Link href={item.url} className="flex [&>svg]:size-4">
								<item.icon />
								<span>{item.title}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	)
}
