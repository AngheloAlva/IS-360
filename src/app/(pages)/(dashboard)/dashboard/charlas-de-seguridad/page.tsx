// import { Clock, FileCheck, Info } from "lucide-react"

// import { ContractorSafetyTalkList } from "@/components/sections/safety-talks/ContractorSafetyTalkList"

// export default function SecurityPage(): React.ReactElement {
// 	return (
// 		<div className="space-y-6">
// 			<div>
// 				<h1 className="text-2xl font-bold">Charlas de seguridad</h1>
// 				<p className="text-muted-foreground mt-1">
// 					Realiza y gestiona las charlas de seguridad requeridas para tu empresa
// 				</p>
// 			</div>

// 			<div className="grid gap-4 md:grid-cols-3">
// 				<div className="flex items-center gap-4 rounded-lg border p-4">
// 					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
// 						<Info className="h-6 w-6" />
// 					</div>
// 					<div>
// 						<h3 className="font-medium">Requisito</h3>
// 						<p className="text-sm text-muted-foreground">
// 							Las charlas son necesarias para trabajar
// 						</p>
// 					</div>
// 				</div>

// 				<div className="flex items-center gap-4 rounded-lg border p-4">
// 					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
// 						<Clock className="h-6 w-6" />
// 					</div>
// 					<div>
// 						<h3 className="font-medium">Vigencia</h3>
// 						<p className="text-sm text-muted-foreground">
// 							Cada charla tiene un período de validez
// 						</p>
// 					</div>
// 				</div>

// 				<div className="flex items-center gap-4 rounded-lg border p-4">
// 					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
// 						<FileCheck className="h-6 w-6" />
// 					</div>
// 					<div>
// 						<h3 className="font-medium">Certificación</h3>
// 						<p className="text-sm text-muted-foreground">
// 							Obtén certificados al aprobar cada charla
// 						</p>
// 					</div>
// 				</div>
// 			</div>

// 			<ContractorSafetyTalkList />
// 		</div>
// 	)
// }

import { Construction } from "lucide-react"

export default function SafetyTalksPage() {
	return (
		<div className="flex min-h-[85vh] flex-col items-center justify-center gap-4 p-4">
			<Construction className="text-primary h-24 w-24 animate-pulse" />
			<h1 className="text-primary text-2xl font-bold">Módulo en Construcción</h1>
			<p className="text-muted-foreground max-w-lg text-center">
				Este módulo está actualmente en desarrollo. Pronto estará disponible con nuevas
				funcionalidades.
			</p>

			<p className="text-muted-foreground text-center">
				Atentamente,
				<br />
				<span className="text-primary font-semibold underline decoration-wavy">
					Ingenieria Simple
				</span>
			</p>
		</div>
	)
}
