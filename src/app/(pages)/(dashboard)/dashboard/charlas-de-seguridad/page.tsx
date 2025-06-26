import { Clock, FileCheck, Info } from "lucide-react"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"
import { SafetyTalkList } from "@/project/safety-talk/components/SafetyTalkList"

export default async function SafetyTalksPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})
	if (!session?.user) return null

	// Get user's safety talks
	const safetyTalks = await prisma.userSafetyTalk.findMany({
		where: {
			userId: session.user.id,
		},
		include: {
			attempts: {
				orderBy: {
					completedAt: "desc",
				},
			},
			approvalBy: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	})

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Charlas de seguridad</h1>
				<p className="text-muted-foreground mt-1">
					Realiza y gestiona las charlas de seguridad requeridas para tu empresa
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<div className="flex items-center gap-4 rounded-lg border p-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
						<Info className="h-6 w-6" />
					</div>
					<div>
						<h3 className="font-medium">Requisito</h3>
						<p className="text-muted-foreground text-sm">
							Las charlas son necesarias para trabajar
						</p>
					</div>
				</div>

				<div className="flex items-center gap-4 rounded-lg border p-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
						<Clock className="h-6 w-6" />
					</div>
					<div>
						<h3 className="font-medium">Vigencia</h3>
						<p className="text-muted-foreground text-sm">
							Cada charla tiene un período de validez de un año
						</p>
					</div>
				</div>

				<div className="flex items-center gap-4 rounded-lg border p-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
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
