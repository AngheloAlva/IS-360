import CompanyForm from "@/components/forms/admin/company/CompanyForm"
import BackButton from "@/components/shared/BackButton"

export default function CreateUserPage() {
	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-lg items-center justify-start gap-2">
				<BackButton href="/admin/dashboard/empresas" />
				<h1 className="w-fit text-3xl font-bold">Nueva Empresa</h1>
			</div>

			<CompanyForm />
		</>
	)
}
