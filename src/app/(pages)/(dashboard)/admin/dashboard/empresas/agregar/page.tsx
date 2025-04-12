import CreateCompanyForm from "@/components/forms/admin/company/CreateCompanyForm"
import BackButton from "@/components/shared/BackButton"

export default function CreateCompanyPage(): React.ReactElement {
	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-lg items-center justify-start gap-2">
				<BackButton href="/admin/dashboard/empresas" />
				<h1 className="w-fit text-3xl font-bold">Nueva Empresa</h1>
			</div>

			<CreateCompanyForm />
		</>
	)
}
