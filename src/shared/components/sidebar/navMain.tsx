"use client"

import { ChevronRightIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { data } from "./sidebar-data"
import { cn } from "@/lib/utils"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import {
	SidebarMenu,
	SidebarGroup,
	SidebarMenuSub,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarGroupLabel,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
} from "@/shared/components/ui/sidebar"

export function NavMain({ canAccessAdminRoutes }: { canAccessAdminRoutes: boolean }) {
	const pathName = usePathname()

	const navData = canAccessAdminRoutes ? data["internal"] : data["external"]

	return (
		<>
			{navData.map((group, i) =>
				group.type === "normal" ? (
					<SidebarGroup key={i}>
						<SidebarGroupLabel>{group.title}</SidebarGroupLabel>
						<SidebarMenu>
							{group.items.map((item) => (
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
				) : (
					<SidebarGroup key={i}>
						<SidebarGroupLabel>Otros</SidebarGroupLabel>

						<SidebarMenu>
							<Collapsible asChild className="group/collapsible">
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton>
											{group.icon && <group.icon />}
											{group.title}
											<ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
										</SidebarMenuButton>
									</CollapsibleTrigger>

									<CollapsibleContent>
										<SidebarMenuSub>
											{group.items.map((subItem) => (
												<SidebarMenuSubItem key={subItem.name}>
													<SidebarMenuSubButton
														asChild
														className={cn({
															"bg-text hover:bg-text hover:text-background [&>svg]:text-background text-background border-text font-bold":
																pathName.includes(subItem.url),
														})}
													>
														<Link href={subItem.url}>
															{subItem.icon && <subItem.icon />}
															<span>{subItem.name}</span>
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						</SidebarMenu>
					</SidebarGroup>
				)
			)}
		</>
	)
}
