import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { Plus } from "lucide-react"
import Link from "next/link"

import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { getWorkOrderById } from "@/actions/work-orders/getWorkOrders"
import { WORK_ORDER_STATUS } from "@prisma/client"
import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"

import { RequestWorkBookClosure } from "@/components/sections/work-book/RequestWorkBookClosure"
import WorkBookEntriesTable from "@/components/sections/work-book/WorkBookEntriesTable"
import WorkBookGeneralData from "@/components/sections/work-book/WorkBookGeneralData"
import BackButton from "@/components/shared/BackButton"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function WorkBooksPage({ params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	const { id } = await params

	const { data } = await getWorkOrderById(id)

	if (!data) {
		return notFound()
	}

	return (
		<>
			<div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-3">
						<BackButton href="/admin/dashboard/libros-de-obras" />

						<div>
							<h1 className="text-2xl font-bold">{data.workName || "Libro de Obras no creado"}</h1>
							<p className="text-feature mt-1 text-base font-medium">{data.otNumber}</p>
						</div>
					</div>

					<div className="flex w-full flex-col items-end gap-2 md:w-64">
						<Badge
							className={cn("bg-primary/5 border-primary text-primary", {
								"border-yellow-500 bg-yellow-500/5 text-yellow-500":
									data.status === WORK_ORDER_STATUS.PENDING,
								"border-green-500 bg-green-500/5 text-green-500":
									data.status === WORK_ORDER_STATUS.COMPLETED,
								"border-red-500 bg-red-500/5 text-red-500":
									data.status === WORK_ORDER_STATUS.CANCELLED ||
									data.status === WORK_ORDER_STATUS.EXPIRED,
							})}
						>
							{WorkOrderStatusLabels[data.status as keyof typeof WorkOrderStatusLabels]}
						</Badge>

						<div className="flex items-center justify-between gap-4">
							<span className="text-sm font-medium">Progreso del trabajo:</span>
							<span className="text-sm font-bold">{data.workProgressStatus}%</span>
						</div>
						<Progress
							value={data.workProgressStatus || 0}
							className="h-2"
							indicatorClassName={
								data.workProgressStatus && data.workProgressStatus > 50
									? "bg-green-500"
									: "bg-yellow-500"
							}
						/>
					</div>
				</div>
			</div>

			<WorkBookGeneralData data={data} />

			<div className="flex w-full items-center gap-2">
				<h2 className="text-text text-2xl font-bold">Lista de Actividades</h2>

				<Link href={`/dashboard/libro-de-obras/${id}/actividades-diarias`} className="ml-auto">
					<Button
						size={"lg"}
						className="border-primary bg-primary hover:bg-primary/80 border text-white"
					>
						<span className="hidden lg:block">Actividad Diaria</span>
						<Plus />
					</Button>
				</Link>

				<Link href={`/dashboard/libro-de-obras/${id}/actividades-adicionales`}>
					<Button
						size={"lg"}
						className="border-cyan-500 bg-cyan-500 text-white hover:bg-cyan-500/80"
					>
						<span className="hidden lg:block">Actividad Adicional</span>
						<Plus />
					</Button>
				</Link>
			</div>

			<WorkBookEntriesTable workOrderId={id} />

			{session?.user?.role === "PARTNER_COMPANY" &&
				session.user.isSupervisor &&
				data.status !== WORK_ORDER_STATUS.CLOSURE_REQUESTED &&
				data.status !== WORK_ORDER_STATUS.CLOSED && (
					<RequestWorkBookClosure workOrderId={id} userId={session?.user?.id} />
				)}
		</>
	)
}
