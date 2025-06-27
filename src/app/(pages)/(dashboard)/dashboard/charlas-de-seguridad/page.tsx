import { Clock, FileCheck, Info } from "lucide-react"
import { getUserSafetyTalks } from "@/project/safety-talk/actions/get-user-safety-talks"
import { SafetyTalkList } from "@/project/safety-talk/components/SafetyTalkList"

export default async function SafetyTalksPage() {
	const { ok, safetyTalks, message } = await getUserSafetyTalks()
	if (!ok || !safetyTalks) {
		return (
			<div className="flex items-center justify-center p-6">
				<p className="text-muted-foreground">{message || "Error al cargar las charlas"}</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="rounded-lg bg-gradient-to-r from-emerald-600 to-sky-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Charlas de seguridad</h1>
						<p className="opacity-90">
							Realiza y gestiona las charlas de seguridad requeridas para tu empresa
						</p>
					</div>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<div className="bg-background flex items-center gap-4 rounded-lg border p-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
						<Info className="h-6 w-6" />
					</div>
					<div>
						<h3 className="font-medium">Requisito</h3>
						<p className="text-muted-foreground text-sm">
							Las charlas son necesarias para trabajar
						</p>
					</div>
				</div>

				<div className="bg-background flex items-center gap-4 rounded-lg border p-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-600/10 text-amber-600">
						<Clock className="h-6 w-6" />
					</div>
					<div>
						<h3 className="font-medium">Vigencia</h3>
						<p className="text-muted-foreground text-sm">
							Cada charla tiene un período de validez de un año
						</p>
					</div>
				</div>

				<div className="bg-background flex items-center gap-4 rounded-lg border p-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10 text-green-600">
						<FileCheck className="h-6 w-6" />
					</div>
					<div>
						<h3 className="font-medium">Certificación</h3>
						<p className="text-muted-foreground text-sm">
							Obtén certificados al aprobar cada charla
						</p>
					</div>
				</div>
			</div>

			<SafetyTalkList userSafetyTalks={safetyTalks} />
		</div>
	)
}
