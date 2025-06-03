"use client"

import Image from "next/image"
import {
	Home,
	Send,
	Siren,
	Users,
	Wrench,
	Folders,
	FileText,
	LifeBuoy,
	BookCopy,
	Building2,
	FileSearch,
	LayoutList,
	MonitorPlay,
	Construction,
	Car,
} from "lucide-react"

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
			name: "Inicio",
			url: "/dashboard/inicio",
			icon: Home,
		},
		{
			name: "Colaboradores",
			url: "/dashboard/colaboradores",
			icon: Users,
		},
		{
			name: "Vehículos y Equipos",
			url: "/dashboard/vehiculos",
			icon: Car,
		},
		{
			name: "Carpetas de Arranque",
			url: "/dashboard/carpetas-de-arranque",
			icon: Folders,
		},
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
			name: "Inicio",
			url: "/admin/dashboard/inicio",
			icon: Home,
		},
		{
			name: "Carpetas de Arranques",
			url: "/admin/dashboard/carpetas-de-arranques",
			icon: Folders,
		},
		{
			name: "Charlas de Seguridad",
			url: "/admin/dashboard/charlas-de-seguridad",
			icon: MonitorPlay,
		},
		{
			name: "Permisos de Trabajo",
			url: "/admin/dashboard/permisos-de-trabajo",
			icon: FileText,
		},
		{
			name: "Ordenes de Trabajo",
			url: "/admin/dashboard/ordenes-de-trabajo",
			icon: LayoutList,
		},
		{
			name: "Libros de Obras",
			url: "/admin/dashboard/libros-de-obras",
			icon: BookCopy,
		},
		{
			name: "Planes de Mantenimiento",
			url: "/admin/dashboard/planes-de-mantenimiento",
			icon: Construction,
		},
		{
			name: "Patrullaje",
			url: "/admin/dashboard/patrullaje",
			icon: Siren,
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
		name: "Usuarios Internos",
		url: "/admin/dashboard/usuarios",
		icon: Users,
	},
	{
		name: "Empresas Contratistas",
		url: "/admin/dashboard/empresas",
		icon: Building2,
	},
	{
		name: "Equipos / Ubicaciones",
		url: "/admin/dashboard/equipos",
		icon: Wrench,
	},
]

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
	session: Session
}

export function AppSidebar({ session, ...props }: AppSidebarProps) {
	const canAccessAdminRoutes = session.user.accessRole === "ADMIN"
	const canAccessUserRoutes = session.user.accessRole === "USER"

	const navItems = [
		...(!canAccessAdminRoutes && !canAccessUserRoutes ? data.navMain : []),
		...(canAccessAdminRoutes ? [...data.navAdmin, ...data.navUser] : []),
		...(canAccessUserRoutes && !canAccessAdminRoutes ? data.navUser : []),
	]

	return (
		<Sidebar collapsible="icon" variant="sidebar" {...props}>
			<SidebarHeader>
				<SidebarMenuButton size="lg">
					<div className="flex aspect-square size-8 items-center justify-center">
						<Image alt="Logo" width={50} height={52} src="/logo.svg" />
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">OTC</span>
						<span className="truncate text-xs">360 ERP</span>
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
