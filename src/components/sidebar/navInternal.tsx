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
					<SidebarMenuItem
						key={item.name}
						className={cn({
							"bg-primary/5 border-primary data-[state=open]:border-primary text-primary data-[state=open]:bg-primary/5 data-[state=open]:text-primary rounded-md border":
								pathName.includes(item.url),
						})}
					>
						<SidebarMenuButton
							asChild
							className="hover:bg-primary/5 hover:text-primary active:bg-primary/5 active:text-primary"
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
