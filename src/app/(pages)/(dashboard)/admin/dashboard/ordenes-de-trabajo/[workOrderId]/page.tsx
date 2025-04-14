import { getWorkOrderById } from "@/actions/work-orders/getWorkOrders"
import UpdateWorkOrderForm from "@/components/forms/admin/work-order/UpdateWorkOrderForm"
import BackButton from "@/components/shared/BackButton"
import { notFound } from "next/navigation"

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
