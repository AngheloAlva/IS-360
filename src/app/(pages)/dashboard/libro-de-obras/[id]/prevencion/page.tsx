import PreventionAreasForm from "@/components/forms/work-book/PreventionAreasForm"
import BackButton from "@/components/shared/BackButton"

export default async function CreatePreventionAreaPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	return (
		<main className="flex flex-col items-center gap-6 p-8">
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-2">
				<BackButton href={`/dashboard/libro-de-obras/${id}`} />
				<h1 className="text-2xl font-bold text-gray-800">Agregar Área de Prevención</h1>
			</div>

			<PreventionAreasForm workBookId={id} />
		</main>
	)
}
