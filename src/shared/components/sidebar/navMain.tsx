"use client"

import { ChevronRightIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { filterAdminSidebarItems } from "@/lib/module-permissions"
import { data } from "./sidebar-data"
import { cn } from "@/lib/utils"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import {
	SidebarMenu,
	SidebarGroup,
	SidebarMenuSub,
	SidebarMenuItem,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarGroupLabel,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
} from "@/shared/components/ui/sidebar"

import type { MODULES } from "@/generated/prisma/enums"

interface NavMainProps {
	userModules?: MODULES[]
	canAccessAdminRoutes: boolean
	canAccessSupervisorRoutes: boolean
}

export function NavMain({
	canAccessAdminRoutes,
	canAccessSupervisorRoutes,
	userModules = ["ALL"],
}: NavMainProps) {
	const pathName = usePathname()

	const navData = canAccessAdminRoutes ? data["internal"] : data["external"]

	const isAdmin = canAccessAdminRoutes
	const isSupervisor = canAccessSupervisorRoutes

	const isWorker = !isAdmin && !isSupervisor

	const filteredNavData = navData
		.map((group) => ({
			...group,
			...(isAdmin
				? { items: filterAdminSidebarItems(group.items, userModules, isAdmin) }
				: {
						items: group.items.filter((item) => {
							if (item.supervisor === true && !isSupervisor) return false
							if (item.workerOnly === true && !isWorker) return false
							return true
						}),
					}),
		}))
		.filter((group) => group.items.length > 0)

	return (
		<>
			{filteredNavData.map((group, i) =>
				group.type === "normal" ? (
					<SidebarGroup key={i}>
						<SidebarGroupLabel>{group.title}</SidebarGroupLabel>
						<SidebarMenu className="space-y-1">
							{group.items.map((item) => {
								const hasSubItems = !!item.subItems?.length
								const isActive = pathName.includes(item.url)

								const itemButton = (
									<SidebarMenuButton
										asChild
										className={cn({
											"bg-text text-background hover:bg-text hover:text-background border-text font-bold":
												isActive,
										})}
									>
										<Link href={item.url}>
											<item.icon />
											<span>{item.name}</span>
											{item.test && (
												<div className="mt-0.5 rounded-full bg-amber-500/80 px-1.5 text-xs font-semibold text-white">
													Test
												</div>
											)}
										</Link>
									</SidebarMenuButton>
								)

								if (!hasSubItems) {
									return <SidebarMenuItem key={item.name}>{itemButton}</SidebarMenuItem>
								}

								return (
									<Collapsible
										key={item.name}
										asChild
										defaultOpen={item.subItems?.some((s) => pathName.includes(s.url))}
										className="group/collapsible"
									>
										<SidebarMenuItem>
											{itemButton}
											<CollapsibleTrigger asChild>
												<SidebarMenuAction
													aria-label={`Toggle ${item.name}`}
													className={cn({
														"text-background hover:bg-text/80 hover:text-background":
															isActive,
													})}
												>
													<ChevronRightIcon className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
												</SidebarMenuAction>
											</CollapsibleTrigger>
											<CollapsibleContent>
												<SidebarMenuSub>
													{item.subItems!.map((subItem) => (
														<SidebarMenuSubItem key={subItem.name}>
															<SidebarMenuSubButton
																asChild
																className={cn({
																	"bg-text hover:bg-text hover:text-background [&>svg]:text-background text-background border-text font-bold":
																		pathName.includes(subItem.url),
																})}
															>
																<Link href={subItem.url}>
																	<subItem.icon />
																	<span>{subItem.name}</span>
																</Link>
															</SidebarMenuSubButton>
														</SidebarMenuSubItem>
													))}
												</SidebarMenuSub>
											</CollapsibleContent>
										</SidebarMenuItem>
									</Collapsible>
								)
							})}
						</SidebarMenu>
					</SidebarGroup>
				) : (
					<SidebarGroup key={i}>
						<SidebarGroupLabel>Otros</SidebarGroupLabel>

						<SidebarMenu className="space-y-1">
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
