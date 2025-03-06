import { getWorkBook } from "@/actions/work-books/getWorkBook"
import BackButton from "@/components/shared/BackButton"
import WorkBookForm from "@/components/work-book/WorkBookForm"
import { notFound } from "next/navigation"

interface Props {
	params: Promise<{
		id: string
	}>
}

export default async function UpdateWorkBookPage({ params }: Props) {
	const { id } = await params
	const res = await getWorkBook(id)

	if (!res.ok || !res.data) {
		return notFound()
	}

	return (
		<main className="flex flex-col items-center gap-8 p-8">
			<div className="mx-auto flex w-full max-w-screen-lg items-center justify-start gap-2">
				<BackButton href={`/dashboard/libro-de-obras/${id}`} />
				<h1 className="w-fit text-3xl font-bold">Editar Libro de Obra</h1>
			</div>

			<WorkBookForm workBook={res.data} />
		</main>
	)
}
