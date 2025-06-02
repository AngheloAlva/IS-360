"use client"

import { useWorkBookMilestones } from "@/hooks/work-orders/use-work-book-milestones"

import MilestoneCards from "@/components/sections/work-book/MilestoneCards"
import MilestonesForm from "@/components/forms/work-book/MilestonesForm"
import { Skeleton } from "@/components/ui/skeleton"

interface WorkBookMilestonesProps {
	userId: string
	userRole: string
	workOrderId: string
	workOrderStartDate: Date
}

export default function WorkBookMilestones({
	userId,
	userRole,
	workOrderId,
	workOrderStartDate,
}: WorkBookMilestonesProps) {
	const { data, isLoading, isError } = useWorkBookMilestones({ workOrderId, showAll: true })

	if (isLoading) {
		return (
			<div className="w-full space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold">Hitos</h2>
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(3)].map((_, index) => (
						<Skeleton key={index} className="h-48 w-full rounded-lg" />
					))}
				</div>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="w-full rounded-md border border-amber-200 bg-amber-50 p-4">
				<h2 className="text-lg font-semibold text-amber-800">Error al cargar los hitos</h2>
				<p className="text-sm text-amber-700">
					No se pudieron cargar los hitos. Por favor, intente nuevamente.
				</p>
			</div>
		)
	}

	return (
		<div className="w-full space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Hitos y Actividades</h2>
				{data?.milestones.length === 0 && (
					<MilestonesForm workOrderId={workOrderId} workOrderStartDate={workOrderStartDate} />
				)}
			</div>

			<MilestoneCards
				userId={userId}
				userRole={userRole}
				workOrderId={workOrderId}
				milestones={data?.milestones || []}
			/>
		</div>
	)
}
