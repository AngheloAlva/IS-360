import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WorkBooksAdminPage() {
	return (
		<div className="flex w-full flex-col gap-6">
			<h1 className="text-3xl font-bold">Administración de Libros de Trabajo</h1>

			<Tabs defaultValue="overview" className="w-full space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Vista General</TabsTrigger>
					<TabsTrigger value="stats">Estadísticas</TabsTrigger>
					<TabsTrigger value="charts">Gráficos</TabsTrigger>
				</TabsList>
			</Tabs>
		</div>
	)
}
