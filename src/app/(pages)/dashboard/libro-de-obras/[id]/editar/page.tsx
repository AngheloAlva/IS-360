import { getWorkBook } from "@/actions/work-books/getWorkBook"
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
			<WorkBookForm workBook={res.data} />
		</main>
	)
}
