"use client"

import Image from "next/image"

import {
	Send,
	LifeBuoy,
	BookCopy,
	FileText,
	FolderPlus,
	FileSearch,
	MonitorPlay,
} from "lucide-react"

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

const data = {
	navMain: [
		{
			name: "Permiso de Trabajo",
			url: "/dashboard/permiso-de-trabajo",
			icon: FileText,
		},
		{
			name: "Video de Seguridad",
			url: "/dashboard/video-de-seguridad",
			icon: MonitorPlay,
		},
		{
			name: "Registro de Actividades",
			url: "/dashboard/registro-de-actividades",
			icon: FolderPlus,
		},
		{
			name: "Libro de Obras",
			url: "/dashboard/libro-de-obras",
			icon: BookCopy,
		},
		{
			name: "Documentación",
			url: "/dashboard/documentacion",
			icon: FileSearch,
		},
	],
	navSecondary: [
		{
			title: "Soporte",
			url: "#",
			icon: LifeBuoy,
		},
		{
			title: "Contacto",
			url: "#",
			icon: Send,
		},
	],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
				<NavMain navItems={data.navMain} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
