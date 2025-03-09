import UserForm from "@/components/forms/admin/user/UserForm"
import BackButton from "@/components/shared/BackButton"

export default function CreateUserPage() {
	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-lg items-center justify-start gap-2">
				<BackButton href="/dashboard/admin/usuarios" />
				<h1 className="w-fit text-3xl font-bold">Nuevo Usuario</h1>
			</div>

			<UserForm />
		</>
	)
}
