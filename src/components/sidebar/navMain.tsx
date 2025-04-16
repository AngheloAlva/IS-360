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
			<SidebarGroupLabel>Menú principal</SidebarGroupLabel>
			<SidebarMenu>
				{navItems.map((item) => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton
							asChild
							className={cn(
								"hover:bg-text/10 hover:border-text hover:text-text h-8.5 rounded-full border border-transparent font-medium transition-colors",
								{
									"bg-text text-background hover:bg-text hover:text-background border-text font-bold":
										pathName.includes(item.url),
								}
							)}
						>
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
