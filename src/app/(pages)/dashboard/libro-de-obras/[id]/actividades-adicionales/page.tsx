import AdditionalActivityForm from "@/components/forms/work-book/AdditionalActivityForm"
import BackButton from "@/components/shared/BackButton"

export default async function CreateAdditionalActivityPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-2">
				<BackButton href={`/dashboard/libro-de-obras/${id}`} />
				<h1 className="text-2xl font-bold text-gray-800">Agregar Actividad Adicional</h1>
			</div>

			<AdditionalActivityForm workBookId={id} />
		</>
	)
}
