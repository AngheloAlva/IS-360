"use client"

import { SettingsIcon } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

import { useEquipmentMaintenancePlans } from "@/project/equipment/hooks/use-equipment-maintenance-plans"
import { useEquipmentWorkOrders } from "@/project/equipment/hooks/use-equipment-work-orders"
import { useEquipment } from "@/project/equipment/hooks/use-equipments"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { WORK_ORDER_STATUS } from "@prisma/client"
import { cn } from "@/lib/utils"

import { Tabs, TabsContent, TabsContents } from "@/shared/components/ui/tabs"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import Link from "next/link"

interface EquipmentDetailPageProps {
	equipmentId: string
}

export default function EquipmentDetailPage({ equipmentId }: EquipmentDetailPageProps) {
	const { data: equipment, isLoading: isLoadingEquipment } = useEquipment(equipmentId)
	const { data: workOrders, isLoading: isLoadingWorkOrders } = useEquipmentWorkOrders(equipmentId)
	const { data: maintenancePlans, isLoading: isLoadingMaintenancePlans } =
		useEquipmentMaintenancePlans(equipmentId)

	return (
		<div className="flex flex-col gap-6">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<Card className="col-span-1 lg:col-span-1">
					<CardContent className="p-6">
						{isLoadingEquipment ? (
							<EquipmentInfoSkeleton />
						) : equipment ? (
							<div className="flex flex-col gap-4">
								<div className="flex flex-col items-center justify-center">
									<div className="relative h-40 w-40 overflow-hidden rounded-lg border border-emerald-500 bg-emerald-500/10">
										{equipment.imageUrl ? (
											<Image
												fill
												alt={equipment.name}
												src={equipment.imageUrl}
												className="object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center">
												<SettingsIcon className="h-16 w-16 text-emerald-500" />
											</div>
										)}
									</div>

									<div className="mt-4">
										<Button disabled>Subir Imagen (Próximamente)</Button>
										{/* <UploadEquipmentImage
											equipmentId={equipment.id}
											currentImageUrl={equipment.imageUrl}
										/> */}
									</div>
								</div>

								<div className="mt-4 text-center">
									<h2 className="text-2xl font-bold">{equipment.name}</h2>
									<p className="text-muted-foreground text-sm">
										{equipment.barcode || "Sin código"}
									</p>
								</div>

								<div className="mt-2">
									<div className="mb-2 flex items-center justify-between gap-4 border-b pb-2">
										<span className="font-medium">Estado:</span>
										<span
											className={`rounded-full px-2 py-1 text-sm ${
												equipment.isOperational
													? "bg-green-500/10 text-green-500"
													: "bg-red-500/10 text-red-500"
											}`}
										>
											{equipment.isOperational ? "Operativo" : "No Operativo"}
										</span>
									</div>

									<div className="mb-2 flex items-center justify-between gap-4 border-b pb-2">
										<span className="font-medium">Tipo:</span>
										<span>{equipment.type}</span>
									</div>

									<div className="mb-2 flex items-center justify-between gap-4 border-b pb-2">
										<span className="font-medium">Ubicación:</span>
										<span>{equipment.location}</span>
									</div>

									<div className="mb-2 flex items-center justify-between gap-4 border-b pb-2">
										<span className="font-medium">Creado:</span>
										<span>{format(new Date(equipment.createdAt), "dd/MM/yyyy")}</span>
									</div>

									<div className="mb-2 flex items-center justify-between gap-4 border-b pb-2">
										<span className="font-medium">Tag:</span>
										<span>{equipment.tag || "N/A"}</span>
									</div>

									<div className="mt-4">
										<h3 className="mb-2 font-semibold">Descripción:</h3>
										<p className="text-muted-foreground text-sm">
											{equipment.description || "Sin descripción"}
										</p>
									</div>
								</div>
							</div>
						) : (
							<div className="flex h-40 items-center justify-center">
								<p className="text-muted-foreground">No se encontró información del equipo</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Tabs defaultValue="work-orders" className="col-span-1 w-full lg:col-span-2">
					{/* <TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="work-orders">Órdenes de Trabajo</TabsTrigger>
						<TabsTrigger value="maintenance-plans">Planes de Mantenimiento</TabsTrigger>
					</TabsList> */}

					<Card className="p-0">
						<CardContent className="p-0">
							<TabsContents>
								<TabsContent value="work-orders" className="p-4">
									<h3 className="mb-4 text-lg font-semibold">Órdenes de Trabajo Relacionadas</h3>

									{isLoadingWorkOrders ? (
										<WorkOrdersSkeleton />
									) : workOrders && workOrders.length > 0 ? (
										<div className="space-y-4">
											{workOrders.map((workOrder) => (
												<div key={workOrder.id} className="hover:bg-muted/50 rounded-lg border p-4">
													<div className="flex items-center justify-between">
														<div>
															<Link
																href={`/admin/dashboard/ordenes-de-trabajo/${workOrder.id}`}
																className="hover:underline"
															>
																<h4 className="font-medium text-emerald-500 hover:underline">
																	{workOrder.otNumber}
																</h4>
																<p className="text-muted-foreground text-sm">
																	{workOrder.description}
																</p>
															</Link>
														</div>

														<div className="flex flex-col items-end">
															<Badge
																className={cn("bg-yellow-500/10 text-yellow-500", {
																	"bg-orange-500/10 text-orange-500":
																		workOrder.status === WORK_ORDER_STATUS.IN_PROGRESS,
																	"bg-orange-600/10 text-orange-600":
																		workOrder.status === WORK_ORDER_STATUS.CLOSURE_REQUESTED,
																	"bg-red-600/10 text-red-600":
																		workOrder.status === WORK_ORDER_STATUS.PENDING,
																	"bg-emerald-600/10 text-emerald-600":
																		workOrder.status === WORK_ORDER_STATUS.COMPLETED,
																	"bg-red-700/10 text-red-700":
																		workOrder.status === WORK_ORDER_STATUS.CANCELLED,
																})}
															>
																{WorkOrderStatusLabels[workOrder.status]}
															</Badge>
															<span className="text-muted-foreground mt-1 text-xs">
																Solicitado el:{" "}
																{format(new Date(workOrder.solicitationDate), "dd/MM/yyyy")}
															</span>
														</div>
													</div>

													<div className="mt-2 flex flex-wrap gap-4 text-xs">
														<div>
															<span className="font-medium">Tipo:</span>{" "}
															{
																WorkOrderTypeLabels[
																	workOrder.type as keyof typeof WorkOrderTypeLabels
																]
															}
														</div>

														<div>
															<span className="font-medium">Responsable:</span>{" "}
															{workOrder.responsible?.name}
														</div>

														<div>
															<span className="font-medium">Empresa - Supervisor:</span>{" "}
															{workOrder.company.name} - {workOrder.supervisor?.name}
														</div>
													</div>
												</div>
											))}

											<div className="mt-4 flex justify-center">
												<Button variant="outline" disabled size="sm">
													Ver todas las órdenes (En desarrollo)
												</Button>
											</div>
										</div>
									) : (
										<div className="flex h-40 items-center justify-center">
											<p className="text-muted-foreground">
												No hay órdenes de trabajo asociadas a este equipo
											</p>
										</div>
									)}
								</TabsContent>

								<TabsContent value="maintenance-plans" className="p-4">
									<h3 className="mb-4 text-lg font-semibold">Planes de Mantenimiento</h3>

									{isLoadingMaintenancePlans ? (
										<MaintenancePlansSkeleton />
									) : maintenancePlans && maintenancePlans.length > 0 ? (
										<div className="space-y-4">
											{maintenancePlans.map((plan) => (
												<div key={plan.id} className="hover:bg-muted/50 rounded-lg border p-4">
													<div className="flex items-center justify-between">
														<div>
															<h4 className="font-medium">{plan.name}</h4>
															<p className="text-muted-foreground text-sm">
																{plan.description || "Sin descripción"}
															</p>
														</div>
														<div className="flex flex-col items-end">
															<span
																className={`rounded-full px-2 py-1 text-xs ${
																	plan.status === "ACTIVE"
																		? "bg-green-100 text-green-800"
																		: "bg-red-100 text-red-800"
																}`}
															>
																{plan.status}
															</span>
															<span className="text-muted-foreground mt-1 text-xs">
																{new Date(plan.startDate).toLocaleDateString()} -{" "}
																{new Date(plan.endDate).toLocaleDateString()}
															</span>
														</div>
													</div>

													<div className="mt-2 flex flex-wrap gap-4 text-xs">
														<div>
															<span className="font-medium">Frecuencia:</span> {plan.frequency}
														</div>
														<div>
															<span className="font-medium">Ubicación:</span> {plan.location}
														</div>
														<div>
															<span className="font-medium">Tareas:</span> {plan._count?.tasks || 0}
														</div>
													</div>
												</div>
											))}

											<div className="mt-4 flex justify-center">
												<Button variant="outline" disabled size="sm">
													Ver todos los planes (En desarrollo)
												</Button>
											</div>
										</div>
									) : (
										<div className="flex h-40 items-center justify-center">
											<p className="text-muted-foreground">
												No hay planes de mantenimiento asociados a este equipo
											</p>
										</div>
									)}
								</TabsContent>
							</TabsContents>
						</CardContent>
					</Card>
				</Tabs>
			</div>
		</div>
	)
}

function EquipmentInfoSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col items-center justify-center">
				<Skeleton className="h-40 w-40 rounded-full" />
			</div>
			<div className="mt-4 text-center">
				<Skeleton className="mx-auto h-6 w-3/4" />
				<Skeleton className="mx-auto mt-2 h-4 w-1/2" />
			</div>
			<div className="mt-2 space-y-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="flex items-center justify-between">
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="h-4 w-1/3" />
					</div>
				))}
				<div className="mt-4">
					<Skeleton className="h-4 w-1/4" />
					<Skeleton className="mt-2 h-16 w-full" />
				</div>
			</div>
		</div>
	)
}

function WorkOrdersSkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="rounded-lg border p-4">
					<div className="flex items-center justify-between">
						<div>
							<Skeleton className="h-5 w-32" />
							<Skeleton className="mt-1 h-4 w-48" />
						</div>
						<div className="flex flex-col items-end">
							<Skeleton className="h-5 w-16" />
							<Skeleton className="mt-1 h-3 w-20" />
						</div>
					</div>
					<div className="mt-2 flex gap-4">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
			))}
		</div>
	)
}

function MaintenancePlansSkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="rounded-lg border p-4">
					<div className="flex items-center justify-between">
						<div>
							<Skeleton className="h-5 w-32" />
							<Skeleton className="mt-1 h-4 w-48" />
						</div>
						<div className="flex flex-col items-end">
							<Skeleton className="h-5 w-16" />
							<Skeleton className="mt-1 h-3 w-32" />
						</div>
					</div>
					<div className="mt-2 flex gap-4">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-16" />
					</div>
				</div>
			))}
		</div>
	)
}
