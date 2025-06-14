import { cn } from "@/lib/utils"

import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"

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
			className={cn(
				"hover:bg-secondary-background w-full cursor-pointer font-bold tracking-wide transition-all hover:scale-105",
				className
			)}
		>
			{isSubmitting ? <Spinner /> : label}
		</Button>
	)
}
