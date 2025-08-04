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

const tutorialModules: ModuleVideos[] = [
	{
		moduleName: "Colaboradores",
		videos: [
			{
				title: "Creacion de Colaborador",
				description: "Tutorial de como crear un colaborador correctamente.",
				url: "https://youtube.com/embed/0hMlJI2u0p0",
			},
			{
				title: "Editar y Eliminar Colaboradores",
				description: "Tutorial de como crear un colaborador correctamente.",
				url: "https://youtube.com/embed/1UNEvx1Rko8",
			},
		],
	},
	{
		moduleName: "Vehículos y Equipos",
		videos: [
			{
				title: "Agregar Vehiculos",
				description: "Gestión y Monitoreo de Vehículos / Equipos",
				url: "https://youtube.com/embed/PThFgVXV8_M",
			},
			{
				title: "Editar y Eliminar Vehiculos / Equipos",
				description: "Gestión y monitoreo de vehículos y equipos",
				url: "https://youtube.com/embed/aG8R429NdKU",
			},
		],
	},
	{
		moduleName: "Permisos de Trabajo",
		videos: [
			{
				title: "Creacion Permiso de Trabajo",
				description: "Tutorial de como crear un permiso de trabajo.",
				url: "https://youtube.com/embed/RlAQzjsIUm4",
			},
			{
				title: "Consideración con Permisos de Trabajo",
				description: "Consideraciones a tener en cuenta al crear un permiso de trabajo.",
				url: "https://youtube.com/embed/GSSVKmZHGoI",
			},
			{
				title: "Visualización Permiso de Trabajo",
				description: "Consideraciones a tener en cuenta al crear un permiso de trabajo.",
				url: "https://youtube.com/embed/CsnFK1NOUzs",
			},
			{
				title: "Edición Permiso de Trabajo",
				description: "Consideraciones a tener en cuenta al crear un permiso de trabajo.",
				url: "https://youtube.com/embed/TGmy-UK-PKU",
			},
		],
	},
	{
		moduleName: "Libro de Obras",
		videos: [
			{
				title: "Creacion Libro de Obras",
				description: "Tutorial de como crear un libro de obras.",
				url: "https://youtube.com/embed/FW-NFkb4300",
			},
			{
				title: "Creacion de Carta Gantt/Hitos",
				description: "Tutorial de como agregar un correctamente hitos.",
				url: "https://youtube.com/embed/ySMKy29aFYk",
			},
			{
				title: "Agregar Actividades Diarias",
				description: "Tutorial de como agregar un actividades diarias al libro de obras.",
				url: "https://youtube.com/embed/i1nqut1kOas",
			},
			{
				title: "Cierre de Hitos",
				description: "Tutorial de como cerrar un hito en el libro de obras.",
				url: "https://youtube.com/embed/snastGIP1Pw",
			},
			{
				title: "Respuesta a Inspección de OTC",
				description: "Tutorial de como cerrar un hito en el libro de obras.",
				url: "https://youtube.com/embed/WCUYcNFr7OI",
			},
		],
	},
	{
		moduleName: "Carpetas de Arranque",
		videos: [
			{
				title: "Carga de documentos Basicos",
				description: "Tutorial de como agregar documentos en la carpeta basica.",
				url: "https://youtube.com/embed/Z5Ha0mmPVII",
			},
			{
				title: "Agregar Colaborador",
				description: "Tutorial de como agregar un colaborador correctamente.",
				url: "https://youtube.com/embed/j_UqQYTPpik",
			},
			{
				title: "Carga de documentos",
				description: "Tutorial de como agregar documentos en la carpeta basica.",
				url: "https://youtube.com/embed/Ph2iFqBEmc4",
			},
			{
				title: "Agregar Colaborador (Completa)",
				description: "Tutorial de como agregar un colaborador correctamente.",
				url: "https://youtube.com/embed/HQlXE2gNZDo",
			},
			{
				title: "Agregar Vehículo",
				description: "Tutorial de como agregar un vehiculo correctamente.",
				url: "https://youtube.com/embed/ngYgt8-RQ9k",
			},
		],
	},
	{
		moduleName: "Mi Cuenta",
		videos: [
			{
				title: "Configuración Mi Cuenta",
				description: "Tutorial de como actualizar datos personales correctamente.",
				url: "https://youtube.com/embed/4uRmbU2eoU8",
			},
		],
	},
]

export default function TutorialsPage(): React.ReactElement {
	const [activeVideo, setActiveVideo] = useState<Video | null>(null)

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<ModuleHeader
				title="Videos Tutoriales"
				description="Aprende a usar todas las funcionalidades del sistema con nuestros videos tutoriales organizados por módulos."
				className="from-indigo-600 to-purple-700"
			/>

			<div className="space-y-4">
				<Accordion type="single" collapsible className="w-full space-y-4">
					{tutorialModules.map((module, index) => (
						<AccordionItem
							key={module.moduleName}
							value={`module-${index}`}
							className="bg-background rounded-lg border shadow-sm"
						>
							<AccordionTrigger className="group cursor-pointer px-6 py-4 hover:no-underline">
								<div className="flex items-center gap-3">
									<div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-2">
										<TvMinimalPlayIcon className="h-5 w-5 text-white" />
									</div>
									<div className="text-left">
										<h3 className="text-lg font-semibold group-hover:underline">
											{module.moduleName}
										</h3>
										<p className="text-muted-foreground text-sm">
											{module.videos.length} video{module.videos.length !== 1 ? "s" : ""} disponible
											{module.videos.length !== 1 ? "s" : ""}
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
											className="h-auto cursor-pointer justify-start p-4 text-left transition-colors hover:border-indigo-500 hover:bg-indigo-500/10"
											onClick={() => setActiveVideo(video)}
										>
											<div className="flex w-full items-start gap-3">
												<PlayCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />
												<div className="min-w-0 flex-1">
													<h4 className="text-sm leading-tight font-medium">{video.title}</h4>
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
