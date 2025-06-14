import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { Plus } from "lucide-react"
import Link from "next/link"

import { auth } from "@/lib/auth"

import { VehiclesByCompanyDataTable } from "@/features/vehicle/components/data/VehiclesByCompanyDataTable"
import { UsersByCompanyTable } from "@/features/user/components/data/UsersByCompanyTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import BackButton from "@/shared/components/BackButton"
import { Button } from "@/shared/components/ui/button"

export default async function CompanyByIdAdminPage({
	params,
}: {
	params: Promise<{ companyId: string }>
}): Promise<React.ReactElement> {
	const companyId = (await params).companyId

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				company: ["create"],
			},
		},
	})

	return (
		<div className="flex w-full flex-col gap-6">
			<Tabs defaultValue="users" className="flex w-full flex-col gap-2">
				<div className="flex w-full items-center gap-2">
					<BackButton href="/admin/dashboard/empresas" />
					<h1 className="text-2xl font-bold">Usuarios y Vehículos de la empresa</h1>

					{hasPermission.success && (
						<Link
							href={`/admin/dashboard/empresas/${companyId}/supervisores/agregar`}
							className="ml-auto"
						>
							<Button
								variant={"outline"}
								className="border-green-500 bg-green-600 tracking-wider text-white hover:bg-green-800 hover:text-white"
							>
								<Plus className="mr-2 h-4 w-4" /> Supervisor(es)
							</Button>
						</Link>
					)}
				</div>

				<TabsList className="mt-6 h-12 w-full">
					<TabsTrigger className="h-10" value="users">
						Colaboradores
					</TabsTrigger>
					<TabsTrigger className="h-10" value="vehicles">
						Vehículos
					</TabsTrigger>
				</TabsList>

				<TabsContent value="users">
					<UsersByCompanyTable companyId={companyId} />
				</TabsContent>

				<TabsContent value="vehicles">
					<VehiclesByCompanyDataTable companyId={companyId} />
				</TabsContent>
			</Tabs>
		</div>
	)
}
