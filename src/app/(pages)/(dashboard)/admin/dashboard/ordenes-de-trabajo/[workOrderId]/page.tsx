import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { getWorkOrderById } from "@/actions/work-orders/getWorkOrders"
import { auth } from "@/lib/auth"

import UpdateWorkOrderForm from "@/components/forms/admin/work-order/UpdateWorkOrderForm"
import BackButton from "@/components/shared/BackButton"

interface Props {
	params: Promise<{
		workOrderId: string
	}>
}

export default async function UpdateWorkOrderPage({ params }: Props) {
	const { workOrderId } = await params
	const { data, ok } = await getWorkOrderById(workOrderId)

	if (!ok || !data) {
		return notFound()
	}

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				workOrder: ["create"],
			},
		},
	})

	if (!hasPermission.success) return notFound()

	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-2">
				<BackButton href="/admin/dashboard/ordenes-de-trabajo" />
				<h1 className="w-fit text-3xl font-bold">Actualizar {data.otNumber}</h1>
			</div>

			<UpdateWorkOrderForm workOrder={data} />
		</>
	)
}
