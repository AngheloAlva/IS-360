import {
	BoxIcon,
	CarIcon,
	ViewIcon,
	HomeIcon,
	UsersIcon,
	WrenchIcon,
	FoldersIcon,
	UserPenIcon,
	BookOpenIcon,
	FileTextIcon,
	SettingsIcon,
	BookCopyIcon,
	BuildingIcon,
	FilePlus2Icon,
	Building2Icon,
	FileSearchIcon,
	LayoutListIcon,
	ShieldPlusIcon,
	UserCircleIcon,
	MonitorPlayIcon,
	ChartColumnIcon,
	LockKeyholeIcon,
	type LucideIcon,
	LockKeyholeOpenIcon,
} from "lucide-react"

export interface NavBarItem {
	title: string
	type: "normal" | "collapsed"
	icon?: LucideIcon
	items: {
		url: string
		name: string
		test?: boolean
		icon: LucideIcon
	}[]
}

interface NavBarData {
	[name: string]: NavBarItem[]
}

export const internalPersonalInfo = [
	{
		name: "Datos Personales",
		url: "/admin/dashboard/mi-cuenta/datos-personales",
		icon: UserPenIcon,
	},
	{
		name: "Cambiar Contraseña",
		url: "/admin/dashboard/mi-cuenta/cambiar-contrasena",
		icon: LockKeyholeIcon,
	},
	{
		name: "Activar 2FA",
		url: "/admin/dashboard/mi-cuenta/activar-2fa",
		icon: ShieldPlusIcon,
	},
]

export const externalPersonalInfo = [
	{
		name: "Datos Personales",
		url: "/dashboard/mi-cuenta/datos-personales",
		icon: UserPenIcon,
	},
	{
		name: "Mi Empresa",
		url: "/dashboard/mi-cuenta/mi-empresa",
		icon: BuildingIcon,
	},
	{
		name: "Cambiar Contraseña",
		url: "/dashboard/mi-cuenta/cambiar-contrasena",
		icon: LockKeyholeIcon,
	},
	{
		name: "Activar 2FA",
		url: "/dashboard/mi-cuenta/activar-2fa",
		icon: ShieldPlusIcon,
	},
]

export const data: NavBarData = {
	internal: [
		{
			title: "Menú Interno",
			type: "normal",
			items: [
				{
					name: "Inicio",
					url: "/admin/dashboard/inicio",
					icon: HomeIcon,
					test: false,
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
					name: "Control Laboral",
					url: "/admin/dashboard/control-laboral",
					icon: ViewIcon,
					test: true,
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
					name: "Solicitudes de Bloqueo",
					url: "/admin/dashboard/solicitudes-de-bloqueo",
					icon: LockKeyholeOpenIcon,
					test: true,
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
				{
					name: "Herramientas",
					url: "/admin/dashboard/herramientas",
					test: true,
					icon: BoxIcon,
				},
				{
					name: "Reportabilidad",
					url: "/admin/dashboard/reportabilidad",
					icon: ChartColumnIcon,
				},
				{
					name: "Reportabilidad",
					url: "/admin/dashboard/reportabilidad-otc",
					icon: ChartColumnIcon,
				},
				{
					name: "Tutoriales",
					url: "/admin/dashboard/tutoriales",
					icon: BookOpenIcon,
				},
			],
		},
		{
			title: "Menú Interno",
			type: "normal",
			items: [
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
			],
		},
		{
			title: "Información Personal",
			type: "collapsed",
			icon: UserCircleIcon,
			items: internalPersonalInfo,
		},
	],
	external: [
		{
			title: "Menú Principal",
			type: "normal",
			items: [
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
					name: "Control Laboral",
					url: "/dashboard/control-laboral",
					icon: ViewIcon,
					test: true,
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
				{
					name: "Tutoriales",
					url: "/dashboard/tutoriales",
					icon: BookOpenIcon,
				},
			],
		},
		{
			title: "Información Personal",
			type: "collapsed",
			items: externalPersonalInfo,
		},
	],
}
