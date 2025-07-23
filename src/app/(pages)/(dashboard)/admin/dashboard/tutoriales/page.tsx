"use client"

import { PlayCircleIcon, TvMinimalPlayIcon } from "lucide-react"
import { useState } from "react"

import ModuleHeader from "@/shared/components/ModuleHeader"
import { Button } from "@/shared/components/ui/button"
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/shared/components/ui/accordion"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

interface Video {
	title: string
	description: string
	url: string
}

interface ModuleVideos {
	moduleName: string
	videos: Video[]
}

const adminTutorialModules: ModuleVideos[] = [
	{
		moduleName: "Gestor Documental",
		videos: [
			{
				title: "Subir documentos",
				description: "Tutorial de como subir archivos correctamente.",
				url: "https://youtube.com/embed/1o4Vej8Ftuk",
			},
			{
				title: "Eliminar Archivos y Carpetas",
				description: "Tutorial de como eliminar archivos y carpetas correctamente.",
				url: "https://youtube.com/embed/b2J1QVmxenw",
			},
			{
				title: "Revision Estadísticas",
				description: "Tutorial para revisar estadísticas del gestor documental.",
				url: "https://youtube.com/embed/4bY3RdkSuKE",
			},
			{
				title: "Búsqueda Documentos",
				description: "Tutorial de búsqueda avanzada de documentos.",
				url: "https://youtube.com/embed/MpIrvsgIwxs",
			},
			{
				title: "Comentarios y Edicion Documentos",
				description: "Tutorial de gestión de comentarios y edición de documentos.",
				url: "https://youtube.com/embed/VV08VVJrl7k",
			},
		],
	},
	{
		moduleName: "Ordenes de Trabajo",
		videos: [
			{
				title: "Creacion Orden de Trabajo",
				description: "Tutorial de como crear una orden de trabajo.",
				url: "https://youtube.com/embed/Yg_ZiODHu1U",
			},
			{
				title: "Creacion Libro de Obras",
				description: "Tutorial de como crear un libro de obras.",
				url: "https://youtube.com/embed/K_LHCpommos",
			},
			{
				title: "Cierre de Hitos",
				description: "Tutorial de como cerrar hitos de una orden de trabajo.",
				url: "https://youtube.com/embed/cTT1T9zIl7Q",
			},
		],
	},
	{
		moduleName: "Planes de Mantenimiento",
		videos: [
			{
				title: "Creacion de Plan de Mantenimiento",
				description: "Tutorial de como crear un plan de mantenimiento.",
				url: "https://youtube.com/embed/UjotpO6DcIQ",
			},
			{
				title: "Creacion de Tareas para un Plan",
				description: "Tutorial de como crear tareas para un plan de mantenimiento.",
				url: "https://youtube.com/embed/uvrnlMjWJqU",
			},
		],
	},
	{
		moduleName: "Permisos de Trabajo",
		videos: [
			{
				title: "Creacion de Permiso de Trabajo",
				description: "Tutorial de como crear un permiso de trabajo.",
				url: "https://youtube.com/embed/0RcHtcDqRKk",
			},
		],
	},
	{
		moduleName: "Solicitudes de Trabajo",
		videos: [
			{
				title: "Creacion de Solicitud de Trabajo",
				description: "Tutorial de como crear una solicitud de trabajo.",
				url: "https://youtube.com/embed/rUHO23Z7lSs",
			},
		],
	},
	{
		moduleName: "Empresas",
		videos: [
			{
				title: "Creacion de Empresas",
				description: "Tutorial de como crear una empresa.",
				url: "https://youtube.com/embed/zA0xehVOB0s",
			},
		],
	},
	{
		moduleName: "Mi Cuenta",
		videos: [
			{
				title: "Configuración Mi Cuenta",
				description: "Tutorial de como actualizar datos personales correctamente.",
				url: "https://youtube.com/embed/wdRtoGujnXo",
			},
		],
	},
]

export default function AdminTutorialsPage(): React.ReactElement {
	const [activeVideo, setActiveVideo] = useState<Video | null>(null)

	// Filtrar módulos que tienen videos
	const modulesWithVideos = adminTutorialModules.filter((module) => module.videos.length > 0)

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<ModuleHeader
				title="Videos Tutoriales - Administración"
				description="Centro de aprendizaje del sistema. Aprende a usar todas las funcionalidades."
				className="from-emerald-600 to-teal-700"
			/>

			<div className="space-y-4">
				{modulesWithVideos.length > 0 ? (
					<Accordion type="single" collapsible className="w-full space-y-4">
						{modulesWithVideos.map((module, index) => (
							<AccordionItem
								key={module.moduleName}
								value={`module-${index}`}
								className="bg-background rounded-lg border shadow-sm"
							>
								<AccordionTrigger className="group cursor-pointer px-6 py-4 hover:no-underline">
									<div className="flex items-center gap-3">
										<div className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 p-2">
											<TvMinimalPlayIcon className="h-5 w-5 text-white" />
										</div>
										<div className="text-left">
											<h3 className="text-lg font-semibold group-hover:underline">
												{module.moduleName}
											</h3>
											<p className="text-muted-foreground text-sm">
												{module.videos.length} video{module.videos.length !== 1 ? "s" : ""}{" "}
												disponible{module.videos.length !== 1 ? "s" : ""}
											</p>
										</div>
									</div>
								</AccordionTrigger>

								<AccordionContent className="px-6 pb-4">
									<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
										{module.videos.map((video) => (
											<Button
												key={video.url}
												variant="outline"
												className="h-auto cursor-pointer justify-start p-4 text-left shadow transition-colors hover:border-emerald-500 hover:bg-emerald-500/10"
												onClick={() => setActiveVideo(video)}
											>
												<div className="flex w-full items-start gap-3">
													<PlayCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
													<div className="min-w-0 flex-1">
														<h4 className="text-sm leading-tight font-semibold">{video.title}</h4>
														{video.description && (
															<p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
																{video.description}
															</p>
														)}
													</div>
												</div>
											</Button>
										))}
									</div>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				) : (
					<div className="py-12 text-center">
						<TvMinimalPlayIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
						<h3 className="text-muted-foreground mb-2 text-lg font-medium">Próximamente</h3>
						<p className="text-muted-foreground">
							Estamos preparando más videos tutoriales para administradores.
						</p>
					</div>
				)}
			</div>

			<Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle>{activeVideo?.title}</DialogTitle>
						<DialogDescription>{activeVideo?.description}</DialogDescription>
					</DialogHeader>

					<div className="aspect-video overflow-hidden rounded-md">
						<iframe
							allowFullScreen
							src={activeVideo?.url}
							className="h-full w-full"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
