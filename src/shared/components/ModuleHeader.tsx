import { cn } from "@/lib/utils"

import BackButton from "./BackButton"
import { memo } from "react"

interface ModuleHeaderProps {
	title: string
	backHref?: string
	className?: string
	description?: string
	children?: React.ReactElement
	statusBadge?: React.ReactElement
}

const MemoizedModuleHeader = memo(function ModuleHeader({
	title,
	backHref,
	children,
	className,
	description,
	statusBadge,
}: ModuleHeaderProps): React.ReactElement {
	return (
		<div
			className={cn(
				"rounded-lg bg-linear-to-r from-green-600 to-blue-700 p-6 shadow-lg",
				className
			)}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{backHref && (
						<BackButton
							href={backHref}
							className="bg-white/20 text-white hover:bg-white/50 hover:text-white"
						/>
					)}

					<div className="text-white">
						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-bold tracking-tight">{title}</h1>
							{statusBadge}
						</div>
						<p className="flex flex-col opacity-90">{description}</p>
					</div>
				</div>

				<div className="flex items-center gap-2">{children}</div>
			</div>
		</div>
	)
})

export default MemoizedModuleHeader
