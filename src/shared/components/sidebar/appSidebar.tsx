"use client"

import Image from "next/image"
import {
	CarIcon,
	HomeIcon,
	UsersIcon,
	WrenchIcon,
	FoldersIcon,
	FileTextIcon,
	LifeBuoyIcon,
	SettingsIcon,
	BookCopyIcon,
	Building2Icon,
	FileSearchIcon,
	LayoutListIcon,
	MonitorPlayIcon,
	FilePlus2Icon,
	UserIcon,
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
} from "@/shared/components/ui/sidebar"

import type { ComponentProps } from "react"
import type { Session } from "@/lib/auth"

const data = {
	navMain: [
		{
			name: "Inicio",
			url: "/dashboard/inicio",
			icon: HomeIcon,
		},
		{
			name: "Colaboradores",
			url: "/dashboard/colaboradores",
			icon: UsersIcon,
		},
		{
			name: "Vehículos y Equipos",
			url: "/dashboard/vehiculos",
			icon: CarIcon,
		},
		{
			name: "Carpetas de Arranque",
			url: "/dashboard/carpetas-de-arranque",
			icon: FoldersIcon,
		},
		{
			name: "Seguridad",
			url: "/dashboard/charlas-de-seguridad",
			icon: MonitorPlayIcon,
		},
		{
			name: "Permiso de Trabajo",
			url: "/dashboard/permiso-de-trabajo",
			icon: FileTextIcon,
		},
		{
			name: "Libro de Obras",
			url: "/dashboard/libro-de-obras",
			icon: BookCopyIcon,
		},
	],
	navAdmin: [
		{
			name: "Inicio",
			url: "/admin/dashboard/inicio",
			icon: HomeIcon,
		},
		{
			name: "Documentación",
			url: "/admin/dashboard/documentacion",
			icon: FileSearchIcon,
		},
		{
			name: "Carpetas de Arranques",
			url: "/admin/dashboard/carpetas-de-arranques",
			icon: FoldersIcon,
		},
		{
			name: "Charlas de Seguridad",
			url: "/admin/dashboard/charlas-de-seguridad",
			icon: MonitorPlayIcon,
		},
		{
			name: "Permisos de Trabajo",
			url: "/admin/dashboard/permisos-de-trabajo",
			icon: FileTextIcon,
		},
		{
			name: "OT / Libros de Obras",
			url: "/admin/dashboard/ordenes-de-trabajo",
			icon: LayoutListIcon,
		},
		{
			name: "Planes de Mantenimiento",
			url: "/admin/dashboard/planes-de-mantenimiento",
			icon: WrenchIcon,
		},
		{
			name: "Solicitudes de Trabajo",
			url: "/admin/dashboard/solicitudes-de-trabajo",
			icon: FilePlus2Icon,
		},
	],
	navSecondary: [
		// {
		// 	title: "Mi Cuenta",
		// 	url: "/dashboard/mi-cuenta",
		// 	icon: UserIcon,
		// },
		{
			title: "Soporte | Contacto",
			url: "/dashboard/soporte",
			icon: LifeBuoyIcon,
		},
	],
}

const navInternal = [
	{
		name: "Usuarios Internos",
		url: "/admin/dashboard/usuarios",
		icon: UsersIcon,
	},
	{
		name: "Empresas Contratistas",
		url: "/admin/dashboard/empresas",
		icon: Building2Icon,
	},
	{
		name: "Equipos / Ubicaciones",
		url: "/admin/dashboard/equipos",
		icon: SettingsIcon,
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
		...(canAccessAdminRoutes ? [...data.navAdmin] : []),
	]

	const myAccountItem = {
		title: "Mi Cuenta",
		url: canAccessAdminRoutes ? "/admin/dashboard/mi-cuenta" : "/dashboard/mi-cuenta",
		icon: UserIcon,
	}

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

				<NavSecondary items={[myAccountItem, ...data.navSecondary]} className="mt-auto" />
			</SidebarContent>

			<SidebarFooter>
				<NavUser session={session} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
