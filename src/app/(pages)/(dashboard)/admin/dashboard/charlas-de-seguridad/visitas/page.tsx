import { PlayCircleIcon, ScrollTextIcon, Share2Icon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"

import ExternalCompanyForm from "@/project/safety-talk/components/forms/ExternalCompanyForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import BackButton from "@/shared/components/BackButton"
import { Button } from "@/shared/components/ui/button"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

import type { Metadata } from "next"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/components/ui/dialog"
import { VisitorTalkMap } from "@/project/safety-talk/components/visitor/VisitorTalkMap"

export const metadata: Metadata = {
	title: "Charla de Visitas - OTC 360",
	description: "Charla de seguridad para visitantes de la planta OTC",
}

export default function VisitorTalk() {
	return (
		<div className="w-full flex-1 space-y-4">
			<div className="rounded-lg bg-linear-to-r from-emerald-600 to-sky-700 p-6 shadow-lg dark:from-emerald-700 dark:to-sky-800">
				<div className="flex items-center justify-start gap-3">
					<BackButton
						href="/admin/dashboard/charlas-de-seguridad"
						className="bg-white/30 text-white hover:bg-white/50"
					/>

					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Charla de Visitas</h1>
						<p className="opacity-90">
							Conoce las instalaciones de la planta OTC y sus protocolos de seguridad
						</p>
					</div>
				</div>
			</div>

			<Tabs>
				<TabsList className="w-full">
					<TabsTrigger value="prs">Inducción Visitas Hualpén</TabsTrigger>
					<TabsTrigger value="trm">Inducción Visitas El Avellano</TabsTrigger>
					<TabsTrigger value="irl">Inducción de Seguridad OTC</TabsTrigger>
					<TabsTrigger value="external-company">Compartir con Empresa Externa</TabsTrigger>
					<TabsTrigger value="interactive-map">Mapa Interactivo</TabsTrigger>
				</TabsList>

				<TabsContent value="prs">
					<Dialog>
						<DialogTrigger className="relative flex h-175 w-full content-center items-center justify-center rounded-lg">
							<Image
								fill
								alt="Visitor talk background"
								className="rounded-lg object-cover"
								src="/images/visitor-talk-front.png"
							/>
							<div className="absolute z-10 rounded-full bg-black/50 p-2">
								<PlayCircleIcon className="size-12 text-sky-500" />
							</div>
						</DialogTrigger>

						<DialogContent className="sm:max-w-5xl">
							<DialogHeader>
								<DialogTitle>Inducción Visitas Hualpén</DialogTitle>
							</DialogHeader>
							<div className="aspect-video overflow-hidden rounded-md">
								<iframe
									src={"https://drive.google.com/file/d/1E4DVzsswWu2GfXNGqRTdAgIjWPLt1Zty/preview"}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowFullScreen
									className="h-full w-full"
								/>
							</div>
						</DialogContent>
					</Dialog>

					<div className="mt-6 flex justify-center gap-4">
						<Link
							href={`/admin/dashboard/charlas-de-seguridad/evaluacion/${SAFETY_TALK_CATEGORY.VISITOR}`}
						>
							<Button className="w-full font-semibold" size={"lg"}>
								Realizar Evaluación
							</Button>
						</Link>
					</div>
				</TabsContent>

				<TabsContent value="trm">
					<Dialog>
						<DialogTrigger className="relative flex h-175 w-full content-center items-center justify-center rounded-lg">
							<Image
								fill
								alt="Visitor talk background"
								className="rounded-lg object-cover"
								src="/images/visitor-talk-front-trm.png"
							/>
							<div className="absolute z-10 rounded-full bg-black/50 p-2">
								<PlayCircleIcon className="size-12 text-sky-500" />
							</div>
						</DialogTrigger>

						<DialogContent className="sm:max-w-5xl">
							<DialogHeader>
								<DialogTitle>Inducción Visitas El Avellano</DialogTitle>
							</DialogHeader>
							<div className="aspect-video overflow-hidden rounded-md">
								<iframe
									src={"https://drive.google.com/file/d/18JdWOulPeWZ3nlNQbTRm6-KLCvIrJ0kO/preview"}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowFullScreen
									className="h-full w-full"
								/>
							</div>
						</DialogContent>
					</Dialog>

					<div className="mt-6 flex justify-center gap-4">
						<Link
							href={`/admin/dashboard/charlas-de-seguridad/evaluacion/${SAFETY_TALK_CATEGORY.VISITOR_TRM}`}
						>
							<Button className="w-full font-semibold" size={"lg"}>
								Realizar Evaluación
							</Button>
						</Link>
					</div>
				</TabsContent>

				<TabsContent value="irl">
					<Dialog>
						<DialogTrigger className="relative flex h-175 w-full content-center items-center justify-center rounded-lg">
							<Image
								fill
								src="/images/irl-front.png"
								alt="Visitor talk background"
								className="rounded-lg object-cover"
							/>
							<div className="absolute z-10 rounded-full bg-black/50 p-2">
								<PlayCircleIcon className="size-12 text-sky-500" />
							</div>
						</DialogTrigger>

						<DialogContent className="sm:max-w-5xl">
							<DialogHeader>
								<DialogTitle>Inducción de Seguridad OTC</DialogTitle>
							</DialogHeader>
							<div className="aspect-video overflow-hidden rounded-md">
								<iframe
									src={"https://drive.google.com/file/d/18oo_pah1HVf3TtDPOpCvMMm6b6pzCrot/preview"}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowFullScreen
									className="h-full w-full"
								/>
							</div>
						</DialogContent>
					</Dialog>

					<div className="mt-6 flex justify-center gap-4">
						<Link
							href={`/admin/dashboard/charlas-de-seguridad/evaluacion/${SAFETY_TALK_CATEGORY.IRL}`}
						>
							<Button className="w-full font-semibold" size={"lg"}>
								Realizar Evaluación IRL
							</Button>
						</Link>
					</div>
				</TabsContent>

				<TabsContent value="external-company">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									Compartir con Empresa Externa
									<div className="mt-0.5 rounded-full bg-amber-500/80 px-1.5 text-xs font-semibold text-white">
										Funcionalidad de Prueba
									</div>
								</CardTitle>
								<CardDescription>
									Genera un enlace único para que empresas externas accedan a la charla de seguridad
								</CardDescription>
							</div>

							<div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
								<Share2Icon className="size-6" />
							</div>
						</CardHeader>

						<CardContent>
							<div className="space-y-4">
								<div className="rounded-md bg-emerald-500/10 p-4 text-emerald-600">
									<div className="ml-1">
										<h3 className="text-sm font-semibold">Funcionalidad de Compartir:</h3>
										<div className="mt-2 text-sm">
											<ul className="list-disc space-y-1 pl-5">
												<li>
													Ingresa los datos de la empresa externa y los correos de los
													participantes.
												</li>
												<li>Se generará un enlace único que podrás compartir con la empresa.</li>
												<li>Cada participante completará sus datos y podrá acceder a la charla.</li>
											</ul>
										</div>
									</div>
								</div>

								<div className="flex justify-center">
									<ExternalCompanyForm />
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="interactive-map" className="space-y-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle className="text-xl">Instrucciones</CardTitle>
								<CardDescription>
									Este mapa interactivo te permite conocer las diferentes áreas de la planta OTC y
									los protocolos de seguridad asociados.
								</CardDescription>
							</div>

							<div className="rounded-lg bg-sky-500/10 p-2 text-sky-600">
								<ScrollTextIcon className="size-6" />
							</div>
						</CardHeader>

						<CardContent>
							<div className="space-y-4">
								<div className="rounded-md bg-cyan-500/10 p-4 text-cyan-600">
									<div className="ml-1">
										<h3 className="text-sm font-semibold">Cómo utilizar el mapa:</h3>
										<div className="mt-2 text-sm">
											<ul className="list-disc space-y-1 pl-5">
												<li>
													Pasa el cursor sobre los puntos con el icono de información para ver el
													nombre de cada área.
												</li>
												<li>
													Haz clic en cualquier punto para ver el video informativo correspondiente.
												</li>
												<li>
													Es importante que visualices todos los videos para conocer los protocolos
													de seguridad.
												</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Mapa de la Planta OTC</CardTitle>
							<CardDescription>
								Haz clic en los puntos para ver videos con información detallada
							</CardDescription>
						</CardHeader>

						<CardContent>
							<VisitorTalkMap />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
