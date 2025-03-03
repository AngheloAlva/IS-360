import OtcInspectorForm from "@/components/forms/work-book/OtcInspectorForm"

export default async function CreateOtcInspectorPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	return (
		<main className="flex flex-col items-center gap-6 p-8">
			<h1 className="text-2xl font-bold text-gray-800">Inpector OTC</h1>

			<OtcInspectorForm workBookId={id} />
		</main>
	)
}
