"use client"

import { Calendar, CheckCircle, Clock, ExternalLink, Play } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import Link from "next/link"

import { useContractorSafetyTalks } from "@/project/safety-talk/hooks/use-contractor-safety-talks"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Progress } from "@/shared/components/ui/progress"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
	Card,
	CardTitle,
	CardHeader,
	CardFooter,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

export function ContractorSafetyTalkList() {
	const [activeTab, setActiveTab] = useState("available")
	const { data, isLoading, isError, refetch } = useContractorSafetyTalks()

	// Esta función permite cambiar entre tabs y potencialmente podemos agregar más lógica en el futuro
	const handleTabChange = (value: string) => {
		setActiveTab(value)
		// El activeTab se usa en el JSX para controlar la visualización condicional
	}

	if (isError) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Error</CardTitle>
					<CardDescription>Ocurrió un error al cargar las charlas de seguridad</CardDescription>
				</CardHeader>
				<CardFooter>
					<Button onClick={() => refetch()}>Intentar nuevamente</Button>
				</CardFooter>
			</Card>
		)
	}

	return (
		<Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
			<TabsList className="mb-6 grid w-full grid-cols-2">
				<TabsTrigger value="available" className="text-center">
					Charlas disponibles
				</TabsTrigger>
				<TabsTrigger value="completed" className="text-center">
					Charlas completadas
				</TabsTrigger>
			</TabsList>

			<TabsContent value="available" className="mt-0">
				{isLoading ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[...Array(3)].map((_, i) => (
							<Card key={i} className="overflow-hidden">
								<CardHeader className="pb-3">
									<Skeleton className="mb-2 h-6 w-3/4" />
									<Skeleton className="h-4 w-full" />
								</CardHeader>
								<CardContent className="space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
								</CardContent>
								<CardFooter>
									<Skeleton className="h-9 w-full" />
								</CardFooter>
							</Card>
						))}
					</div>
				) : data?.availableTalks && data.availableTalks.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{data.availableTalks.map((talk) => (
							<Card key={talk.id} className="flex flex-col overflow-hidden">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<CardTitle className="text-lg">{talk.title}</CardTitle>
										<Badge
											variant="outline"
											className={
												talk.isPresential
													? "border-green-200 bg-green-100 text-green-800"
													: "border-blue-200 bg-blue-100 text-blue-800"
											}
										>
											{talk.isPresential ? "Presencial" : "Online"}
										</Badge>
									</div>
									<CardDescription>{talk.description || "Sin descripción"}</CardDescription>
								</CardHeader>
								<CardContent className="flex-grow space-y-2 text-sm">
									<div className="text-muted-foreground flex items-center">
										<Clock className="mr-2 h-4 w-4" />
										<span>Puntaje mínimo: {talk.minimumScore}%</span>
									</div>
									<div className="text-muted-foreground flex items-center">
										<Calendar className="mr-2 h-4 w-4" />
										<span>
											Vence:{" "}
											{format(new Date(talk.expiresAt), "dd 'de' MMMM, yyyy", { locale: es })}
										</span>
									</div>
								</CardContent>
								<CardFooter>
									{talk.isPresential ? (
										<Button variant="outline" className="w-full" asChild>
											<Link href={`/dashboard/charlas-de-seguridad/${talk.slug}`}>
												<ExternalLink className="mr-2 h-4 w-4" />
												Ver detalles
											</Link>
										</Button>
									) : (
										<Button className="w-full" asChild>
											<Link href={`/dashboard/charlas-de-seguridad/${talk.slug}/realizar`}>
												<Play className="mr-2 h-4 w-4" />
												Realizar charla
											</Link>
										</Button>
									)}
								</CardFooter>
							</Card>
						))}
					</div>
				) : (
					<Card>
						<CardHeader>
							<CardTitle>No hay charlas disponibles</CardTitle>
							<CardDescription>
								Actualmente no hay charlas de seguridad disponibles para realizar.
							</CardDescription>
						</CardHeader>
					</Card>
				)}
			</TabsContent>

			<TabsContent value="completed" className="mt-0">
				{isLoading ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[...Array(3)].map((_, i) => (
							<Card key={i} className="overflow-hidden">
								<CardHeader className="pb-3">
									<Skeleton className="mb-2 h-6 w-3/4" />
									<Skeleton className="h-4 w-full" />
								</CardHeader>
								<CardContent className="space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
								</CardContent>
								<CardFooter>
									<Skeleton className="h-9 w-full" />
								</CardFooter>
							</Card>
						))}
					</div>
				) : data?.completedTalks && data.completedTalks.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{data.completedTalks.map((talk) => (
							<Card key={talk.id} className="flex flex-col overflow-hidden">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<CardTitle className="text-lg">{talk.title}</CardTitle>
										<Badge variant={talk.userSafetyTalk?.passed ? "default" : "destructive"}>
											{talk.userSafetyTalk?.passed ? "Aprobada" : "No aprobada"}
										</Badge>
									</div>
									<CardDescription>{talk.description || "Sin descripción"}</CardDescription>
								</CardHeader>
								<CardContent className="flex-grow space-y-4 text-sm">
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">Puntaje obtenido:</span>
											<span className="font-medium">{talk.userSafetyTalk?.score || 0}%</span>
										</div>
										<Progress
											value={talk.userSafetyTalk?.score || 0}
											className={talk.userSafetyTalk?.passed ? "bg-green-100" : "bg-red-100"}
										/>
										<div className="text-muted-foreground flex justify-between text-xs">
											<span>0%</span>
											<span>Mínimo: {talk.minimumScore}%</span>
											<span>100%</span>
										</div>
									</div>

									{talk.userSafetyTalk && (
										<>
											<div className="text-muted-foreground flex items-center">
												<CheckCircle className="mr-2 h-4 w-4" />
												<span>
													Completada:{" "}
													{format(new Date(talk.userSafetyTalk.completedAt), "dd/MM/yyyy", {
														locale: es,
													})}
												</span>
											</div>
											<div className="text-muted-foreground flex items-center">
												<Calendar className="mr-2 h-4 w-4" />
												<span>
													Válida hasta:{" "}
													{format(new Date(talk.userSafetyTalk.expiresAt), "dd/MM/yyyy", {
														locale: es,
													})}
												</span>
											</div>
										</>
									)}
								</CardContent>
								<CardFooter>
									<Button variant="outline" className="w-full" asChild>
										<Link href={`/dashboard/charlas-de-seguridad/${talk.slug}`}>
											<ExternalLink className="mr-2 h-4 w-4" />
											Ver detalles
										</Link>
									</Button>
								</CardFooter>
							</Card>
						))}
					</div>
				) : (
					<Card>
						<CardHeader>
							<CardTitle>No hay charlas completadas</CardTitle>
							<CardDescription>
								Todavía no has completado ninguna charla de seguridad.
							</CardDescription>
						</CardHeader>
						<CardFooter>
							<Button variant="outline" onClick={() => setActiveTab("available")}>
								Ver charlas disponibles
							</Button>
						</CardFooter>
					</Card>
				)}
			</TabsContent>
		</Tabs>
	)
}
