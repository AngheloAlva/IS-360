import BackButton from "@/components/shared/BackButton"
import WorkBookForm from "@/components/work-book/WorkBookForm"

export default function CreateWorkBookPage() {
	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-lg items-center justify-start gap-2">
				<BackButton href="/dashboard/libro-de-obras" />
				<h1 className="w-fit text-3xl font-bold">Nuevo Libro de Obras</h1>
			</div>

			<WorkBookForm />
		</>
	)
}
