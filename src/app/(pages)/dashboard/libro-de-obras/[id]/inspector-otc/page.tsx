import OtcInspectorForm from "@/components/forms/work-book/OtcInspectorForm"
import BackButton from "@/components/shared/BackButton"

export default async function CreateOtcInspectorPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	return (
		<main className="flex flex-col items-center gap-6 p-8">
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-2">
				<BackButton href={`/dashboard/libro-de-obras/${id}`} />
				<h1 className="text-2xl font-bold text-gray-800">Inpector OTC</h1>
			</div>

			<OtcInspectorForm workBookId={id} />
		</main>
	)
}
