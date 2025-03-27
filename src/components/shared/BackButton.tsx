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
				"bg-primary/10 text-primary hover:bg-primary rounded-full p-0.5 transition-colors hover:text-white",
				className
			)}
		>
			<ChevronLeft className="h-6 w-6" />
			<span className="sr-only">Atrás</span>
		</Link>
	)
}
