import { getUserById } from "@/actions/users/getUsers"
import InternalUserForm from "@/components/forms/admin/user/InternalUserForm"
import BackButton from "@/components/shared/BackButton"
import { notFound } from "next/navigation"

export default async function CreateInternalUserPage({
	params,
}: {
	params: Promise<{ userId: string }>
}): Promise<React.ReactElement> {
	const { userId } = await params

	const { ok, data } = await getUserById(userId)

	if (!ok || !data) {
		return notFound()
	}

	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-2">
				<BackButton href="/admin/dashboard/usuarios" />
				<h1 className="w-fit text-2xl font-bold">Editar Usuario: {data.name}</h1>
			</div>

			<InternalUserForm initialData={data} />
		</>
	)
}
