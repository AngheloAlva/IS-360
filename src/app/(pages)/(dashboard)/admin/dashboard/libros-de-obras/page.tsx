import { Suspense } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WorkBooksOverview from "@/components/work-book/admin/WorkBooksOverview"
import WorkBooksStats from "@/components/work-book/admin/WorkBooksStats"
import WorkBooksCharts from "@/components/work-book/admin/WorkBooksCharts"
import WorkBooksTable from "@/components/work-book/admin/WorkBooksTable"

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

				<TabsContent value="overview" className="w-full space-y-4">
					<Suspense fallback={<Card className="h-[200px] animate-pulse" />}>
						<WorkBooksOverview />
					</Suspense>
				</TabsContent>

				<TabsContent value="stats" className="w-full space-y-4">
					<Suspense fallback={<Card className="h-[200px] animate-pulse" />}>
						<WorkBooksStats />
					</Suspense>
				</TabsContent>

				<TabsContent value="charts" className="w-full space-y-4">
					<WorkBooksCharts />
				</TabsContent>
			</Tabs>

			<Suspense fallback={<Card className="h-[600px] animate-pulse" />}>
				<WorkBooksTable />
			</Suspense>
		</div>
	)
}
