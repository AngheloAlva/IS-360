import Link from "next/link"
import {
	LeafIcon,
	UsersIcon,
	AwardIcon,
	ScaleIcon,
	WrenchIcon,
	HardHatIcon,
	FileTextIcon,
	ActivityIcon,
	BriefcaseIcon,
	ShieldAlertIcon,
	ChevronRightIcon,
} from "lucide-react"

import { Areas } from "@/lib/consts/areas"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

function getIconForArea(key: string): React.ReactNode {
	const icons: Record<string, React.ReactNode> = {
		"proyectos": <BriefcaseIcon />,
		"operaciones": <ActivityIcon />,
		"instructivos": <FileTextIcon />,
		"integridad-y-mantencion": <WrenchIcon />,
		"medio-ambiente": <LeafIcon />,
		"seguridad-operacional": <ShieldAlertIcon />,
		"calidad-y-excelencia-operacional": <AwardIcon />,
		"cumplimiento-normativo": <HardHatIcon />,
		"juridica": <ScaleIcon />,
		"comunidades": <UsersIcon />,
	}
	return icons[key] || <FileTextIcon />
}

export default function AreasDocumentationTable(): React.ReactElement {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				{Object.keys(Areas).map((key, index) => {
					const area = Areas[key as keyof typeof Areas]

					return (
						<Link key={index} href={`/admin/dashboard/documentacion/${key}`}>
							<Card
								className={cn(
									"group h-full gap-2 border-transparent py-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md md:gap-4",
									area.className
								)}
							>
								<CardHeader className={`flex w-full flex-row items-center justify-between`}>
									<div className="flex items-center gap-2">
										<div className="flex min-h-9 min-w-9 items-center justify-center rounded-lg bg-current/10 md:min-h-11 md:min-w-11">
											{getIconForArea(key)}
										</div>

										<div>
											<CardTitle className="text-base font-semibold capitalize md:text-lg">
												{area.title}
											</CardTitle>
										</div>
									</div>

									<ChevronRightIcon className="text-text min-h-7 min-w-7 opacity-70 group-hover:opacity-100 md:hidden lg:block" />
								</CardHeader>

								<CardContent>
									<p className="text-text text-sm">{area.description}</p>
								</CardContent>
							</Card>
						</Link>
					)
				})}
			</div>
		</div>
	)
}
