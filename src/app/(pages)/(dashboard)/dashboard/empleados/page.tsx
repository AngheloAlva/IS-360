import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { Plus } from "lucide-react"
import Link from "next/link"

import { auth } from "@/lib/auth"

import { UsersByCompanyDataTable } from "@/components/sections/users/UsersByCompanyDataTable"
import { Button } from "@/components/ui/button"

export default async function UsersByCompanyPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user || !session.user.companyId) {
		return notFound()
	}

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="flex items-start justify-between gap-4 md:flex-row">
				<div className="flex flex-col gap-1">
					<h1 className="text-text w-fit text-3xl font-bold">Empleados</h1>
					<p className="text-text w-fit text-sm sm:text-base">
						En esta sección puedes gestionar los empleados de la empresa.
					</p>
				</div>

				<Link href="/dashboard/empleados/agregar">
					<Button size={"lg"}>
						<Plus />
						<span className="hidden sm:inline">Empleado(s)</span>
					</Button>
				</Link>
			</div>

			<UsersByCompanyDataTable companyId={session.user.companyId} />
		</div>
	)
}
