import { PlusCircleIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { Metadata } from "next"
import Link from "next/link"

import { auth } from "@/lib/auth"

import WorkPermitStatsContainer from "@/project/work-permit/components/stats/WorkPermitStatsContainer"
import WorkPermitsTable from "@/project/work-permit/components/data/WorkPermitsTable"
import PdfBlankButton from "@/project/work-permit/components/pdf/PdfBlankButton"
import VideoTutorials from "@/shared/components/VideoTutorials"
import { Button } from "@/shared/components/ui/button"

export const metadata: Metadata = {
	title: "Permisos de Trabajo | Interno",
	description: "Gestión y monitoreo de permisos de trabajo para empresas contratistas",
}

export default async function WorkPermitsAdminPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				workPermit: ["create"],
			},
		},
	})

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="rounded-lg bg-linear-to-r from-pink-600 to-rose-700 p-6 dark:from-pink-800 dark:to-rose-900">
				<div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
					<div className="w-full text-white">
						<h1 className="text-2xl font-bold tracking-tight">Permisos de Trabajo</h1>
						<p className="text-sm opacity-90 sm:text-base">
							Gestión y monitoreo de permisos de trabajo para empresas contratistas
						</p>
					</div>

					<div className="ml-auto flex items-center justify-end gap-2">
						<VideoTutorials
							className="text-red-500"
							videos={[
								{
									title: "Creacion de Permiso de Trabajo",
									description: "Tutorial de como crear un permiso de trabajo.",
									url: "https://youtube.com/embed/0RcHtcDqRKk",
								},
								{
									title: "Revisión Permiso de Trabajo",
									description: "Muestra de un permiso de trabajo con todas sus funcionalidades.",
									url: "https://youtube.com/embed/cXXmaIlkKxk",
								},
								{
									title: "Funcionalidades Permiso de Trabajo",
									description: "Muestra todas las funcionalidades de los permisos de trabajo.",
									url: "https://youtube.com/embed/bIflB6OZ-70",
								},
							]}
						/>

						<PdfBlankButton />

						{hasPermission.success && (
							<Link href="/admin/dashboard/permisos-de-trabajo/agregar">
								<Button
									size={"lg"}
									className="w-10 cursor-pointer gap-1.5 bg-white font-semibold tracking-wide text-pink-600 transition-all hover:scale-105 hover:bg-white hover:text-pink-700 md:w-fit dark:text-pink-800 dark:hover:text-pink-800"
								>
									<PlusCircleIcon className="size-4" />
									<span className="hidden md:inline">Permiso de Trabajo</span>
								</Button>
							</Link>
						)}
					</div>
				</div>
			</div>

			<WorkPermitStatsContainer />

			<WorkPermitsTable id="work-permit-table" hasPermission={hasPermission.success} />
		</div>
	)
}
