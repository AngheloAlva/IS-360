import { useQuery, type QueryFunction } from "@tanstack/react-query"

import type {
	SupportTicket,
	SupportTicketAttachment,
	SupportTicketNote,
} from "@/generated/prisma/client"
import type { SUPPORT_TICKET_STATUS } from "@/generated/prisma/enums"

interface UseSupportTicketsParams {
	page?: number
	pageSize?: number
	limit?: number
	search?: string
	status?: string
}

interface SupportRequester {
	id: string
	name: string
	email: string
	image: string | null
	company: {
		id: string
		name: string
	} | null
}

interface SupportNoteWithAuthor extends SupportTicketNote {
	user: {
		id: string
		name: string
		email: string
		image: string | null
	}
	attachments?: SupportTicketAttachment[]
}

export interface SupportTicketWithRelations extends SupportTicket {
	requester: SupportRequester
	notes?: SupportNoteWithAuthor[]
	attachments?: SupportTicketAttachment[]
}

interface SupportTicketResponse {
	pages: number
	total: number
	tickets: SupportTicketWithRelations[]
}

export const useSupportTickets = ({
	page = 1,
	pageSize,
	limit,
	search = "",
	status = "all",
}: UseSupportTicketsParams = {}) => {
	const resolvedLimit = limit ?? pageSize ?? 10

	return useQuery<SupportTicketResponse>({
		queryKey: ["supportTickets", { page, limit: resolvedLimit, search, status }],
		queryFn: (fn) =>
			fetchSupportTickets({
				...fn,
				queryKey: ["supportTickets", { page, limit: resolvedLimit, search, status }],
			}),
	})
}

export const fetchSupportTickets: QueryFunction<
	SupportTicketResponse,
	["supportTickets", UseSupportTicketsParams]
> = async ({ queryKey }) => {
	const [, { page, limit, search, status }] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page?.toString() || "1")
	searchParams.set("limit", limit?.toString() || "10")
	if (search) searchParams.set("search", search)
	if (status) searchParams.set("status", status)

	const res = await fetch(`/api/support?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching support tickets")

	return res.json()
}

export const useSupportTicketById = ({ id, enabled }: { id: string; enabled: boolean }) => {
	return useQuery<SupportTicketWithRelations>({
		queryKey: ["supportTicket", id],
		queryFn: async () => {
			const response = await fetch(`/api/support/${id}`)
			if (!response.ok) throw new Error("Error fetching support ticket details")
			return response.json()
		},
		enabled: enabled && Boolean(id),
	})
}

export const SUPPORT_STATUS_FILTERS: Array<{
	value: "all" | SUPPORT_TICKET_STATUS
	label: string
}> = [
	{ value: "all", label: "Todos" },
	{ value: "REPORTED", label: "Reportado" },
	{ value: "IN_PROGRESS", label: "En proceso" },
	{ value: "RESOLVED", label: "Resuelto" },
	{ value: "REJECTED", label: "Rechazado" },
]
