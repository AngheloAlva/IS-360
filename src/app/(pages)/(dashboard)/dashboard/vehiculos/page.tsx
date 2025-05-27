import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { VehicleDataTable } from "@/components/sections/vehicle/VehicleDataTable"

export default async function VehiclesPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id || !session?.user?.companyId) return notFound()

	return (
		<div className={"flex h-full w-full flex-1 flex-col gap-8 transition-all"}>
			<VehicleDataTable companyId={session.user.companyId} />
		</div>
	)
}
