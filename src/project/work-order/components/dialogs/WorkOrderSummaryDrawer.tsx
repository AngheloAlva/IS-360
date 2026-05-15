"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { AlertCircleIcon } from "lucide-react"

import { useWorkOrderSummary } from "@/project/work-order/hooks/use-work-order-summary"
import { WorkOrderCAPEXLabels } from "@/lib/consts/work-order-capex"

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/shared/components/ui/sheet"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"

import { WorkOrderStatusBadge } from "@/project/work-order/components/badges/WorkOrderStatusBadge"
import { WorkOrderTypeBadge } from "@/project/work-order/components/badges/WorkOrderTypeBadge"

// ─── Props ────────────────────────────────────────────────────────────────────

interface WorkOrderSummaryDrawerProps {
	workOrderId: string | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DrawerSkeleton() {
	return (
		<div className="space-y-4 p-4">
			<div className="space-y-2">
				<Skeleton className="h-6 w-48" />
				<div className="flex gap-2">
					<Skeleton className="h-5 w-20" />
					<Skeleton className="h-5 w-24" />
				</div>
			</div>
			<div className="grid grid-cols-2 gap-3">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-14 w-full rounded-lg" />
				))}
			</div>
			<Skeleton className="h-10 w-full rounded-lg" />
			<Skeleton className="h-6 w-40" />
			<div className="space-y-2">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="h-10 w-full rounded-md" />
				))}
			</div>
		</div>
	)
}

// ─── Meta field cell ──────────────────────────────────────────────────────────

function MetaCell({ label, value }: { label: string; value: string | null | undefined }) {
	return (
		<div className="rounded-lg border p-3">
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className="mt-0.5 text-sm font-medium">{value ?? "—"}</p>
		</div>
	)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkOrderSummaryDrawer({
	workOrderId,
	open,
	onOpenChange,
}: WorkOrderSummaryDrawerProps) {
	const { data, isLoading, isError, refetch } = useWorkOrderSummary(workOrderId, { open })

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full gap-0 sm:max-w-2xl">
				<SheetHeader className="border-b px-4 pb-3 pt-4">
					<SheetTitle>
						{data
							? `${data.otNumber} — ${data.workRequest}`
							: "Resumen de Orden de Trabajo"}
					</SheetTitle>
					<SheetDescription>
						Detalle rápido de la OT seleccionada.
					</SheetDescription>
				</SheetHeader>

				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						<DrawerSkeleton />
					) : isError ? (
						<div className="flex flex-col items-center gap-3 py-16 text-center">
							<AlertCircleIcon className="h-8 w-8 text-destructive" />
							<p className="text-sm text-destructive">Error al cargar la orden de trabajo.</p>
							<Button variant="outline" size="sm" onClick={() => refetch()}>
								Reintentar
							</Button>
						</div>
					) : data ? (
						<div className="space-y-4 p-4">
							{/* ── Status + type badges ─────────────────────────────────── */}
							<div className="flex flex-wrap gap-2">
								<WorkOrderStatusBadge status={data.status} />
								<WorkOrderTypeBadge type={data.type} />
							</div>

							{/* ── Meta grid ────────────────────────────────────────────── */}
							<div className="grid grid-cols-2 gap-3">
								<MetaCell
									label="Fecha inicio"
									value={format(new Date(data.programDate), "PPP", { locale: es })}
								/>
								<MetaCell
									label="Fecha fin estimada"
									value={format(new Date(data.estimatedEndDate), "PPP", { locale: es })}
								/>
								<MetaCell
									label="CAPEX"
									value={
										data.capex
											? (WorkOrderCAPEXLabels[data.capex as keyof typeof WorkOrderCAPEXLabels] ?? data.capex)
											: null
									}
								/>
								<MetaCell
									label="Responsable"
									value={data.responsible?.name ?? null}
								/>
							</div>

							{/* ── Origin ───────────────────────────────────────────────── */}
							{(data.workRequested ?? data.maintenancePlanTask) ? (
								<div className="rounded-lg border p-3">
									<p className="text-muted-foreground text-xs">Origen</p>
									{data.workRequested ? (
										<p className="mt-0.5 text-sm font-medium">
											Originada desde ST:{" "}
											<Link
												href={`/admin/dashboard/solicitudes-de-trabajo/${data.workRequested.id}`}
												className="text-emerald-600 underline hover:no-underline"
											>
												{data.workRequested.requestNumber}
											</Link>
										</p>
									) : null}
									{data.maintenancePlanTask ? (
										<p className="mt-0.5 text-sm font-medium">
											Desde plan: {data.maintenancePlanTask.name}
										</p>
									) : null}
								</div>
							) : null}

							{/* ── Counts ───────────────────────────────────────────────── */}
							<div className="rounded-lg border px-3 py-2">
								<p className="text-muted-foreground text-xs">
									Hitos:{" "}
									<span className="font-medium text-foreground">{data._count.milestones}</span>
									{" · "}
									Actividades:{" "}
									<span className="font-medium text-foreground">{data._count.workEntries}</span>
									{" · "}
									Inspecciones:{" "}
									<span className="font-medium text-foreground">{data._count.inspections}</span>
								</p>
							</div>

							{/* ── Milestones preview ───────────────────────────────────── */}
							{data.top5.milestones.length > 0 ? (
								<div className="space-y-1">
									<p className="text-sm font-semibold">
										Hitos{" "}
										<span className="text-muted-foreground font-normal text-xs">
											(top {data.top5.milestones.length})
										</span>
									</p>
									{data.top5.milestones.map((m) => (
										<div key={m.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
											<span className="font-medium">{m.name}</span>
											<Badge variant="outline" className="text-xs">{m.status}</Badge>
										</div>
									))}
								</div>
							) : null}

							{/* ── Work entries preview ─────────────────────────────────── */}
							{data.top5.workEntries.length > 0 ? (
								<div className="space-y-1">
									<p className="text-sm font-semibold">
										Actividades{" "}
										<span className="text-muted-foreground font-normal text-xs">
											(top {data.top5.workEntries.length})
										</span>
									</p>
									{data.top5.workEntries.map((we) => (
										<div key={we.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
											<span>{we.activityName ?? "—"}</span>
											<span className="text-muted-foreground text-xs">
												{format(new Date(we.executionDate), "dd/MM/yyyy")}
											</span>
										</div>
									))}
								</div>
							) : null}

							{/* ── Inspections preview ──────────────────────────────────── */}
							{data.top5.inspections.length > 0 ? (
								<div className="space-y-1">
									<p className="text-sm font-semibold">
										Inspecciones{" "}
										<span className="text-muted-foreground font-normal text-xs">
											(top {data.top5.inspections.length})
										</span>
									</p>
									{data.top5.inspections.map((insp) => (
										<div key={insp.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
											<span>{insp.activityName ?? "—"}</span>
											<span className="text-muted-foreground text-xs">
												{format(new Date(insp.executionDate), "dd/MM/yyyy")}
											</span>
										</div>
									))}
								</div>
							) : null}

							{/* ── CTA ──────────────────────────────────────────────────── */}
							<div className="pt-2">
								<Button asChild className="w-full">
									<Link href={`/admin/dashboard/ordenes-de-trabajo/${data.id}`}>
										Ver OT completa
									</Link>
								</Button>
							</div>
						</div>
					) : null}
				</div>
			</SheetContent>
		</Sheet>
	)
}
