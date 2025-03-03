import DailyActivityForm from "@/components/forms/work-book/DailyActivityForm"

export default async function CreateDailyActivityPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	return (
		<main className="flex flex-col items-center gap-6 p-8">
			<h1 className="text-2xl font-bold text-gray-800">Agregar Actividad Diaria</h1>

			<DailyActivityForm workBookId={id} />
		</main>
	)
}
