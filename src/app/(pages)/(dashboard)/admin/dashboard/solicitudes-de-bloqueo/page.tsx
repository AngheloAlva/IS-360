import { PlusCircleIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { Metadata } from "next"
import Link from "next/link"

import { auth } from "@/lib/auth"

import LockoutPermitStatsContainer from "@/project/lockout-permit/components/stats/LockoutPermitStatsContainer"
import LockoutPermitsTable from "@/project/lockout-permit/components/data/LockoutPermitsTable"
import ScrollToTableButton from "@/shared/components/ScrollToTable"
import { Button } from "@/shared/components/ui/button"

export const metadata: Metadata = {
	title: "Permisos de Bloqueo | IS 360",
	description: "Gestión y monitoreo de permisos de bloqueo y etiquetado de energía",
}

export default async function LockoutPermitsAdminPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				lockoutPermit: ["create"],
			},
		},
	})

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="rounded-lg bg-gradient-to-r from-yellow-500 to-lime-600 p-6">
				<div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
					<div className="w-full text-white">
						<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Permisos de Bloqueo</h1>
						<p className="text-sm opacity-90 sm:text-base">
							Gestión y monitoreo de permisos de bloqueo y etiquetado de energía
						</p>
					</div>

					<div className="ml-auto flex items-center justify-end gap-2">
						<ScrollToTableButton
							id="lockout-permit-table"
							label="Lista Permisos"
							className="text-yellow-600 hover:bg-white hover:text-yellow-600"
						/>

						{hasPermission.success && (
							<Link href="/admin/dashboard/solicitudes-de-bloqueo/crear">
								<Button
									size={"lg"}
									className="w-10 cursor-pointer gap-1.5 bg-white font-semibold tracking-wide text-yellow-600 transition-all hover:scale-105 hover:bg-white hover:text-yellow-600 md:w-fit"
								>
									<PlusCircleIcon className="size-4" />
									<span className="hidden md:inline">Permiso de Bloqueo</span>
								</Button>
							</Link>
						)}
					</div>
				</div>
			</div>

			<LockoutPermitStatsContainer />

			<LockoutPermitsTable
				id="lockout-permit-table"
				userId={session.user.id}
				hasPermission={hasPermission.success}
			/>
		</div>
	)
}
