import { Suspense } from "react"
import { Metadata } from "next"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import WorkPermitsOverview from "@/components/work-permit/admin/WorkPermitsOverview"
import WorkPermitsTable from "@/components/work-permit/admin/WorkPermitsTable"
import WorkPermitsStats from "@/components/work-permit/admin/WorkPermitsStats"
import WorkPermitsCharts from "@/components/work-permit/admin/WorkPermitsCharts"

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
