"use client"

import { ClockIcon, UsersIcon, ListCheckIcon, CheckCircleIcon, InfoIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import { MILESTONE_STATUS_LABELS } from "@/lib/consts/milestone-status"
import { MILESTONE_STATUS } from "@prisma/client"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RequestCloseMilestoneDialog from "./RequestCloseMilestoneDialog"
import CloseMilestoneDialog from "./CloseMilestoneDialog"
import { Badge } from "@/components/ui/badge"

import type { Milestone } from "@/hooks/work-orders/use-work-book-milestones"
import { USER_ROLE } from "@/lib/permissions"

interface MilestoneCardsProps {
	userId: string
	userRole: string
	milestones: Milestone[]
}

export default function MilestoneCards({ userId, userRole, milestones }: MilestoneCardsProps) {
	if (milestones.length === 0) {
		return (
			<div className="bg-primary/10 border-primary flex flex-col items-center justify-center rounded-md border p-8 text-center">
				<h3 className="text-lg font-medium">No hay hitos definidos</h3>

				{userRole === USER_ROLE.admin ? (
					<p className="text-muted-foreground mt-2">
						El supervisor de la obra debe agregar hitos y actividades a este libro de obras.
					</p>
				) : (
					<p className="text-muted-foreground mt-2">
						Utiliza el botón &quot;Agregar Hitos&quot; para agregar hitos y actividades a este libro
						de obras.
					</p>
				)}
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
				{milestones.map((milestone) => (
					<Card key={milestone.id}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1">
									<CardTitle className="text-lg font-bold">{milestone.name}</CardTitle>
									{milestone.isCompleted && (
										<CheckCircleIcon className="ml-1 h-4 w-4 text-green-500" />
									)}
								</div>
								<Badge
									variant="outline"
									className={cn("border-red-500/20 bg-red-500/10 text-red-500", {
										"border-yellow-500/20 bg-yellow-500/10 text-yellow-500":
											milestone.status === MILESTONE_STATUS.IN_PROGRESS,
										"border-green-500/20 bg-green-500/10 text-green-600":
											milestone.status === MILESTONE_STATUS.COMPLETED,
										"border-teal-500/20 bg-teal-500/10 text-teal-500":
											milestone.status === MILESTONE_STATUS.REQUESTED_CLOSURE,
									})}
								>
									{MILESTONE_STATUS_LABELS[milestone.status]}
								</Badge>
							</div>
							{milestone.description && (
								<CardDescription className="text-sm">{milestone.description}</CardDescription>
							)}
						</CardHeader>

						<CardContent className="flex h-full flex-col">
							<div className="text-muted-foreground text-sm">
								<div className="grid grid-cols-2 gap-2">
									{milestone.startDate && (
										<div className="flex items-center gap-1">
											<ClockIcon className="h-3 w-3" />
											<span>
												Inicio:{" "}
												{format(new Date(milestone.startDate), "dd MMM yyyy", {
													locale: es,
												})}
											</span>
										</div>
									)}
									{milestone.endDate && (
										<div className="flex items-center gap-1">
											<ClockIcon className="h-3 w-3" />
											<span>
												Fin:{" "}
												{format(new Date(milestone.endDate), "dd MMM yyyy", {
													locale: es,
												})}
											</span>
										</div>
									)}
								</div>
							</div>

							<div className="my-8">
								<h4 className="flex items-center gap-1 text-base font-bold">
									<ListCheckIcon className="h-4 w-4" />
									Actividades <span className="text-sm">({milestone.activities?.length})</span>
								</h4>
								{milestone.activities.length === 0 ? (
									<p className="text-muted-foreground mt-2 text-center text-sm">
										No hay actividades relacionadas a este hito
									</p>
								) : (
									<div className="mt-2 space-y-4">
										{milestone.activities.map((activity) => (
											<div key={activity.id} className="border-input rounded-lg border p-3">
												<div className="flex items-center justify-between">
													<div className="flex-1">
														<div className="flex items-center gap-2">
															<div className="grid gap-0.5">
																<div className="flex items-center">
																	<span className="text-sm leading-none font-semibold">
																		{activity.activityName}
																	</span>
																	<CheckCircleIcon className="ml-2 h-4 w-4 text-green-500" />
																</div>

																<p className="text-muted-foreground text-sm">
																	Realizada el{" "}
																	{format(new Date(activity.executionDate), "dd MMM yyyy", {
																		locale: es,
																	})}
																</p>
															</div>
														</div>
													</div>
												</div>

												<div className="text-muted-foreground mt-3 text-sm">
													{activity.comments && (
														<div className="mb-3">
															<p>{activity.comments}</p>
														</div>
													)}

													<div className="grid grid-cols-2 gap-2">
														{activity._count.assignedUsers > 0 && (
															<div className="flex items-center gap-2">
																<UsersIcon className="h-3 w-3" />
																<div>
																	<span className="text-sm">
																		{activity._count.assignedUsers} persona
																		{activity._count.assignedUsers !== 1 ? "s" : ""}
																	</span>
																</div>
															</div>
														)}

														{activity.activityStartTime && activity.activityEndTime && (
															<div className="flex items-center gap-2">
																<ClockIcon className="h-3 w-3" />
																<div>
																	<span className="text-sm">
																		Horario: {activity.activityStartTime} -{" "}
																		{activity.activityEndTime}
																	</span>
																</div>
															</div>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{milestone.closureComment && (
								<div className="mt-auto mb-2 flex items-center gap-2">
									<InfoIcon
										className={cn("h-4 min-h-4 w-4 min-w-4", {
											"text-green-500": milestone.status === MILESTONE_STATUS.COMPLETED,
											"text-red-500": milestone.status === MILESTONE_STATUS.IN_PROGRESS,
										})}
									/>
									<p className="text-muted-foreground text-sm">
										<strong>Comentario de cierre:</strong> {milestone.closureComment}
									</p>
								</div>
							)}

							{milestone.status === MILESTONE_STATUS.IN_PROGRESS && (
								<RequestCloseMilestoneDialog milestoneId={milestone.id} userId={userId} />
							)}

							{milestone.status === MILESTONE_STATUS.REQUESTED_CLOSURE &&
								userRole !== "partnerCompany" && (
									<CloseMilestoneDialog userId={userId} milestoneId={milestone.id} />
								)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
