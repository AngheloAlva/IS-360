"use client"

import { useState } from "react"
import {
	TagIcon,
	InfoIcon,
	UsersIcon,
	MapPinIcon,
	CalendarIcon,
	HardDriveIcon,
	ExternalLinkIcon,
	ClipboardListIcon,
	Wrench as ToolIcon,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { useEquipment } from "@/project/equipment/hooks/use-equipments"
import { useEquipmentWorkOrders } from "../../hooks/use-equipment-work-orders"
import { useEquipmentMaintenancePlans } from "../../hooks/use-equipment-maintenance-plans"

import { Button } from "@/shared/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Badge } from "@/shared/components/ui/badge"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Skeleton } from "@/shared/components/ui/skeleton"

interface EquipmentDetailProps {
	equipmentId: string | null
	onViewDetails: (id: string) => void
}

export default function EquipmentDetail({ equipmentId, onViewDetails }: EquipmentDetailProps) {
	const [activeTab, setActiveTab] = useState("overview")

	const { data: equipment, isLoading } = useEquipment(equipmentId || "")
	const { data: workOrders, isLoading: isLoadingWorkOrders } = useEquipmentWorkOrders(
		equipmentId || "",
		{ enabled: !!equipmentId && activeTab === "work-orders" }
	)
	const { data: maintenancePlans, isLoading: isLoadingMaintenancePlans } =
		useEquipmentMaintenancePlans(equipmentId || "", {
			enabled: !!equipmentId && activeTab === "maintenance",
		})

	if (!equipmentId) {
		return (
			<div className="flex h-[500px] flex-col items-center justify-center text-center">
				<HardDriveIcon className="mb-4 h-16 w-16 text-gray-300" />
				<h3 className="text-xl font-medium text-gray-700">Selecciona un equipo</h3>
				<p className="mt-2 text-gray-500">
					Haz clic en un equipo de la lista para ver sus detalles
				</p>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-40 w-40 rounded-full" />
				</div>
				<div className="mt-4 space-y-2">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-4 w-24" />
				</div>
				<Skeleton className="h-[400px] w-full" />
			</div>
		)
	}

	if (!equipment) {
		return (
			<div className="flex h-[500px] flex-col items-center justify-center text-center">
				<InfoIcon className="mb-4 h-16 w-16 text-gray-300" />
				<h3 className="text-xl font-medium text-gray-700">Equipo no encontrado</h3>
				<p className="mt-2 text-gray-500">No se pudo cargar la información del equipo</p>
			</div>
		)
	}

	// Destructuring equipment properties for use in the component
	const {
		id,
		name,
		description,
		location,
		tag,
		imageUrl,
		isOperational,
		parentId,
		createdAt,
		type,
		_count,
		criticality,
	} = equipment

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-6 md:flex-row">
				<div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-lg border bg-gray-100">
					{imageUrl ? (
						<Image src={imageUrl} alt={name} fill className="object-cover" />
					) : (
						<div className="flex h-full w-full items-center justify-center">
							<HardDriveIcon className="h-16 w-16 text-gray-300" />
						</div>
					)}
				</div>

				<div className="flex-1 space-y-4">
					<div>
						<div className="flex items-center justify-between">
							<h1 className="text-2xl font-bold text-gray-900">{name}</h1>
							<Badge variant={isOperational ? "outline" : "destructive"}>
								{isOperational ? "Operativo" : "No Operativo"}
							</Badge>
						</div>
						<p className="text-gray-500">{description || "Sin descripción"}</p>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex items-center gap-2">
							<TagIcon className="h-4 w-4 text-emerald-600" />
							<span className="text-sm font-medium">TAG:</span>
							<span className="text-sm text-gray-600">{tag}</span>
						</div>
						<div className="flex items-center gap-2">
							<MapPinIcon className="h-4 w-4 text-emerald-600" />
							<span className="text-sm font-medium">Ubicación:</span>
							<span className="text-sm text-gray-600">{location}</span>
						</div>
						<div className="flex items-center gap-2">
							<ToolIcon className="h-4 w-4 text-emerald-600" />
							<span className="text-sm font-medium">Tipo:</span>
							<span className="text-sm text-gray-600">{type || "No especificado"}</span>
						</div>
						<div className="flex items-center gap-2">
							<CalendarIcon className="h-4 w-4 text-emerald-600" />
							<span className="text-sm font-medium">Creado:</span>
							<span className="text-sm text-gray-600">
								{new Date(createdAt).toLocaleDateString()}
							</span>
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						<Button
							onClick={() => onViewDetails(id)}
							className="bg-emerald-600 text-white hover:bg-emerald-700"
						>
							Ver detalles completos
							<ExternalLinkIcon className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="overview">Resumen</TabsTrigger>
					<TabsTrigger value="work-orders">Órdenes de Trabajo</TabsTrigger>
					<TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Información General</CardTitle>
							<CardDescription>Resumen de información del equipo</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2 rounded-lg border p-4">
									<div className="flex items-center gap-2">
										<HardDriveIcon className="h-5 w-5 text-emerald-600" />
										<h3 className="font-medium">Equipos Hijos</h3>
									</div>
									<p className="text-2xl font-bold">{_count?.children || 0}</p>
									<p className="text-sm text-gray-500">
										{_count?.children
											? "Equipos conectados a este equipo"
											: "No hay equipos hijos conectados"}
									</p>
								</div>

								<div className="space-y-2 rounded-lg border p-4">
									<div className="flex items-center gap-2">
										<ClipboardListIcon className="h-5 w-5 text-emerald-600" />
										<h3 className="font-medium">Órdenes de Trabajo</h3>
									</div>
									<p className="text-2xl font-bold">{_count?.workOrders || 0}</p>
									<p className="text-sm text-gray-500">
										{_count?.workOrders
											? "Órdenes de trabajo asociadas"
											: "No hay órdenes de trabajo"}
									</p>
								</div>
							</div>

							{parentId && (
								<div className="rounded-lg border p-4">
									<div className="flex items-center gap-2">
										<HardDriveIcon className="h-5 w-5 text-emerald-600" />
										<h3 className="font-medium">Equipo Padre</h3>
									</div>
									<p className="mt-2 text-sm text-gray-500">
										Este equipo está conectado a un equipo padre
									</p>
									<Button
										variant="link"
										className="mt-1 p-0 text-emerald-600"
										onClick={() => onViewDetails(parentId as string)}
									>
										Ver equipo padre
									</Button>
								</div>
							)}

							{criticality && (
								<div className="rounded-lg border p-4">
									<div className="flex items-center gap-2">
										<InfoIcon className="h-5 w-5 text-emerald-600" />
										<h3 className="font-medium">Criticidad</h3>
									</div>
									<Badge className="mt-2" variant="outline">
										{criticality === "CRITICAL"
											? "Crítico"
											: criticality === "SEMICRITICAL"
												? "Semi-crítico"
												: "No crítico"}
									</Badge>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="work-orders" className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Órdenes de Trabajo</CardTitle>
							<CardDescription>Últimas órdenes de trabajo asociadas a este equipo</CardDescription>
						</CardHeader>
						<CardContent>
							<ScrollArea className="h-[300px]">
								{isLoadingWorkOrders ? (
									<div className="space-y-3">
										{Array.from({ length: 3 }).map((_, index) => (
											<div key={index} className="flex items-center gap-3 rounded-md border p-3">
												<Skeleton className="h-10 w-10 rounded-md" />
												<div className="flex-1 space-y-2">
													<Skeleton className="h-4 w-3/4" />
													<Skeleton className="h-3 w-1/2" />
												</div>
											</div>
										))}
									</div>
								) : workOrders && workOrders.length > 0 ? (
									<div className="space-y-3">
										{workOrders.map((workOrder) => (
											<div
												key={workOrder.id}
												className="flex items-center gap-3 rounded-md border p-3"
											>
												<div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 text-blue-600">
													<ClipboardListIcon className="h-5 w-5" />
												</div>
												<div className="flex-1">
													<div className="flex items-center justify-between">
														<h3 className="font-medium">OT #{workOrder.otNumber}</h3>
														<Badge
															variant={
																workOrder.status === "COMPLETED"
																	? "secondary"
																	: workOrder.status === "IN_PROGRESS"
																		? "outline"
																		: workOrder.status === "PENDING"
																			? "outline"
																			: "outline"
															}
														>
															{workOrder.status === "COMPLETED"
																? "Completada"
																: workOrder.status === "IN_PROGRESS"
																	? "En Progreso"
																	: workOrder.status === "PENDING"
																		? "Pendiente"
																		: workOrder.status}
														</Badge>
													</div>
													<div className="flex items-center text-sm text-gray-500">
														<UsersIcon className="mr-1 h-3 w-3" />
														<span>{workOrder.responsible?.name || "No asignado"}</span>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="flex flex-col items-center justify-center py-8 text-center">
										<ClipboardListIcon className="mb-2 h-12 w-12 text-gray-300" />
										<h3 className="text-lg font-medium">No hay órdenes de trabajo</h3>
										<p className="text-sm text-gray-500">
											Este equipo no tiene órdenes de trabajo asociadas
										</p>
									</div>
								)}
							</ScrollArea>

							{workOrders && workOrders.length > 0 && (
								<div className="mt-4 flex justify-center">
									<Button
										variant="outline"
										className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
										asChild
									>
										<Link href={`/admin/dashboard/equipos/${id}/detail`}>
											Ver todas las órdenes de trabajo
										</Link>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="maintenance" className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Planes de Mantenimiento</CardTitle>
							<CardDescription>Planes de mantenimiento asociados a este equipo</CardDescription>
						</CardHeader>
						<CardContent>
							<ScrollArea className="h-[300px]">
								{isLoadingMaintenancePlans ? (
									<div className="space-y-3">
										{Array.from({ length: 3 }).map((_, index) => (
											<div key={index} className="flex items-center gap-3 rounded-md border p-3">
												<Skeleton className="h-10 w-10 rounded-md" />
												<div className="flex-1 space-y-2">
													<Skeleton className="h-4 w-3/4" />
													<Skeleton className="h-3 w-1/2" />
												</div>
											</div>
										))}
									</div>
								) : maintenancePlans && maintenancePlans.length > 0 ? (
									<div className="space-y-3">
										{maintenancePlans.map((plan) => (
											<div key={plan.id} className="flex items-center gap-3 rounded-md border p-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100 text-green-600">
													<ToolIcon className="h-5 w-5" />
												</div>
												<div className="flex-1">
													<div className="flex items-center justify-between">
														<h3 className="font-medium">{plan.name}</h3>
														<Badge
															variant={
																plan.status === "COMPLETED"
																	? "secondary"
																	: plan.status === "CANCELLED"
																		? "destructive"
																		: plan.status === "IN_PROGRESS"
																			? "outline"
																			: "outline"
															}
														>
															{plan.status}
														</Badge>
													</div>
													<div className="flex items-center text-sm text-gray-500">
														<CalendarIcon className="mr-1 h-3 w-3" />
														<span>
															{new Date(plan.startDate).toLocaleDateString()} -{" "}
															{new Date(plan.endDate).toLocaleDateString()}
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="flex flex-col items-center justify-center py-8 text-center">
										<ToolIcon className="mb-2 h-12 w-12 text-gray-300" />
										<h3 className="text-lg font-medium">No hay planes de mantenimiento</h3>
										<p className="text-sm text-gray-500">
											Este equipo no tiene planes de mantenimiento asociados
										</p>
									</div>
								)}
							</ScrollArea>

							{maintenancePlans && maintenancePlans.length > 0 && (
								<div className="mt-4 flex justify-center">
									<Button
										variant="outline"
										className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
										asChild
									>
										<Link href={`/admin/dashboard/equipos/${id}/detail`}>
											Ver todos los planes de mantenimiento
										</Link>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
