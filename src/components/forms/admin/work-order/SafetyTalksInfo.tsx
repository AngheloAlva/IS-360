"use client"

import { format } from "date-fns"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

import type { CompanyUser } from "@/hooks/companies/use-companies"

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
								<TableCell className="font-semibold">{talk.title}</TableCell>
								<TableCell>{talk.minimumScore}%</TableCell>
								<TableCell>
									<Badge
										className={cn({
											"bg-green-500/10 text-green-500": talk.isPresential,
											"bg-purple-500/10 text-purple-500": !talk.isPresential,
										})}
									>
										{talk.isPresential ? "Presencial" : "Online"}
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
															<Badge
																className={cn({
																	"bg-green-500/10 text-green-500": userTalk.passed,
																	"bg-red-500/10 text-red-500": !userTalk.passed,
																})}
															>
																{userTalk.score}% - {userTalk.passed ? "Aprobado" : "Reprobado"}
															</Badge>
															{userTalk.completedAt && (
																<span className="text-muted-foreground text-xs">
																	Completado el{" "}
																	{format(new Date(userTalk.completedAt), "dd/MM/yyyy")}
																</span>
															)}
															{userTalk.expiresAt && new Date(userTalk.expiresAt) < new Date() && (
																<Badge className="bg-red-500/10 text-red-500">Expirado</Badge>
															)}
														</div>
													) : (
														<Badge className="bg-amber-500/10 text-amber-500">Pendiente</Badge>
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
