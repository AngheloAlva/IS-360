import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { LocationTreePage } from "@/project/location/components/data/LocationTreePage"

export default async function LocationsPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const canList = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				location: ["list"],
			},
		},
	})

	if (!canList.success) return notFound()

	const canCreate = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				location: ["create"],
			},
		},
	})

	const canDelete = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				location: ["delete"],
			},
		},
	})

	return (
		<LocationTreePage
			canCreate={canCreate.success}
			canDelete={canDelete.success}
		/>
	)
}
