"use client"

import { type CompanyUser } from "@/hooks/use-companies"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface SafetyTalksInfoProps {
	users: CompanyUser[]
}

export default function SafetyTalksInfo({ users }: SafetyTalksInfoProps) {
	// Agrupar todas las charlas únicas
	const allTalks = Array.from(
		new Set(users.flatMap((user) => user.safetyTalks).map((talk) => talk.id))
	).map((talkId) => {
		const talk = users[0].safetyTalks.find((t) => t.id === talkId)
		if (!talk) throw new Error(`Talk ${talkId} not found`)
		return talk
	})

	return (
		<div className="mt-6 w-full md:col-span-2">
			<h3 className="mb-4 text-lg font-medium">Estado de Charlas de Seguridad</h3>
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Charla</TableHead>
							<TableHead>Puntaje Mínimo</TableHead>
							<TableHead>Tipo</TableHead>
							<TableHead>Estado por Usuario</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{allTalks.map((talk) => (
							<TableRow key={talk.id}>
								<TableCell>{talk.title}</TableCell>
								<TableCell>{talk.minimumScore}%</TableCell>
								<TableCell>
									<Badge variant={talk.isPresential ? "default" : "secondary"}>
										{talk.isPresential ? "Presencial" : "Virtual"}
									</Badge>
								</TableCell>
								<TableCell>
									<div className="space-y-2">
										{users.map((user) => {
											const userTalk = user.safetyTalks.find((t) => t.id === talk.id)
											return (
												<div key={user.id} className="flex items-center gap-2">
													<span className="text-sm font-medium">{user.name}:</span>
													{userTalk?.completed ? (
														<div className="flex items-center gap-2">
															<Badge variant={userTalk.passed ? "default" : "destructive"}>
																{userTalk.score}% - {userTalk.passed ? "Aprobado" : "Reprobado"}
															</Badge>
															{userTalk.completedAt && (
																<span className="text-muted-foreground text-xs">
																	Completado el{" "}
																	{format(new Date(userTalk.completedAt), "dd/MM/yyyy")}
																</span>
															)}
															{userTalk.expiresAt && new Date(userTalk.expiresAt) < new Date() && (
																<Badge variant="destructive">Expirado</Badge>
															)}
														</div>
													) : (
														<Badge variant="outline">Pendiente</Badge>
													)}
												</div>
											)
										})}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
