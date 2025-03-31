import DocumentCharts from "@/components/sections/documentation/DocumentCharts"

export default function DocumentationPage(): React.ReactElement {
	return (
		<>
			<div className="w-full text-left">
				<h1 className="text-2xl font-bold">Documentación</h1>
			</div>

			<DocumentCharts />
		</>
	)
}
