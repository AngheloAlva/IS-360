"use client"

import {
	CircleCheckBigIcon,
	CircleDashedIcon,
	CircleXIcon,
	Clock3Icon,
	LifeBuoyIcon,
	TimerResetIcon,
} from "lucide-react"

import CreateSupportTicketDialog from "@/project/support/components/forms/CreateSupportTicketDialog"
import SupportTicketsTable from "@/project/support/components/data/SupportTicketsTable"

import { Badge } from "@/shared/components/ui/badge"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"

interface SupportDashboardProps {
	isAdmin: boolean
}

export default function SupportDashboard({ isAdmin }: SupportDashboardProps) {
	return (
		<div className="flex h-full w-full flex-1 flex-col gap-6">
			<div className="rounded-lg bg-linear-to-r from-indigo-600 to-cyan-600 p-6 shadow-lg dark:from-indigo-800 dark:to-cyan-800">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="space-y-2 text-white">
						<h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
							<LifeBuoyIcon className="size-7" />
							Soporte
						</h1>
						<p className="max-w-3xl opacity-90">
							Modulo de soporte para crear tickets, dar seguimiento y gestionar estados.
						</p>
					</div>

					<div className="flex items-center gap-2">
						{isAdmin ? (
							<Badge className="bg-white/20 text-white">Vista admin</Badge>
						) : (
							<Badge className="bg-white/20 text-white">Vista contratista</Badge>
						)}
						<CreateSupportTicketDialog />
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Flujo operativo</CardTitle>
					<CardDescription>
						Estados gestionados por administracion con historial y tiempos.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
						<div className="flex items-start gap-3 rounded-lg border p-3">
							<CircleDashedIcon className="mt-0.5 size-4 text-amber-500" />
							<div>
								<p className="font-semibold">En proceso</p>
								<p className="text-muted-foreground text-sm">
									Se esta revisando o trabajando con observaciones tecnicas.
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-lg border p-3">
							<CircleCheckBigIcon className="mt-0.5 size-4 text-emerald-500" />
							<div>
								<p className="font-semibold">Resuelto</p>
								<p className="text-muted-foreground text-sm">
									Se cierra el ticket y se notifica al solicitante por correo.
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-lg border p-3">
							<CircleXIcon className="mt-0.5 size-4 text-rose-500" />
							<div>
								<p className="font-semibold">Rechazado</p>
								<p className="text-muted-foreground text-sm">
									Se rechaza cuando no aplica, dejando motivo registrado.
								</p>
							</div>
						</div>
					</div>

					<div className="bg-muted/50 mt-3 grid grid-cols-1 gap-2 rounded-lg border p-3 text-sm sm:grid-cols-2">
						<div className="text-muted-foreground flex items-center justify-between gap-2">
							<span className="flex items-center gap-2">
								<Clock3Icon className="size-4" /> Tiempo medio de respuesta
							</span>
							<span>-</span>
						</div>
						<div className="text-muted-foreground flex items-center justify-between gap-2">
							<span className="flex items-center gap-2">
								<TimerResetIcon className="size-4" /> Tiempo medio de cierre
							</span>
							<span>-</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<SupportTicketsTable isAdmin={isAdmin} />
		</div>
	)
}
