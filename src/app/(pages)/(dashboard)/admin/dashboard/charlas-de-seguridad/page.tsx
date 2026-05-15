import { ScrollTextIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"

import { auth } from "@/lib/auth"

import { SafetyTalksDashboard } from "@/project/safety-talk/components/admin/SafetyTalksDashboard"
import { IrlSafetyTalkForm } from "@/project/safety-talk/components/forms/IrlSafetyTalkForm"
import ModuleHeader from "@/shared/components/ModuleHeader"
import { Button } from "@/shared/components/ui/button"

export default async function SafetyTalksAdminPage(): Promise<React.ReactNode> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				safetyTalk: ["create"],
			},
		},
	})

	const unauthorizedUsersIds = process.env.NEXT_PUBLIC_EXTERNAL_PLANT!.split(",")

	return (
		<div className="w-full flex-1 space-y-6">
			<ModuleHeader
				title="Charlas de Seguridad"
				description="Gestión y seguimiento de charlas de seguridad"
				className="from-emerald-600 to-sky-700 dark:from-emerald-700 dark:to-sky-800"
			>
				<div className="flex items-center gap-3">
					{!unauthorizedUsersIds.includes(session.user.id) && (
						<Link href="/admin/dashboard/charlas-de-seguridad/visitas">
							<Button
								size={"lg"}
								className="cursor-pointer gap-2 bg-white font-semibold text-sky-600 transition-all hover:scale-105 hover:bg-white hover:text-sky-700 dark:text-sky-800"
							>
								<ScrollTextIcon className="size-4" />
								Charlas OTC
							</Button>
						</Link>
					)}

					{hasPermission && <IrlSafetyTalkForm />}
				</div>
			</ModuleHeader>

			<SafetyTalksDashboard />
		</div>
	)
}
