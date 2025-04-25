import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import Spinner from "@/components/shared/Spinner"

interface SubmitButtonProps {
	label: string
	disabled?: boolean
	isSubmitting: boolean
	className?: string
}

export default function SubmitButton({
	label,
	disabled,
	className,
	isSubmitting,
}: SubmitButtonProps): React.ReactElement {
	return (
		<Button
			size={"lg"}
			type="submit"
			disabled={isSubmitting || disabled}
			className={cn("hover:bg-secondary-background mt-4 w-full font-bold tracking-wide", className)}
		>
			{isSubmitting ? (
				<Spinner />
			) : (
				label
			)}
		</Button>
	)
}
