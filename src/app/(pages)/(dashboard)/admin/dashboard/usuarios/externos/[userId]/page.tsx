import { getUserById } from "@/actions/users/getUsers"
import ExternalUserForm from "@/components/forms/admin/user/ExternalUserForm"
import BackButton from "@/components/shared/BackButton"
import { notFound } from "next/navigation"

interface PageProps {
	params: Promise<{ userId: string }>
}

export default async function AdminUserExternalByIdPage({ params }: PageProps) {
	const userId = (await params).userId

	const { data, ok } = await getUserById(userId)

	if (!ok || !data) {
		return notFound()
	}

	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-lg items-center justify-start gap-2">
				<BackButton href="/admin/dashboard/usuarios" />
				<h1 className="w-fit text-3xl font-bold">Editar Usuarios Externos</h1>
			</div>

			<ExternalUserForm user={data} />
		</>
	)
}
