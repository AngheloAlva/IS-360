import { redirect } from "next/navigation"

export default async function EquipmentDetailView({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<never> {
	const { id } = await params
	redirect(`/admin/dashboard/historial-equipos?equipmentId=${id}`)
}
