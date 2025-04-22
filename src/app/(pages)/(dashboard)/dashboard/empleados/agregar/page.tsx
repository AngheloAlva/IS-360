import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { Metadata } from "next"

import { auth } from "@/lib/auth"

import CreateUsersForm from "@/components/forms/partner/CreateUsersForm"

export const metadata: Metadata = {
	title: "Crear Usuarios",
	description: "Crea nuevos usuarios para tu empresa",
}

export default async function CreateUsersPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user || !session.user.companyId) {
		return notFound()
	}

	return (
		<div className="mx-auto w-full max-w-screen-xl py-6">
			<div className="mt-8">
				<CreateUsersForm companyId={session.user.companyId} />
			</div>
		</div>
	)
}
