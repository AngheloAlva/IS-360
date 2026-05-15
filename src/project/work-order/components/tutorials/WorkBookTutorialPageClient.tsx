"use client"

import { useMemo, useState } from "react"

import type { Milestone } from "@/project/work-order/hooks/use-work-book-milestones"
import type { TutorialDefinition, TutorialLink } from "@/project/tutorials/types"
import {
	WORK_BOOK_TUTORIAL_MOCK_DATA,
	WORK_BOOK_TUTORIAL_SLUG,
	type WorkBookTutorialSlug,
	isWorkBookDetailTutorial,
} from "@/project/tutorials/work-book/tutorials"
import { getWorkBookDetailMockByTutorial } from "@/project/tutorials/work-book/detail-mocks"
import { WorkBookTable } from "@/project/work-order/components/data/WorkBookTable"
import WorkBookMain from "@/project/work-order/components/data/WorkBookMain"
import WorkBookTutorialGuide from "@/project/work-order/components/tutorials/WorkBookTutorialGuide"
import TutorialsDropdown from "@/shared/components/TutorialsDropdown"
import ModuleHeader from "@/shared/components/ModuleHeader"

interface WorkBookTutorialPageClientProps {
	tutorial: TutorialDefinition
	tutorials: TutorialLink[]
}

export default function WorkBookTutorialPageClient({
	tutorial,
	tutorials,
}: WorkBookTutorialPageClientProps): React.ReactElement {
	const shouldRenderDetailView = isWorkBookDetailTutorial(tutorial.slug)
	const isCreateWorkBookTutorial = tutorial.slug === WORK_BOOK_TUTORIAL_SLUG.CREATE_WORK_BOOK

	const detailMock = useMemo(
		() => getWorkBookDetailMockByTutorial(tutorial.slug as WorkBookTutorialSlug),
		[tutorial.slug]
	)

	const [tutorialMilestones, setTutorialMilestones] = useState<Milestone[]>(detailMock.milestones)

	const requestedClosureCount = tutorialMilestones.filter(
		(milestone) => milestone.status === "REQUESTED_CLOSURE"
	).length

	const tutorialProgress =
		tutorialMilestones.length === 0
			? 0
			: Math.round((requestedClosureCount / tutorialMilestones.length) * 100)

	return (
		<main className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<ModuleHeader
				title={`Tutorial: ${tutorial.title}`}
				description={tutorial.description}
				backHref="/dashboard/libro-de-obras"
				className="from-orange-600 to-red-700"
			>
				<>
					<TutorialsDropdown tutorials={tutorials} targetId="work-book-tutorial-dropdown" />
					<WorkBookTutorialGuide tutorial={tutorial} />
				</>
			</ModuleHeader>

			{shouldRenderDetailView ? (
				<WorkBookMain
					userId="tutorial-user"
					userRole="partnerCompany"
					workBookId={detailMock.workBook.id}
					hasPermission={true}
					hassWorkBookPermission={true}
					tutorialMode
					tutorialWorkBook={{
						...detailMock.workBook,
						progress: tutorialProgress,
						_count: {
							...detailMock.workBook._count,
							milestones: tutorialMilestones.length,
						},
					}}
					tutorialMilestones={tutorialMilestones}
					tutorialEntries={detailMock.entries}
					onTutorialMilestonesChange={setTutorialMilestones}
					tutorialSlug={tutorial.slug as WorkBookTutorialSlug}
					onTutorialMilestoneRequestClose={(milestoneId) => {
						setTutorialMilestones((previous) =>
							previous.map((milestone) =>
								milestone.id === milestoneId
									? { ...milestone, status: "REQUESTED_CLOSURE" }
									: milestone
							)
						)
					}}
				/>
			) : (
				<WorkBookTable
					tutorialMode
					tutorialData={WORK_BOOK_TUTORIAL_MOCK_DATA}
					tutorialEnableInitializeFlow={isCreateWorkBookTutorial}
				/>
			)}
		</main>
	)
}
