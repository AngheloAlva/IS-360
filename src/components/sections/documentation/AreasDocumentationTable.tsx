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

import { Areas, SpecialAreas, areaColors } from "@/lib/consts/areas"

function getIconForArea(key: string): React.ReactNode {
	const icons: Record<string, React.ReactNode> = {
		"operaciones": <Briefcase />,
		"instructivos": <FileText />,
		"integridad-y-mantencion": <Wrench />,
		"medio-ambiente": <Leaf />,
		"prevencion-riesgos": <ShieldAlert />,
		"calidad-y-excelencia-profesional": <Award />,
		"hseq": <HardHat />,
		"juridica": <Scale />,
		"comunidades": <Users />,
	}
	return icons[key] || <FileText />
}

export default function AreasDocumentationTable(): React.ReactElement {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				{Object.keys(SpecialAreas).map((key, index) => {
					const area = SpecialAreas[key as keyof typeof SpecialAreas]

					return (
						<Link
							key={index}
							href={`/dashboard/documentacion/${key}`}
							className={`group relative rounded-xl border-2 border-[#26A69A] bg-[#26A69A] p-6 shadow-lg transition-all duration-300 hover:z-10 hover:scale-[1.02] hover:border-current hover:shadow-xl hover:shadow-[#26A69A]/50`}
						>
							<div className="flex items-start justify-between">
								<div className="flex gap-4">
									<div
										className={`flex h-11 w-11 items-center justify-center rounded-full ${key === "proyectos" ? "bg-[#26A69A]" : areaColors[key]?.text || "bg-gray-100"} p-3 ${key === "proyectos" ? "text-white" : key === "comunidades" ? "text-[#212121]" : "text-white"}`}
									>
										{getIconForArea(key)}
									</div>
									<div>
										<h3 className={`mb-2 text-lg font-semibold text-white capitalize`}>
											{area.title}
										</h3>
										<p className={`text-sm font-semibold text-white`}>{area.description}</p>
									</div>
								</div>
								<ChevronRight
									className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${key === "comunidades" ? "text-[#212121]" : "text-white"} opacity-70 group-hover:opacity-100`}
								/>
							</div>
						</Link>
					)
				})}

				{Object.keys(Areas).map((key, index) => {
					const area = Areas[key as keyof typeof Areas]

					return (
						<Link
							key={index}
							href={`/dashboard/documentacion/${key}`}
							className={`${areaColors[key]?.text || "bg-gray-100"} group relative rounded-xl border p-6 shadow-sm transition-all duration-300 hover:z-10 hover:scale-[1.02] hover:border-current hover:shadow-md ${key === "proyectos" ? "hover:shadow-xl hover:shadow-[#26A69A]/50" : ""}`}
						>
							<div className="flex items-start justify-between">
								<div className="flex gap-4">
									<div
										className={`flex h-11 w-11 items-center justify-center rounded-full ${areaColors[key]?.text || "bg-gray-100"}`}
									>
										{getIconForArea(key)}
									</div>
									<div>
										<h3
											className={`mb-2 text-lg font-semibold capitalize ${areaColors[key]?.text || "text-white"}`}
										>
											{area.title}
										</h3>
										<p className={"text-sm text-[#212121]"}>{area.description}</p>
									</div>
								</div>
								<ChevronRight
									className={`h-5 w-5 text-[#212121] opacity-70 transition-transform group-hover:translate-x-1 group-hover:opacity-100`}
								/>
							</div>
						</Link>
					)
				})}
			</div>
		</div>
	)
}
