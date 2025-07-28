import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { WorkOrderStatsContainer } from "@/project/work-order/components/stats/work-order/WorkOrderStatsContainer"
import CreateWorkOrderForm from "@/project/work-order/components/forms/CreateWorkOrderForm"
import { WorkOrderTable } from "@/project/work-order/components/data/WorkOrderTable"
import NewWorkBookForm from "@/project/work-order/components/forms/NewWorkBookForm"
import ScrollToTableButton from "@/shared/components/ScrollToTable"
import VideoTutorials from "@/shared/components/VideoTutorials"
import ModuleHeader from "@/shared/components/ModuleHeader"

export default async function AdminUsersPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const [hasPermission, hassWorkBookPermission] = await Promise.all([
		auth.api.userHasPermission({
			body: {
				userId: session.user.id,
				permissions: {
					workOrder: ["create"],
				},
			},
		}),
		auth.api.userHasPermission({
			body: {
				userId: session.user.id,
				permissions: {
					workBook: ["create"],
				},
			},
		}),
	])

	return (
		<div className={"flex h-full w-full flex-1 flex-col gap-8 transition-all"}>
			<ModuleHeader
				title="Órdenes de Trabajo"
				className="from-orange-600 to-red-600"
				description="Gestión y seguimiento de órdenes de trabajo"
			>
				<>
					<VideoTutorials
						className="text-red-500"
						videos={[
							{
								title: "Creacion Orden de Trabajo",
								description: "Tutorial de como crear una orden de trabajo.",
								url: "https://youtube.com/embed/Yg_ZiODHu1U",
							},
							{
								title: "Creacion Libro de Obras",
								description: "Tutorial de como crear un libro de obras.",
								url: "https://youtube.com/embed/K_LHCpommos",
							},
							{
								title: "Cierre de Hitos",
								description: "Tutorial de como cerrar hitos de una orden de trabajo.",
								url: "https://youtube.com/embed/cTT1T9zIl7Q",
							},
							{
								title: "Funcionalidades OT",
								description: "Muestra todas las funcionalidades de las ordenes de trabajo.",
								url: "https://youtube.com/embed/guIR3J8qyT8",
							},
							{
								title: "Funcionalidades Libro de Obras",
								description: "Muestra todas las funcionalidades de los libros de obras.",
								url: "https://youtube.com/embed/vJTegLRfjDY",
							},
							{
								title: "Edicion OT",
								description: "Tutorial de como editar una orden de trabajo.",
								url: "https://youtube.com/embed/7tkrv7JHOKs",
							},
						]}
					/>

					<ScrollToTableButton
						id="work-order-table"
						label="Lista Órdenes"
						className="text-red-600 hover:bg-white hover:text-red-600"
					/>

					{hasPermission.success && <CreateWorkOrderForm />}

					{hassWorkBookPermission.success && (
						<NewWorkBookForm
							userId={session.user.id}
							companyId={process.env.NEXT_PUBLIC_OTC_COMPANY_ID!}
							className="text-amber-600 hover:bg-white hover:text-amber-600"
						/>
					)}
				</>
			</ModuleHeader>

			<div className="space-y-4">
				<WorkOrderStatsContainer />
			</div>

			<WorkOrderTable id="work-order-table" />
		</div>
	)
}
