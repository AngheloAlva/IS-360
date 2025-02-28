"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

import { cn } from "@/lib/utils"

import {
	SidebarMenu,
	SidebarGroup,
	SidebarMenuItem,
	SidebarGroupLabel,
	SidebarMenuButton,
} from "@/components/ui/sidebar"

import { type LucideIcon } from "lucide-react"

export function NavMain({
	navItems,
}: {
	navItems: {
		name: string
		url: string
		icon: LucideIcon
	}[]
}) {
	const pathName = usePathname()

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Opciones</SidebarGroupLabel>
			<SidebarMenu>
				{navItems.map((item) => (
					<SidebarMenuItem
						key={item.name}
						className={cn({
							"bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground":
								pathName === item.url,
						})}
					>
						<SidebarMenuButton asChild>
							<Link href={item.url}>
								<item.icon />
								<span>{item.name}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	)
}
