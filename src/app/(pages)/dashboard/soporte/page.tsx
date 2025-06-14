import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import SupportForm from "@/features/contact/components/forms/SupportForm"

export default async function SupportPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session || !session.user) {
		notFound()
	}

	return (
		<div className="mx-auto max-w-3xl">
			<h1 className="text-2xl font-bold">Soporte</h1>
			<p className="text-muted-foreground">
				Si tienes alguna duda o tuviste algún problema con el sistema, por favor, contacta con
				nosotros a través de este formulario.
			</p>

			<SupportForm user={session.user} />
		</div>
	)
}
