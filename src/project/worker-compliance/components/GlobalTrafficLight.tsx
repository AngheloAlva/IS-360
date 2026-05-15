import { cn } from "@/lib/utils"

import type { TrafficLight } from "@/project/worker-compliance/types/worker-compliance"

const colorConfig: Record<TrafficLight["color"], { label: string; pill: string; dot: string }> = {
	GREEN: {
		label: "Al día",
		pill: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
		dot: "bg-green-500",
	},
	YELLOW: {
		label: "Pendiente",
		pill: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
		dot: "bg-yellow-500",
	},
	RED: {
		label: "Requiere atención",
		pill: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
		dot: "bg-red-500",
	},
}

interface GlobalTrafficLightProps {
	trafficLight: TrafficLight
}

export function GlobalTrafficLight({ trafficLight }: GlobalTrafficLightProps) {
	const config = colorConfig[trafficLight.color]

	return (
		<div className="bg-card flex flex-col gap-2 rounded-xl border p-4 shadow-sm">
			<div className="flex items-center gap-3">
				<span className="text-muted-foreground text-sm font-semibold">Estado global</span>
				<span
					className={cn(
						"flex items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-semibold",
						config.pill
					)}
				>
					<span className={cn("size-2 rounded-full", config.dot)} />
					{config.label}
				</span>
			</div>

			{trafficLight.reasons.length > 0 && (
				<ul className="flex flex-col gap-1">
					{trafficLight.reasons.map((reason, i) => (
						<li key={i} className="text-muted-foreground text-sm">
							• {reason}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
