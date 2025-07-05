import { ChevronRightIcon, UserCircleIcon, type LucideIcon } from "lucide-react"
import Link from "next/link"

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
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function NavOther({
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
			<SidebarGroupLabel>Otros</SidebarGroupLabel>

			<SidebarMenu>
				<Collapsible asChild className="group/collapsible">
					<SidebarMenuItem>
						<CollapsibleTrigger asChild>
							<SidebarMenuButton tooltip="Otros">
								<UserCircleIcon />
								Mi Cuenta
								<ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
							</SidebarMenuButton>
						</CollapsibleTrigger>

						<CollapsibleContent>
							<SidebarMenuSub>
								{navItems.map((subItem) => (
									<SidebarMenuSubItem key={subItem.name}>
										<SidebarMenuSubButton
											asChild
											className={cn(
												"hover:bg-text/10 hover:border-text hover:text-text h-7 rounded-full border border-transparent font-medium transition-colors",
												{
													"bg-text hover:bg-text hover:text-background [&>svg]:text-background text-background border-text font-bold":
														pathName.includes(subItem.url),
												}
											)}
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
}
