import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { VehiclesByCompanyTable } from "@/project/vehicle/components/data/VehiclesByCompanyTable"
import { UsersByCompanyTable } from "@/project/user/components/data/UsersByCompanyTable"
import CreateUsersForm from "@/project/user/components/forms/CreateUsersForm"
import VehicleForm from "@/project/vehicle/components/forms/VehicleForm"
import BackButton from "@/shared/components/BackButton"

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
				<div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<BackButton
								href="/admin/dashboard/empresas"
								className="bg-white/20 text-white hover:bg-white/50 hover:text-white"
							/>

							<div className="text-white">
								<h1 className="text-2xl font-bold">Usuarios y Vehículos de la empresa</h1>
								<p className="opacity-90">
									Gestión y seguimiento de empresas contratistas registradas
								</p>
							</div>
						</div>

						{hasPermission.success && (
							<div className="flex items-center gap-2">
								<CreateUsersForm
									isSupervisor={true}
									companyId={companyId}
									className="text-blue-600 hover:text-blue-700"
								/>

								<VehicleForm companyId={companyId} />
							</div>
						)}
					</div>
				</div>

				<TabsList className="mt-6 h-11 w-full">
					<TabsTrigger className="h-9" value="users">
						Colaboradores
					</TabsTrigger>
					<TabsTrigger className="h-9" value="vehicles">
						Vehículos
					</TabsTrigger>
				</TabsList>

				<TabsContents>
					<TabsContent value="users">
						<UsersByCompanyTable companyId={companyId} />
					</TabsContent>

					<TabsContent value="vehicles">
						<VehiclesByCompanyTable companyId={companyId} />
					</TabsContent>
				</TabsContents>
			</Tabs>
		</div>
	)
}
