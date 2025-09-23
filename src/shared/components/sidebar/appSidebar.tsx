import Image from "next/image"

import { NavMain } from "./navMain"
import { NavUser } from "./navUser"
import {
	Sidebar,
	SidebarRail,
	SidebarFooter,
	SidebarHeader,
	SidebarContent,
} from "@/shared/components/ui/sidebar"

import type { MODULES } from "@prisma/client"
import type { ComponentProps } from "react"
import type { Session } from "@/lib/auth"

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
	session: Session
	canAccessAdminRoutes: boolean
}

export function AppSidebar({ session, canAccessAdminRoutes, ...props }: AppSidebarProps) {
	return (
		<Sidebar collapsible="icon" variant="sidebar" {...props}>
			<SidebarHeader>
				<div className="flex h-12 w-full items-center gap-2 overflow-hidden p-2 text-left text-sm">
					<div className="flex aspect-square size-8 items-center justify-center">
						<Image alt="Logo" width={50} height={52} src="/logo.svg" />
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-bold">OTC</span>
						<span className="truncate text-xs">360 ERP</span>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<NavMain
					canAccessAdminRoutes={canAccessAdminRoutes}
					userModules={session.user.allowedModules as MODULES[]}
				/>
			</SidebarContent>

			<SidebarFooter>
				<NavUser session={session} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
