import Link from "next/link"
import {
	Leaf,
	Users,
	Award,
	Scale,
	Wrench,
	HardHat,
	FileText,
	Briefcase,
	ShieldAlert,
	ChevronRight,
} from "lucide-react"

import { Areas, areaColors } from "@/lib/consts/areas"
import { cn } from "@/lib/utils"

function getIconForArea(key: string): React.ReactNode {
	const icons: Record<string, React.ReactNode> = {
		"proyectos": <Briefcase />,
		"operaciones": <Briefcase />,
		"instructivos": <FileText />,
		"integridad-y-mantencion": <Wrench />,
		"medio-ambiente": <Leaf />,
		"seguridad-operacional": <ShieldAlert />,
		"calidad-y-excelencia-operacional": <Award />,
		"cumplimiento-normativo": <HardHat />,
		"juridica": <Scale />,
		"comunidades": <Users />,
	}
	return icons[key] || <FileText />
}

export default function AreasDocumentationTable(): React.ReactElement {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				{Object.keys(Areas).map((key, index) => {
					const area = Areas[key as keyof typeof Areas]

					return (
						<Link
							key={index}
							href={`/dashboard/documentacion/${key}`}
							className={cn(
								"relative rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:z-10 hover:scale-[1.02] hover:border-current hover:shadow-md",
								areaColors[key]?.className,
								{
									"border-[#26A69A] bg-[#26A69A] hover:shadow-[#26A69A]/50": key === "proyectos",
								}
							)}
						>
							<div className="flex items-start justify-between">
								<div className="flex gap-4">
									<div
										className={cn(
											"flex h-11 w-11 items-center justify-center rounded-full",
											areaColors[key]?.className,
											{
												"text-white": key === "proyectos",
											}
										)}
									>
										{getIconForArea(key)}
									</div>

									<div>
										<h3
											className={cn(
												"mb-2 text-lg font-semibold capitalize",
												areaColors[key]?.className,
												{
													"text-white": key === "proyectos",
												}
											)}
										>
											{area.title}
										</h3>
										<p
											className={cn("text-sm text-[#212121]", {
												"text-white": key === "proyectos",
											})}
										>
											{area.description}
										</p>
									</div>
								</div>

								<ChevronRight
									className={cn(`h-7 w-7 text-[#212121] opacity-70 transition-transform`, {
										"text-white": key === "proyectos",
									})}
								/>
							</div>
						</Link>
					)
				})}
			</div>
		</div>
	)
}
