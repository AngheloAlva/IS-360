import AreasDocumentationTable from "@/components/sections/documentation/AreasDocumentationTable"

export default function DocumentationPage(): React.ReactElement {
	return (
		<main className="flex h-full flex-col gap-8 p-4 pb-40 lg:p-8">
			<h1 className="flex flex-col text-2xl font-bold">Documentación</h1>

			<AreasDocumentationTable />
		</main>
	)
}
