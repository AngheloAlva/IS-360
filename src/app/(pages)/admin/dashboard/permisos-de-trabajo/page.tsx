import { Suspense } from "react"
import { Metadata } from "next"

import WorkPermitsOverview from "@/features/work-permit/components/admin/WorkPermitsOverview"
import WorkPermitsCharts from "@/features/work-permit/components/charts/WorkPermitsCharts"
import WorkPermitsStats from "@/features/work-permit/components/charts/WorkPermitsStats"
import WorkPermitsTable from "@/features/work-permit/components/data/WorkPermitsTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Card } from "@/shared/components/ui/card"

export const metadata: Metadata = {
	title: "Administración de Permisos de Trabajo | OTC",
	description: "Panel de administración de permisos de trabajo",
}

export default function WorkPermitsAdminPage() {
	return (
		<div className="flex w-full flex-col gap-6">
			<h1 className="text-3xl font-bold">Administración de Permisos de Trabajo</h1>

			<Tabs defaultValue="overview" className="w-full space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Vista General</TabsTrigger>
					<TabsTrigger value="stats">Estadísticas</TabsTrigger>
					<TabsTrigger value="charts">Gráficos</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="w-full space-y-4">
					<Suspense fallback={<Card className="h-[200px] animate-pulse" />}>
						<WorkPermitsOverview />
					</Suspense>
				</TabsContent>

				<TabsContent value="stats" className="w-full space-y-4">
					<Suspense fallback={<Card className="h-[200px] animate-pulse" />}>
						<WorkPermitsStats />
					</Suspense>
				</TabsContent>

				<TabsContent value="charts" className="w-full space-y-4">
					{/* <Suspense fallback={<Card className="h-[400px] animate-pulse" />}> */}
					<WorkPermitsCharts />
					{/* </Suspense> */}
				</TabsContent>
			</Tabs>

			<Suspense fallback={<Card className="h-[600px] animate-pulse" />}>
				<WorkPermitsTable />
			</Suspense>
		</div>
	)
}
