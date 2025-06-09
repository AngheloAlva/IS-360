import { ChevronLeft } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface BackButtonProps {
	href: string
	className?: string
}

export default function BackButton({ href, className }: BackButtonProps): React.ReactElement {
	return (
		<Link
			href={href}
			className={cn(
				"bg-primary/10 text-primary hover:bg-primary rounded-md p-0.5 transition-all hover:scale-110 hover:text-white",
				className
			)}
		>
			<ChevronLeft className="h-full w-full" />
			<span className="sr-only">Atrás</span>
		</Link>
	)
}
