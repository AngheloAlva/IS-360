
import { VehiclesDataTable } from "@/components/sections/admin/companies/vehicles/VehiclesDataTable"
import CreateCompanyFormSheet from "@/components/forms/admin/company/CreateCompanyFormSheet"
import { CompanyDataTable } from "@/components/sections/admin/companies/CompanyDataTable"
import CompanyStatsCards from "@/components/sections/admin/companies/CompanyStatsCards"

export default async function AdminCompaniesPage(): Promise<React.ReactElement> {
	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="flex items-center justify-between">
				<h1 className="w-fit text-3xl font-bold">Lista de Empresas</h1>
				{/* <Link href="/admin/dashboard/empresas/agregar" className="md:ml-auto">
					<Button size={"lg"}>
						Nueva Empresa
						<Plus className="ml-1" />
					</Button>
				</Link> */}
				<CreateCompanyFormSheet />
			</div>

			<CompanyStatsCards />

			<CompanyDataTable />

			<div className="mt-8">
				<VehiclesDataTable />
			</div>
		</div>
	)
}
