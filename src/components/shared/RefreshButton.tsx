import { RefreshCcwIcon } from "lucide-react"

import { Button } from "../ui/button"

interface RefreshButtonProps {
	refetch: () => void
	isFetching: boolean
}

export default function RefreshButton({
	refetch,
	isFetching,
}: RefreshButtonProps): React.ReactElement {
	return (
		<Button
			size="icon"
			variant="outline"
			disabled={isFetching}
			title="Recargar datos"
			onClick={() => refetch()}
		>
			<RefreshCcwIcon className={isFetching ? "animate-spin" : ""} />
		</Button>
	)
}
