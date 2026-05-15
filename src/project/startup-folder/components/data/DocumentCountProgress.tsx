import { InfoIcon } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { Progress } from "@/shared/components/ui/progress"

interface DocumentCountProgressProps {
	progress: number
}

export default function DocumentCountProgress({
	progress,
}: DocumentCountProgressProps): React.ReactElement {
	return (
		<div className="flex items-center gap-1">
			<Progress
				value={progress}
				className="ml-auto h-2 w-24 max-w-24 [&>div]:bg-emerald-500 dark:[&>div]:bg-emerald-700"
			/>
			<Tooltip>
				<TooltipTrigger className="flex items-center gap-1">
					<div className="text-xs font-semibold">{progress.toFixed(0)}%</div>
					<InfoIcon className="-mt-0.5 size-3.5" />
				</TooltipTrigger>
				<TooltipContent>
					El porcentaje se calcula en base a la cantidad de documentos completados + documentos que
					no aplican.
				</TooltipContent>
			</Tooltip>
		</div>
	)
}
