"use client"

import { CalendarCheckIcon, ClipboardCheckIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"

import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogTrigger,
	DialogDescription,
} from "@/shared/components/ui/dialog"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"
import { cn } from "@/lib/utils"

interface SafetyTalk {
	id: string
	category: string
	status: string
	score: number | null
	expiresAt: Date | null
	currentAttempts: number
	completedAt: Date | null
	manuallyApproved: boolean
	lastAttemptAt: Date | null
	inPersonSessionDate: Date | null
}

interface WorkerInfo {
	id: string
	name: string
	rut: string
}

interface SafetyTalksDialogProps {
	workerId: string
	workerName: string
}

const categoryLabels: Record<string, string> = {
	VISITOR: "Visitas - Hualpén",
	VISITOR_TRM: "Visitas - El Avellano",
	IRL: "IRL",
}

const statusLabels: Record<
	string,
	{
		label: string
		variant: "default" | "secondary" | "destructive" | "outline"
		className?: string
	}
> = {
	NOT_STARTED: { label: "No Iniciado", variant: "outline", className: "text-gray-500" },
	PENDING: { label: "Pendiente", variant: "outline" },
	IN_PROGRESS: { label: "En Progreso", variant: "default" },
	PASSED: {
		label: "Aprobado",
		variant: "default",
		className: "bg-teal-500 text-white border-teal-600",
	},
	FAILED: {
		label: "Reprobado",
		variant: "destructive",
		className: "bg-rose-500 text-white border-rose-600",
	},
	BLOCKED: { label: "Bloqueado", variant: "destructive" },
	MANUALLY_APPROVED: {
		label: "Aprobado Manual",
		variant: "default",
		className: "bg-teal-600 text-white border-teal-700",
	},
}

export function SafetyTalksDialog({ workerId, workerName }: SafetyTalksDialogProps) {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [worker, setWorker] = useState<WorkerInfo | null>(null)
	const [safetyTalks, setSafetyTalks] = useState<SafetyTalk[]>([])
	const [error, setError] = useState<string | null>(null)

	const fetchSafetyTalks = async () => {
		setLoading(true)
		setError(null)
		try {
			const response = await fetch(`/api/safety-talks/by-worker/${workerId}`)
			if (!response.ok) {
				throw new Error("Error al cargar las charlas")
			}
			const data = await response.json()
			setWorker(data.worker)
			setSafetyTalks(data.safetyTalks)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error desconocido")
		} finally {
			setLoading(false)
		}
	}

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen)
		if (newOpen && !loading && safetyTalks.length === 0) {
   void fetchSafetyTalks()
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" title="Ver charlas de seguridad">
					<ClipboardCheckIcon className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Charlas de Seguridad - {workerName}</DialogTitle>
					<DialogDescription>
						Estado de las charlas de seguridad del trabajador {workerName} - {worker?.rut}
					</DialogDescription>
				</DialogHeader>

				{loading ? (
					<div className="space-y-3">
						{" "}
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
					</div>
				) : error ? (
					<div className="text-destructive py-8 text-center">
						<p>{error}</p>
						<Button onClick={fetchSafetyTalks} variant="outline" className="mt-4">
							Reintentar
						</Button>
					</div>
				) : safetyTalks.length === 0 ? (
					<div className="text-muted-foreground py-8 text-center">
						<p>No se pudieron cargar las charlas de seguridad</p>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Categoría</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead>Puntaje</TableHead>
								<TableHead>Intentos</TableHead>
								<TableHead>Último Intento</TableHead>
								<TableHead>Completado</TableHead>
								<TableHead>Expira</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{safetyTalks.map((talk) => (
								<TableRow key={talk.id}>
									<TableCell className="font-semibold">
										{categoryLabels[talk.category] || talk.category}
									</TableCell>
									<TableCell>
										<Badge
											variant={statusLabels[talk.status]?.variant || "outline"}
											className={statusLabels[talk.status]?.className}
										>
											{statusLabels[talk.status]?.label || talk.status}
										</Badge>
										{talk.manuallyApproved && (
											<Badge variant="outline" className="ml-2">
												Manual
											</Badge>
										)}
									</TableCell>
									<TableCell>{talk.score !== null ? `${talk.score.toFixed(1)}%` : "-"}</TableCell>
									<TableCell>{talk.currentAttempts}</TableCell>
									<TableCell>
										{talk.lastAttemptAt
											? format(new Date(talk.lastAttemptAt), "dd/MM/yyyy", { locale: es })
											: "-"}
									</TableCell>
									<TableCell className="flex items-center gap-2">
										<CalendarCheckIcon className="text-muted-foreground h-3.5 w-3.5" />
										{talk.completedAt
											? format(new Date(talk.completedAt), "dd/MM/yyyy", { locale: es })
											: "-"}
									</TableCell>
									<TableCell className="">
										{talk.expiresAt ? (
											<span
												className={cn("flex items-center gap-2", {
													"text-destructive font-semibold": new Date(talk.expiresAt) < new Date(),
												})}
											>
												<CalendarCheckIcon className="text-muted-foreground h-3.5 w-3.5" />
												{format(new Date(talk.expiresAt), "dd/MM/yyyy", { locale: es })}
											</span>
										) : (
											"-"
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</DialogContent>
		</Dialog>
	)
}
