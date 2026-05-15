"use client"

import { MessageSquareTextIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { useSupportTickets } from "@/project/support/hooks/use-support-tickets"
import {
	SupportPriorityBadge,
	SupportStatusBadge,
} from "@/project/support/components/ui/SupportBadges"
import SupportTicketDetailsSheet from "@/project/support/components/dialogs/SupportTicketDetailsSheet"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

interface SupportTicketsTableProps {
	isAdmin: boolean
}

export default function SupportTicketsTable({ isAdmin }: SupportTicketsTableProps) {
	const { data, isLoading } = useSupportTickets({
		limit: 50,
	})
	const tickets = data?.tickets ?? []

	const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
	const [detailsOpen, setDetailsOpen] = useState(false)

	const groupedTickets = useMemo(
		() => ({
			todos: tickets,
			reported: tickets.filter((ticket) => ticket.status === "REPORTED"),
			enProceso: tickets.filter((ticket) => ticket.status === "IN_PROGRESS"),
			resueltos: tickets.filter((ticket) => ticket.status === "RESOLVED"),
			rechazados: tickets.filter((ticket) => ticket.status === "REJECTED"),
		}),
		[tickets]
	)

	const handleOpenDetails = (ticketId: string) => {
		setSelectedTicketId(ticketId)
		setDetailsOpen(true)
	}

	const renderTable = (rows: typeof tickets, emptyLabel: string) => (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Ticket</TableHead>
					<TableHead>Tipo</TableHead>
					<TableHead>Prioridad</TableHead>
					<TableHead>Modulo</TableHead>
					<TableHead>Estado</TableHead>
					<TableHead>Solicitante</TableHead>
					<TableHead>Empresa</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{rows.length === 0 ? (
					<TableRow>
						<TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
							{emptyLabel}
						</TableCell>
					</TableRow>
				) : (
					rows.map((ticket) => (
						<TableRow
							key={ticket.id}
							className="cursor-pointer"
							onClick={() => handleOpenDetails(ticket.id)}
						>
							<TableCell>
								<div className="space-y-1">
									<p className="font-semibold">{ticket.ticketNumber}</p>
									<p className="text-muted-foreground max-w-[380px] whitespace-normal">
										{ticket.title}
									</p>
									<p className="text-muted-foreground text-xs">
										{new Date(ticket.createdAt).toLocaleString("es-CL")}
									</p>
								</div>
							</TableCell>
							<TableCell>{ticket.type}</TableCell>
							<TableCell>
								<SupportPriorityBadge priority={ticket.priority} />
							</TableCell>
							<TableCell>{ticket.affectedModule || "No especificado"}</TableCell>
							<TableCell>
								<SupportStatusBadge status={ticket.status} />
							</TableCell>
							<TableCell>{ticket.requester.name}</TableCell>
							<TableCell>{ticket.requester.company?.name || "-"}</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	)

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageSquareTextIcon className="size-4" />
						Seguimiento de tickets
					</CardTitle>
					<CardDescription>
						{isAdmin
							? "Vista completa de tickets internos y externos"
							: "Solo puedes ver los tickets creados por tu usuario"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? <p className="text-muted-foreground text-sm">Cargando tickets...</p> : null}

					<Tabs defaultValue="todos" className="w-full">
						<TabsList className="mb-3 h-10 w-full justify-start gap-2 overflow-x-auto">
							<TabsTrigger value="todos">Todos ({groupedTickets.todos.length})</TabsTrigger>
							<TabsTrigger value="reported">
								Reportados ({groupedTickets.reported.length})
							</TabsTrigger>
							<TabsTrigger value="enProceso">
								En proceso ({groupedTickets.enProceso.length})
							</TabsTrigger>
							<TabsTrigger value="resueltos">
								Resueltos ({groupedTickets.resueltos.length})
							</TabsTrigger>
							<TabsTrigger value="rechazados">
								Rechazados ({groupedTickets.rechazados.length})
							</TabsTrigger>
						</TabsList>

						<TabsContent value="todos" className="mt-0">
							{renderTable(groupedTickets.todos, "No hay tickets para mostrar.")}
						</TabsContent>
						<TabsContent value="reported" className="mt-0">
							{renderTable(groupedTickets.reported, "No hay tickets reportados.")}
						</TabsContent>
						<TabsContent value="enProceso" className="mt-0">
							{renderTable(groupedTickets.enProceso, "No hay tickets en proceso.")}
						</TabsContent>
						<TabsContent value="resueltos" className="mt-0">
							{renderTable(groupedTickets.resueltos, "No hay tickets resueltos.")}
						</TabsContent>
						<TabsContent value="rechazados" className="mt-0">
							{renderTable(groupedTickets.rechazados, "No hay tickets rechazados.")}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			<SupportTicketDetailsSheet
				open={detailsOpen}
				onOpenChange={setDetailsOpen}
				ticketId={selectedTicketId}
				isAdmin={isAdmin}
			/>
		</>
	)
}
