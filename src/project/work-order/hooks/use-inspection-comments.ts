import { useQuery } from "@tanstack/react-query"

import type { INSPECTION_COMMENT_TYPE } from "@prisma/client"

export interface InspectionComment {
	id: string
	content: string
	type: INSPECTION_COMMENT_TYPE
	isResolved: boolean
	createdAt: string
	updatedAt: string
	author: {
		id: string
		name: string
		image?: string
	}
	attachments: {
		id: string
		name: string
		type: string
		url: string
	}[]
}

interface UseInspectionCommentsProps {
	workEntryId: string
	enabled?: boolean
}

export const useInspectionComments = ({
	workEntryId,
	enabled = true,
}: UseInspectionCommentsProps) => {
	return useQuery({
		queryKey: ["inspection-comments", { workEntryId }],
		queryFn: async (): Promise<InspectionComment[]> => {
			const response = await fetch(`/api/work-order/inspection-comments?workEntryId=${workEntryId}`)
			if (!response.ok) {
				throw new Error("Error al obtener los comentarios")
			}
			return response.json()
		},
		enabled: enabled && !!workEntryId,
		refetchOnWindowFocus: false,
	})
}
