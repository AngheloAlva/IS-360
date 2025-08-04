"use client"

import { FolderKanbanIcon } from "lucide-react"

import { useWorkBookMilestones } from "@/project/work-order/hooks/use-work-book-milestones"

import MilestonesForm from "@/project/work-order/components/forms/MilestonesForm"
import MilestoneCards from "@/project/work-order/components/data/MilestoneCards"
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"
import { RequestWorkBookClosure } from "../forms/RequestWorkBookClosure"
import { Skeleton } from "@/shared/components/ui/skeleton"

interface WorkBookMilestonesProps {
	userId: string
	userRole: string
	workOrderId: string
	supervisorId: string
	responsibleId: string
	hasPermission: boolean
	workOrderStartDate: Date
	canRequestClosure: boolean
	hassWorkBookPermission: boolean
}

export default function WorkBookMilestones({
	userId,
	userRole,
	workOrderId,
	supervisorId,
	responsibleId,
	hasPermission,
	canRequestClosure,
	workOrderStartDate,
	hassWorkBookPermission,
}: WorkBookMilestonesProps) {
	const { data, isLoading, isError } = useWorkBookMilestones({ workOrderId, showAll: true })

	const canCreateOrEditMilestones = userId === responsibleId || (data?.milestones?.length ?? 0 > 1)

	if (isLoading) {
		return (
			<Card className="w-full">
				<CardHeader className="flex items-center justify-between">
					<h2 className="text-2xl font-bold">Hitos</h2>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[...Array(3)].map((_, index) => (
							<Skeleton key={index} className="h-48 w-full rounded-lg" />
						))}
					</div>
				</CardContent>
			</Card>
		)
	}

	if (isError) {
		return (
			<Card className="w-full">
				<CardHeader className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-amber-800">Error al cargar los hitos</h2>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-amber-700">
						No se pudieron cargar los hitos. Por favor, intente nuevamente.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="w-full gap-4">
			<CardHeader className="flex flex-row items-center justify-between">
				<h2 className="flex items-center gap-2 text-2xl font-bold">
					<div className="size-10 rounded-md bg-orange-500/10 p-1.5">
						<FolderKanbanIcon className="h-auto w-full text-orange-500" />
					</div>
					Planificación de trabajo
				</h2>

				<div className="flex items-center gap-2">
					{canCreateOrEditMilestones && (
						<MilestonesForm
							workOrderId={workOrderId}
							initialData={data?.milestones}
							workOrderStartDate={workOrderStartDate}
						/>
					)}

					{canRequestClosure ||
						(canRequestClosure && hassWorkBookPermission && (
							<RequestWorkBookClosure workOrderId={workOrderId} userId={userId} />
						))}
				</div>
			</CardHeader>

			<CardContent>
				<MilestoneCards
					userId={userId}
					userRole={userRole}
					workOrderId={workOrderId}
					supervisorId={supervisorId}
					responsibleId={responsibleId}
					hasPermission={hasPermission}
					milestones={data?.milestones || []}
					hassWorkBookPermission={hassWorkBookPermission}
				/>
			</CardContent>
		</Card>
	)
}
