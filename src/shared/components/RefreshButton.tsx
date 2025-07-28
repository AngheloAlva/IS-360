import { RefreshCcwIcon } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/lib/utils"

interface RefreshButtonProps {
	refetch: () => void
	isFetching: boolean
	size?: "lg" | "md" | "sm"
}

export default function RefreshButton({
	refetch,
	isFetching,
	size = "lg",
}: RefreshButtonProps): React.ReactElement {
	return (
		<Button
			variant="outline"
			disabled={isFetching}
			title="Recargar datos"
			onClick={() => refetch()}
			className={cn(
				"group relative inline-flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg transition-all duration-300 md:hover:w-28",
				{
					"size-10": size === "lg",
					"size-8": size === "sm",
				}
			)}
		>
			<div className="inline-flex whitespace-nowrap opacity-0 transition-all duration-200 md:group-hover:-translate-x-3 md:group-hover:opacity-100">
				Recargar
			</div>

			<div
				className={cn("absolute right-[9px]", {
					"right-2.5": size === "lg",
					"right-2": size === "sm",
				})}
			>
				<RefreshCcwIcon className={isFetching ? "animate-spin" : ""} />
			</div>
		</Button>
	)
}
