import { PlusCircleIcon } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"

import { auth } from "@/lib/auth"

import { WorkPermitsTableByCompany } from "@/project/work-permit/components/data/WorkPermitsTableByCompany"
import VideoTutorials from "@/shared/components/VideoTutorials"
import ModuleHeader from "@/shared/components/ModuleHeader"
import { Button } from "@/shared/components/ui/button"

export default async function WorkPermitPage() {
	const res = await auth.api.getSession({
		headers: await headers(),
	})

	if (!res || !res.user || !res.user.companyId) {
		return (
			<main className="flex h-screen items-center justify-center">
				<p>Acceso denegado</p>
			</main>
		)
	}

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8">
			<ModuleHeader
				title="Permisos de Trabajo"
				description="Crea y gestiona tus permisos de trabajo seguro."
				className="from-purple-600 to-indigo-700"
			>
				<>
					<VideoTutorials
						videos={[
							{
								title: "Creacion Permiso de Trabajo",
								description: "Tutorial de como crear un permiso de trabajo.",
								url: "https://youtube.com/embed/RlAQzjsIUm4",
							},
							{
								title: "Consideración con Permisos de Trabajo",
								description: "Consideraciones a tener en cuenta al crear un permiso de trabajo.",
								url: "https://youtube.com/embed/GSSVKmZHGoI",
							},
						]}
					/>

					<Link href="/dashboard/permiso-de-trabajo/agregar">
						<Button className="gap-1.5 bg-white font-semibold tracking-wide text-purple-600 transition-all hover:scale-105 hover:bg-white hover:text-purple-700">
							<PlusCircleIcon className="ml-1" />
							Permiso de Trabajo
						</Button>
					</Link>
				</>
			</ModuleHeader>

			<WorkPermitsTableByCompany companyId={res.user.companyId!} userId={res.user.id} />
		</div>
	)
}
