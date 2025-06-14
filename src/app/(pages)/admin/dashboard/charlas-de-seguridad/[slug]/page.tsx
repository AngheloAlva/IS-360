/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, Clock, Pencil, Percent, UserCheck } from "lucide-react"

import { getSafetyTalkBySlug } from "@/features/safety-talk/actions/get-safety-talks"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

interface SafetyTalkPageProps {
	params: Promise<{
		slug: string
	}>
}

export default async function SafetyTalkPage({ params }: SafetyTalkPageProps) {
	const { slug } = await params
	const safetyTalk = await getSafetyTalkBySlug(slug)

	if (!safetyTalk) {
		notFound()
	}

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-6 transition-all">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" asChild>
						<Link href="/admin/dashboard/charlas-de-seguridad">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<h1 className="w-fit text-3xl font-bold">{safetyTalk.title}</h1>
						<p className="text-muted-foreground">{safetyTalk.description}</p>
					</div>
				</div>
				<Button asChild>
					<Link href={`/admin/dashboard/charlas-de-seguridad/${slug}/editar`}>
						<Pencil className="mr-2 h-4 w-4" />
						Editar charla
					</Link>
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Modalidad</CardTitle>
					</CardHeader>
					<CardContent>
						<Badge
							className={
								safetyTalk.isPresential
									? "bg-green-100 text-green-800"
									: "bg-blue-100 text-blue-800"
							}
						>
							{safetyTalk.isPresential ? "Presencial" : "Online"}
						</Badge>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Tiempo límite</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center">
						<Clock className="text-muted-foreground mr-2 h-4 w-4" />
						<span>
							{safetyTalk.timeLimit ? `${safetyTalk.timeLimit} minutos` : "Sin límite de tiempo"}
						</span>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Puntaje mínimo</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center">
						<Percent className="text-muted-foreground mr-2 h-4 w-4" />
						<span>{safetyTalk.minimumScore}%</span>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Fecha de expiración</CardTitle>
					</CardHeader>
					<CardContent>
						{format(new Date(safetyTalk.expiresAt), "dd 'de' MMMM, yyyy", { locale: es })}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Preguntas</CardTitle>
					</CardHeader>
					<CardContent>{safetyTalk._count?.questions || 0} preguntas</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Completada por</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center">
						<UserCheck className="text-muted-foreground mr-2 h-4 w-4" />
						<span>{safetyTalk._count?.userSafetyTalks || 0} usuarios</span>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="resources" className="w-full">
				<TabsList>
					<TabsTrigger value="resources">Recursos</TabsTrigger>
					<TabsTrigger value="questions">Preguntas</TabsTrigger>
					<TabsTrigger value="users">Usuarios que completaron</TabsTrigger>
				</TabsList>

				<TabsContent value="resources">
					<Card>
						<CardHeader>
							<CardTitle>Recursos disponibles</CardTitle>
						</CardHeader>
						<CardContent>
							{safetyTalk.resources.length === 0 ? (
								<p className="text-muted-foreground">
									No hay recursos disponibles para esta charla.
								</p>
							) : (
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{safetyTalk.resources.map((resource) => (
										<Card key={resource.id} className="overflow-hidden">
											<div className="bg-muted flex h-40 items-center justify-center">
												<div className="p-4 text-center">
													<p className="font-medium">{resource.title}</p>
													<p className="text-muted-foreground text-sm">{resource.type}</p>
												</div>
											</div>
											<CardContent className="p-4">
												<Button variant="outline" className="w-full" asChild>
													<a href={resource.url} target="_blank" rel="noopener noreferrer">
														Ver recurso
													</a>
												</Button>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="questions">
					<Card>
						<CardHeader>
							<CardTitle>Preguntas de la charla</CardTitle>
						</CardHeader>
						<CardContent>
							{safetyTalk.questions.length === 0 ? (
								<p className="text-muted-foreground">
									No hay preguntas definidas para esta charla.
								</p>
							) : (
								<div className="space-y-6">
									{safetyTalk.questions.map((question, index) => (
										<div key={question.id} className="space-y-2">
											<div className="flex items-start gap-2">
												<Badge variant="outline" className="mt-0.5">
													P{index + 1}
												</Badge>
												<div>
													<h3 className="font-medium">{question.question}</h3>
													{question.description && (
														<p className="text-muted-foreground text-sm">{question.description}</p>
													)}
												</div>
											</div>

											{question.imageUrl && (
												<div className="mt-2">
													<img
														src={question.imageUrl}
														alt={`Imagen para pregunta ${index + 1}`}
														className="max-h-40 rounded-md object-contain"
													/>
												</div>
											)}

											<div className="mt-4 pl-8">
												<p className="mb-2 text-sm font-medium">Tipo: {question.type}</p>
												{question.options.length > 0 && (
													<div className="space-y-2">
														<p className="text-sm font-medium">Opciones:</p>
														<ul className="space-y-1 pl-4">
															{question.options.map((option) => (
																<li
																	key={option.id}
																	className={`text-sm ${option.isCorrect ? "font-medium text-green-600" : ""}`}
																>
																	{option.text} {option.isCorrect && "(Correcta)"}
																	{option.zoneLabel && ` - Zona: ${option.zoneLabel}`}
																</li>
															))}
														</ul>
													</div>
												)}
											</div>

											{index < safetyTalk.questions.length - 1 && <Separator className="my-4" />}
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="users">
					<Card>
						<CardHeader>
							<CardTitle>Usuarios que completaron la charla</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								{safetyTalk._count?.userSafetyTalks
									? `${safetyTalk._count.userSafetyTalks} usuarios han completado esta charla.`
									: "Ningún usuario ha completado esta charla todavía."}
							</p>
							{/* Aquí se podría implementar una tabla con los usuarios que completaron la charla */}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
