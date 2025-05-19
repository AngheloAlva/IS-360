import { Info } from "lucide-react"

import { DocumentCategory, ReviewStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SendStartupFolderReview } from "../admin/SendStartupFolderReview"
import { AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"

export default function StartupFolderTrigger({
	icon,
	title,
	userId,
	status,
	folderId,
	category,
	totalDocs,
	isOtcMember,
	completedDocs,
	requiredPending,
	progressPercentage,
	sectionDescription,
}: {
	title: string
	userId: string
	folderId: string
	totalDocs: number
	isOtcMember: boolean
	status: ReviewStatus
	completedDocs: number
	icon: React.ReactNode
	requiredPending: number
	progressPercentage: number
	sectionDescription: string
	category: DocumentCategory
}): React.ReactElement {
	return (
		<AccordionTrigger className="cursor-pointer items-center py-4 hover:no-underline">
			<div className="flex w-full items-center justify-between pr-4">
				<div className="flex items-center">
					<div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-500">
						{icon}
					</div>
					<div className="flex flex-col items-start">
						<div className="flex items-center gap-0.5">
							<h3 className="mr-1 text-left font-medium">{title}</h3>
							<Tooltip delayDuration={200}>
								<TooltipTrigger className="mt-0.5 flex items-center" asChild>
									<Info className="text-muted-foreground h-4 w-4 cursor-help" />
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-xs text-balance">{sectionDescription}</p>
								</TooltipContent>
							</Tooltip>
						</div>

						<p className="text-muted-foreground text-left text-sm">
							{completedDocs} de {totalDocs} documentos agregados
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Progress
						value={progressPercentage}
						className="w-24"
						indicatorClassName={cn({
							"bg-green-500/50": completedDocs === totalDocs,
							"bg-red-500/50": requiredPending > 0,
							"bg-amber-500/50": requiredPending === 0,
						})}
					/>

					{isOtcMember && status === ReviewStatus.SUBMITTED && (
						<SendStartupFolderReview
							title={title}
							userId={userId}
							folderId={folderId}
							category={category}
						/>
					)}
				</div>
			</div>
		</AccordionTrigger>
	)
}
