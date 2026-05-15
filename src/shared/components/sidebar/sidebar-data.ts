import {
	BoxIcon,
	CarIcon,
	ViewIcon,
	HomeIcon,
	UsersIcon,
	GaugeIcon,
	WrenchIcon,
	FoldersIcon,
	UserPenIcon,
	ActivityIcon,
	BookOpenIcon,
	FileTextIcon,
	HistoryIcon,
	SettingsIcon,
	BookCopyIcon,
	BuildingIcon,
	LifeBuoyIcon,
	FilePlus2Icon,
	Building2Icon,
	FileSearchIcon,
	LayoutListIcon,
	ShieldPlusIcon,
	UserCircleIcon,
	GanttChartIcon,
	MonitorPlayIcon,
	LockKeyholeIcon,
	type LucideIcon,
} from "lucide-react"

export interface NavBarSubItem {
	url: string
	name: string
	test?: boolean
	icon: LucideIcon
	supervisor?: boolean
	workerOnly?: boolean
}

export interface NavBarItem {
	title: string
	type: "normal" | "collapsed"
	icon?: LucideIcon
	items: (NavBarSubItem & {
		subItems?: NavBarSubItem[]
	})[]
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
		supervisor: true,
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
				},
				{
					name: "Documentación",
					url: "/admin/dashboard/documentacion",
					icon: FileSearchIcon,
				},
				{
					name: "Carpetas de Arranques",
					url: "/admin/dashboard/carpetas-de-arranque",
					icon: FoldersIcon,
				},
				{
					name: "Control Laboral",
					url: "/admin/dashboard/control-laboral",
					icon: ViewIcon,
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
					subItems: [
						{
							name: "Indicadores",
							url: "/admin/dashboard/indicadores",
							icon: GaugeIcon,
						},
					],
				},
				{
					name: "Planes de Mantenimiento",
					url: "/admin/dashboard/planes-de-mantenimiento",
					icon: WrenchIcon,
					subItems: [
						{
							name: "Programación",
							url: "/admin/dashboard/programacion",
							icon: GanttChartIcon,
						},
					],
				},
				{
					name: "Solicitudes de Trabajo",
					url: "/admin/dashboard/solicitudes-de-trabajo",
					icon: FilePlus2Icon,
				},
				{
					name: "Tutoriales",
					url: "/admin/dashboard/tutoriales",
					icon: BookOpenIcon,
				},
				{
					name: "Soporte",
					url: "/admin/dashboard/soporte",
					icon: LifeBuoyIcon,
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
					subItems: [
						{
							name: "Historial de Equipos",
							url: "/admin/dashboard/historial-equipos",
							icon: HistoryIcon,
						},
					],
				},
				{
					name: "Registro de Actividad",
					url: "/admin/dashboard/registro-actividad",
					icon: ActivityIcon,
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
					supervisor: true,
				},
				{
					name: "Vehículos y Equipos",
					url: "/dashboard/vehiculos",
					icon: CarIcon,
					supervisor: true,
				},
				{
					name: "Carpetas de Arranque",
					url: "/dashboard/carpetas-de-arranque",
					icon: FoldersIcon,
					supervisor: true,
				},
				{
					name: "Control Laboral",
					url: "/dashboard/control-laboral",
					icon: ViewIcon,
					supervisor: true,
				},
				{
					name: "Charlas de Seguridad",
					url: "/dashboard/charlas-de-seguridad",
					icon: MonitorPlayIcon,
				},
				{
					name: "Permiso de Trabajo",
					url: "/dashboard/permiso-de-trabajo",
					icon: FileTextIcon,
					supervisor: true,
				},
				{
					name: "Libro de Obras",
					url: "/dashboard/libro-de-obras",
					icon: BookCopyIcon,
					supervisor: true,
				},
				{
					name: "Tutoriales",
					url: "/dashboard/tutoriales",
					icon: BookOpenIcon,
					supervisor: true,
				},
				{
					name: "Soporte",
					url: "/dashboard/soporte",
					icon: LifeBuoyIcon,
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
