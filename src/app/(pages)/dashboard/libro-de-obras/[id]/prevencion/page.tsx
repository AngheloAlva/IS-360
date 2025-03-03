import PreventionAreasForm from "@/components/forms/work-book/PreventionAreasForm"

export default async function CreatePreventionAreaPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	return (
		<main className="flex flex-col items-center gap-6 p-8">
			<h1 className="text-2xl font-bold text-gray-800">Agregar Área de Prevención</h1>

			<PreventionAreasForm workBookId={id} />
		</main>
	)
}
