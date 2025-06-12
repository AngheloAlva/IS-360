"use client"

import { useWorkBookMilestones } from "@/hooks/work-orders/use-work-book-milestones"

import MilestoneCards from "@/components/sections/work-book/MilestoneCards"
import MilestonesForm from "@/components/forms/work-book/MilestonesForm"
import { RequestWorkBookClosure } from "./RequestWorkBookClosure"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { FolderKanbanIcon } from "lucide-react"

interface WorkBookMilestonesProps {
	userId: string
	userRole: string
	workOrderId: string
	supervisorId: string
	workOrderStartDate: Date
	canRequestClosure: boolean
}

export default function WorkBookMilestones({
	userId,
	userRole,
	workOrderId,
	supervisorId,
	canRequestClosure,
	workOrderStartDate,
}: WorkBookMilestonesProps) {
	const { data, isLoading, isError } = useWorkBookMilestones({ workOrderId, showAll: true })

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
		<Card className="w-full">
			<CardHeader className="flex flex-row items-center justify-between">
				<h2 className="flex items-center gap-2 text-2xl font-bold">
					<div className="size-10 rounded-md bg-orange-500/10 p-1.5">
						<FolderKanbanIcon className="h-auto w-full text-orange-500" />
					</div>
					Hitos y Actividades
				</h2>

				<div className="flex gap-2">
					{data?.milestones.length === 0 && userId === supervisorId && (
						<MilestonesForm workOrderId={workOrderId} workOrderStartDate={workOrderStartDate} />
					)}

					{canRequestClosure && (
						<RequestWorkBookClosure workOrderId={workOrderId} userId={userId} />
					)}
				</div>
			</CardHeader>

			<CardContent>
				<MilestoneCards
					userId={userId}
					userRole={userRole}
					workOrderId={workOrderId}
					supervisorId={supervisorId}
					milestones={data?.milestones || []}
				/>
			</CardContent>
		</Card>
	)
}
