import CreateExternalUsersForm from "@/components/forms/admin/user/CreateExternalUsersForm"
import BackButton from "@/components/shared/BackButton"

export default function CreateExternalUserPage() {
	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-lg items-center justify-start gap-2">
				<BackButton href="/admin/dashboard/usuarios" />
				<h1 className="w-fit text-3xl font-bold">Nuevos Usuarios Externos</h1>
			</div>

			<CreateExternalUsersForm />
		</>
	)
}
