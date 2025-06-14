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
} from "@/shared/components/ui/sidebar"

import { type LucideIcon } from "lucide-react"

export function NavInternal({
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
			<SidebarGroupLabel>Menú Interno</SidebarGroupLabel>
			<SidebarMenu>
				{navItems.map((item) => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton
							asChild
							className={cn(
								"hover:bg-text/10 hover:border-text hover:text-text h-8.5 rounded-full border border-transparent font-medium transition-colors",
								{
									"bg-text hover:bg-text hover:text-background text-background border-text font-bold":
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
