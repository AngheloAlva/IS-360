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

export function NavMain({
	navItems,
}: {
	navItems: {
		name: string
		url: string
		icon: LucideIcon
		test?: boolean
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
							className={cn({
								"bg-text text-background hover:bg-text hover:text-background border-text font-bold":
									pathName.includes(item.url),
							})}
						>
							<Link href={item.url}>
								<item.icon />
								<span>{item.name}</span>
								{item.test && (
									<div className="mt-0.5 rounded-full bg-amber-500/80 px-1.5 text-xs font-medium text-white">
										Test
									</div>
								)}
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	)
}
