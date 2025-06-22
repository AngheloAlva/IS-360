import Image from "next/image"

import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

import { CompanyDashboardContent } from "@/project/home/components/stats/company-dashboard-content"

export default async function DashboardHomePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.companyId) {
		return notFound()
	}

	const companyId = session.user.companyId

	return (
		<div className="flex w-full flex-col gap-8">
			<div className="relative flex h-[300px] items-start justify-start overflow-hidden rounded-lg p-5 shadow">
				<Image
					fill
					priority
					alt="Dashboard Hero"
					className="object-cover"
					src="/images/auth/login.jpg"
				/>
				<div className="absolute inset-0 bg-black/30" />

				<div className="relative z-10 text-start text-white">
					<h1 className="text-4xl font-bold drop-shadow-2xl">Bienvenido a OTC 360</h1>
					<p className="mt-2 text-lg drop-shadow-2xl">
						Gestiona y supervisa todos los distintos módulos de tu empresa.
					</p>
				</div>
			</div>

			<CompanyDashboardContent companyId={companyId} />
		</div>
	)
}
