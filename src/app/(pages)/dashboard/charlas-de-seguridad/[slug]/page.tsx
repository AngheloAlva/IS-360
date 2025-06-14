import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { notFound } from "next/navigation"
import { Calendar, Check, FileText, Play, Timer } from "lucide-react"

import { getSafetyTalkBySlug } from "@/features/safety-talk/actions/get-safety-talks"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import { RESOURCE_TYPE } from "@prisma/client"

export default async function SafetyTalkDetailsPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const safetyTalk = await getSafetyTalkBySlug(slug)

	if (!safetyTalk) {
		notFound()
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-4 lg:flex-row">
				<div>
					<div className="mb-1 flex items-center gap-2">
						<h1 className="text-2xl font-bold">{safetyTalk.title}</h1>
						<Badge variant={safetyTalk.isPresential ? "outline" : "secondary"}>
							{safetyTalk.isPresential ? "Presencial" : "Online"}
						</Badge>
					</div>
					<p className="text-muted-foreground">{safetyTalk.description || "Sin descripción"}</p>
				</div>

				<div className="flex gap-3">
					{!safetyTalk.isPresential && (
						<Button className="gap-2" asChild>
							<Link href={`/dashboard/charlas-de-seguridad/${safetyTalk.slug}/realizar`}>
								<Play className="h-4 w-4" />
								Realizar charla
							</Link>
						</Button>
					)}

					<Button variant="outline" className="gap-2" asChild>
						<Link href="/dashboard/charlas-de-seguridad">Volver</Link>
					</Button>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-4">
					<div>
						<h2 className="mb-4 text-xl font-semibold">Información de la charla</h2>
						<div className="space-y-3">
							<div className="text-muted-foreground flex items-center gap-2">
								<Check className="h-5 w-5 text-green-600" />
								<span>Puntaje mínimo requerido: {safetyTalk.minimumScore}%</span>
							</div>

							{safetyTalk.timeLimit && (
								<div className="text-muted-foreground flex items-center gap-2">
									<Timer className="h-5 w-5 text-blue-600" />
									<span>Tiempo límite: {safetyTalk.timeLimit} minutos</span>
								</div>
							)}

							<div className="text-muted-foreground flex items-center gap-2">
								<Calendar className="h-5 w-5 text-amber-600" />
								<span>
									Fecha de vencimiento:{" "}
									{format(new Date(safetyTalk.expiresAt), "dd 'de' MMMM, yyyy", { locale: es })}
								</span>
							</div>

							<div className="text-muted-foreground flex items-center gap-2">
								<FileText className="h-5 w-5 text-indigo-600" />
								<span>Cantidad de preguntas: {safetyTalk.questions.length}</span>
							</div>
						</div>
					</div>

					{safetyTalk.isPresential && (
						<div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
							<h3 className="mb-2 font-medium text-amber-800">Charla presencial</h3>
							<p className="text-sm text-amber-700">
								Esta charla debe ser realizada de forma presencial. Contacta a tu supervisor para
								coordinar la fecha y hora.
							</p>
						</div>
					)}
				</div>

				<div>
					<h2 className="mb-4 text-xl font-semibold">Recursos disponibles</h2>
					{safetyTalk.resources.length > 0 ? (
						<div className="space-y-3">
							{safetyTalk.resources.map((resource) => (
								<div key={resource.id} className="flex items-center gap-3 rounded-md border p-3">
									<div className="rounded-md bg-blue-100 p-2 text-blue-700">
										<FileText className="h-5 w-5" />
									</div>
									<div className="flex-grow">
										<p className="font-medium">{resource.title}</p>
										<p className="text-muted-foreground text-sm">
											{resource.type === RESOURCE_TYPE.DOCUMENT ? "Documento" : "Enlace externo"}
										</p>
									</div>
									<Button size="sm" variant="outline" asChild>
										<Link href={resource.url} target="_blank" rel="noopener noreferrer">
											Ver
										</Link>
									</Button>
								</div>
							))}
						</div>
					) : (
						<p className="text-muted-foreground">No hay recursos disponibles para esta charla.</p>
					)}
				</div>
			</div>

			<Separator />

			<div>
				<h2 className="mb-4 text-xl font-semibold">Instrucciones</h2>
				<div className="space-y-4">
					<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
						<h3 className="mb-2 font-medium text-blue-800">Antes de comenzar</h3>
						<ul className="list-disc space-y-1 pl-5 text-sm text-blue-700">
							<li>
								Asegúrate de tener suficiente tiempo para completar la charla sin interrupciones.
							</li>
							<li>Revisa todos los materiales y recursos proporcionados.</li>
							<li>Necesitarás obtener al menos {safetyTalk.minimumScore}% para aprobar.</li>
							{safetyTalk.timeLimit && (
								<li>
									Tienes un límite de {safetyTalk.timeLimit} minutos para completar la evaluación.
								</li>
							)}
						</ul>
					</div>

					{!safetyTalk.isPresential && (
						<div className="flex justify-center">
							<Button size="lg" className="gap-2" asChild>
								<Link href={`/dashboard/charlas-de-seguridad/${safetyTalk.slug}/realizar`}>
									<Play className="h-4 w-4" />
									Comenzar charla
								</Link>
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
