import AdditionalActivityForm from "@/components/forms/work-book/AdditionalActivityForm"

export default async function CreateAdditionalActivityPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	return (
		<main className="flex flex-col items-center gap-6 p-8">
			<h1 className="text-2xl font-bold text-gray-800">Agregar Actividad Adicional</h1>

			<AdditionalActivityForm workBookId={id} />
		</main>
	)
}
