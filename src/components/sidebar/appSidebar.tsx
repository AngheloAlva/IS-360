"use client"

import Image from "next/image"
import {
	Send,
	User,
	Wrench,
	FileText,
	LifeBuoy,
	BookCopy,
	BookUser,
	Building2,
	FileSearch,
	LayoutList,
	MonitorPlay,
	Construction,
} from "lucide-react"

import { useAuthorization } from "@/hooks/useAuthorization"

import { NavSecondary } from "./navSecondary"
import { NavInternal } from "./navInternal"
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
			name: "Planes de Mantenimiento",
			url: "/admin/dashboard/planes-de-mantenimiento",
			icon: Construction,
		},
		{
			name: "Ordenes de Trabajo",
			url: "/admin/dashboard/ordenes-de-trabajo",
			icon: LayoutList,
		},
		{
			name: "Carpetas de Arranques",
			url: "/admin/dashboard/carpetas-de-arranques",
			icon: BookUser,
		},
		{
			name: "Permisos de Trabajo",
			url: "/admin/dashboard/permisos-de-trabajo",
			icon: FileText,
		},
		{
			name: "Libros de Obras",
			url: "/admin/dashboard/libros-de-obras",
			icon: BookCopy,
		},
		{
			name: "Charlas de Seguridad",
			url: "/admin/dashboard/charlas-de-seguridad",
			icon: MonitorPlay,
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

const navInternal = [
	{
		name: "Equipos",
		url: "/admin/dashboard/equipos",
		icon: Wrench,
	},
	{
		name: "Empresas",
		url: "/admin/dashboard/empresas",
		icon: Building2,
	},
	{
		name: "Usuarios",
		url: "/admin/dashboard/usuarios",
		icon: User,
	},
]

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
		<Sidebar collapsible="icon" variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenuButton size="lg">
					<div className="flex aspect-square size-8 items-center justify-center bg-white">
						<Image src="/logo.svg" width={50} height={50} alt="Logo" />
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">OTC</span>
						<span className="truncate text-xs">IS ERP</span>
					</div>
				</SidebarMenuButton>
			</SidebarHeader>

			<SidebarContent>
				<NavMain navItems={navItems} />
				{canAccessAdminRoutes && <NavInternal navItems={navInternal} />}

				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>

			<SidebarFooter>
				<NavUser session={session} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
