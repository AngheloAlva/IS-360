import DocumentCharts from "@/project/document/components/charts/DocumentCharts"
import BackButton from "@/shared/components/BackButton"

export default function DocumentationPage(): React.ReactElement {
	return (
		<>
			<div className="flex w-full items-center gap-2 text-left">
				<BackButton href="/admin/dashboard/documentacion" />
				<h1 className="text-text text-2xl font-bold">Estadísticas de Documentos</h1>
			</div>

			<DocumentCharts />
		</>
	)
}
