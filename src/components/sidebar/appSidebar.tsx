"use client"

import { Send, LifeBuoy, BookCopy, FileText, FileSearch, MonitorPlay, User } from "lucide-react"
import Image from "next/image"

import { useAuthorization } from "@/hooks/useAuthorization"

import { NavSecondary } from "./navSecondary"
import { NavMain } from "./navMain"
import { NavUser } from "./navUser"
import {
	Sidebar,
	SidebarRail,
	SidebarFooter,
	SidebarHeader,
	SidebarContent,
	SidebarMenuButton,
} from "@/components/ui/sidebar"

import type { ComponentProps } from "react"
import type { Session } from "@/lib/auth"

const data = {
	navMain: [
		{
			name: "Seguridad",
			url: "/dashboard/charlas-de-seguridad",
			icon: MonitorPlay,
		},
		{
			name: "Permiso de Trabajo",
			url: "/dashboard/permiso-de-trabajo",
			icon: FileText,
		},
		{
			name: "Libro de Obras",
			url: "/dashboard/libro-de-obras",
			icon: BookCopy,
		},
	],
	navAdmin: [
		{
			name: "Permisos de Trabajo",
			url: "/dashboard/admin/permisos-de-trabajo",
			icon: FileText,
		},
		{
			name: "Libros de Obras",
			url: "/dashboard/admin/libros-de-obras",
			icon: BookCopy,
		},
		{
			name: "Usuarios",
			url: "/dashboard/admin/usuarios",
			icon: User,
		},
	],
	navUser: [
		{
			name: "Documentación",
			url: "/dashboard/documentacion",
			icon: FileSearch,
		},
	],
	navSecondary: [
		{
			title: "Soporte",
			url: "/dashboard/soporte",
			icon: LifeBuoy,
		},
		{
			title: "Contacto",
			url: "/dashboard/contacto",
			icon: Send,
		},
	],
}

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
	session: Session
}

export function AppSidebar({ session, ...props }: AppSidebarProps) {
	const { canAccessAdminRoutes, canAccessUserRoutes } = useAuthorization(session)

	const navItems = [
		...(!canAccessAdminRoutes && !canAccessUserRoutes ? data.navMain : []),
		...(canAccessAdminRoutes ? [...data.navAdmin, ...data.navUser] : []),
		...(canAccessUserRoutes && !canAccessAdminRoutes ? data.navUser : []),
	]

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenuButton size="lg">
					<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
						<Image src="/logo.jpeg" width={50} height={50} alt="Logo" />
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">OTC</span>
						<span className="truncate text-xs">Sistema</span>
					</div>
				</SidebarMenuButton>
			</SidebarHeader>

			<SidebarContent>
				<NavMain navItems={navItems} />

				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>

			<SidebarFooter>
				<NavUser session={session} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
