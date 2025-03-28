import {
	ChevronRight,
	FileText,
	Briefcase,
	Wrench,
	Leaf,
	ShieldAlert,
	Award,
	HardHat,
	Scale,
	Users,
} from "lucide-react"
import Link from "next/link"
import { Areas, SpecialAreas, } from "@/lib/consts/areas"

// Colores específicos para cada área
const areaColors: Record<string, { bg: string, text: string }> = {
	"proyectos": { 
		bg: "bg-[#26A69A] shadow-lg border-2 border-[#26A69A]",
		text: "text-white font-bold tracking-wide"
	},
	"operaciones": { 
		bg: "text-[#26A69A]",
		text: "bg-white font-semibold border-[#26A69A]"
	},
	"instructivos": { 
		bg: "text-[#5A6B7F]",
		text: "bg-white font-semibold border-[#5A6B7F]"
	},
	"integridad-y-mantencion": { 
		bg: "text-[#F08C42]",
		text: "bg-white font-semibold border-[#F08C42]"
	},
	"medio-ambiente": { 
		bg: "text-[#4CAF50]",
		text: "bg-white font-semibold border-[#4CAF50]"
	},
	"prevencion-riesgos": { 
		bg: "text-[#FF5722]",
		text: "bg-white font-semibold border-[#FF5722]"
	},
	"calidad-y-excelencia-profesional": { 
		bg: "text-[#2196F3]",
		text: "bg-white font-semibold border-[#2196F3]"
	},
	"hseq": { 
		bg: "text-[#009688]",
		text: "bg-white font-semibold border-[#009688]"
	},
	"juridica": { 
		bg: "text-[#424242]",
		text: "bg-white font-semibold border-[#424242]"
	},
	"comunidades": { 
		bg: "text-[#FFEB3B]",
		text: "bg-white font-semibold border-[#FFEB3B]"
	}
}

// Función auxiliar para obtener el icono correspondiente a cada área
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
							className={`${areaColors[key]?.bg || "bg-gray-100"} group relative rounded-xl border border-transparent p-6 shadow-sm transition-all duration-300 hover:z-10 hover:scale-[1.02] hover:border-current hover:shadow-md ${key === "proyectos" ? "hover:shadow-[#26A69A]/50 hover:shadow-xl" : ""}`}
						>
							<div className="flex items-start justify-between">
								<div className="flex gap-4">
									<div
										className={`flex h-11 w-11 items-center justify-center rounded-full ${key === "proyectos" ? "bg-[#26A69A]" : areaColors[key]?.bg?.replace("bg-", "bg-opacity-30 bg-") || "bg-gray-100"} p-3 ${key === "proyectos" ? "text-white" : key === "comunidades" ? "text-[#212121]" : "text-white"}`}
									>
										{getIconForArea(key)}
									</div>
									<div>
										<h3 className={`mb-2 text-lg capitalize ${key === "comunidades" ? "text-[#212121]" : areaColors[key]?.text || "text-white"}`}>
											{area.title.replace(/_/g, " ").toLocaleLowerCase()}
										</h3>
										<p className={`text-sm ${key === "comunidades" ? "text-[#212121]/80" : "text-white/90"}`}>{area.description}</p>
									</div>
								</div>
								<ChevronRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${key === "comunidades" ? "text-[#212121]" : "text-white"} opacity-70 group-hover:opacity-100`} />
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
							className={`${areaColors[key]?.text || "bg-gray-100"} group relative rounded-xl border  p-6 shadow-sm transition-all duration-300 hover:z-10 hover:scale-[1.02] hover:border-current hover:shadow-md ${key === "proyectos" ? "hover:shadow-[#26A69A]/50 hover:shadow-xl" : ""}`}
						>
							<div className="flex items-start justify-between">
								<div className="flex gap-4">
									<div
										className={`flex h-11 w-11 items-center justify-center rounded-full ${areaColors[key]?.bg || "bg-gray-100"}`}
									>
										{getIconForArea(key)}
									</div>
									<div>
										<h3 className={`mb-2 text-lg capitalize ${areaColors[key]?.bg || "text-white"}`}>
											{area.title.replace(/_/g, " ").toLocaleLowerCase()}
										</h3>
										<p className={"text-[#212121] text-sm"}>{area.description}</p>
									</div>
								</div>
								<ChevronRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${key === "comunidades" ? "text-[#212121]" : "text-white"} opacity-70 group-hover:opacity-100`} />
							</div>
						</Link>
					)
				})}
			</div>
		</div>
	)
}
