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
				"hover:bg-primary/40 hover:text-primary mt-0.5 rounded-full transition-colors",
				className
			)}
		>
			<ChevronLeft className="h-7 w-7" />
			<span className="sr-only">Atrás</span>
		</Link>
	)
}
