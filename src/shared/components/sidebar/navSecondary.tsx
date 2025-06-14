import Link from "next/link"

import {
	SidebarMenu,
	SidebarGroup,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarGroupContent,
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
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								size="sm"
								className="hover:bg-primary/5 hover:text-primary"
							>
								<Link href={item.url}>
									<div className="flex gap-1 [&>svg]:size-4">
										<item.icon />
										<span>{item.title}</span>
									</div>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
