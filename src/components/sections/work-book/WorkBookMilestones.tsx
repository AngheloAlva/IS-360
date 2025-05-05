"use client"

import { useWorkBookMilestones } from "@/hooks/work-orders/use-work-book-milestones"
import { USER_ROLE } from "@prisma/client"

import MilestonesForm from "@/components/forms/work-book/MilestonesForm"
import MilestoneCards from "@/components/ui/work-book/MilestoneCards"
import { Skeleton } from "@/components/ui/skeleton"

interface WorkBookMilestonesProps {
	workOrderId: string
	userRole: USER_ROLE
}

export default function WorkBookMilestones({ workOrderId, userRole }: WorkBookMilestonesProps) {
	const { data, isLoading, isError } = useWorkBookMilestones(workOrderId)

	if (isLoading) {
		return (
			<div className="w-full space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold">Hitos y Actividades</h2>
					{userRole === USER_ROLE.SUPERVISOR && <Skeleton className="h-10 w-40" />}
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
				{userRole === USER_ROLE.SUPERVISOR && data?.milestones.length === 0 && (
					<MilestonesForm workOrderId={workOrderId} />
				)}
			</div>

			<MilestoneCards milestones={data?.milestones || []} />
		</div>
	)
}
