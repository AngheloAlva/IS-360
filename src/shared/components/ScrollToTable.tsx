"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Table2Icon } from "lucide-react"

interface ScrollToTableButtonProps {
	id: string
	label: string
	className?: string
}

export default function ScrollToTableButton({
	id,
	label,
	className,
}: ScrollToTableButtonProps): React.ReactElement {
	const handleScroll = (e: React.MouseEvent) => {
		e.preventDefault()

		const element = document.getElementById(id)
		if (!element) return

		const rect = element.getBoundingClientRect()
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop
		const elementTop = rect.top + scrollTop
		const offsetPosition = elementTop - 16

		window.scrollTo({
			top: offsetPosition,
			behavior: "smooth",
		})
	}

	return (
		<Button
			size={"lg"}
			onClick={handleScroll}
			className={cn(
				"cursor-pointer bg-white px-0 py-0 font-medium text-black transition-all hover:scale-105 hover:bg-black hover:text-white",
				className
			)}
		>
			<div className="flex h-full w-full items-center gap-1.5 px-3">
				<Table2Icon className="h-4 w-4" />
				<span className="hidden md:inline">{label}</span>
			</div>
		</Button>
	)
}
