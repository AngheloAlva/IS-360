import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import type { StartupGuideDocumentVisibility } from "@/generated/prisma/enums"
import type { GuideDocumentInput, UpdateGuideDocumentInput } from "../schemas/guide-document.schema"

import { createGuideDocument } from "../actions/guide-documents/createGuideDocument"
import { updateGuideDocument } from "../actions/guide-documents/updateGuideDocument"
import { deleteGuideDocument } from "../actions/guide-documents/deleteGuideDocument"

export interface GuideDocument {
	id: string
	name: string
	description: string | null
	url: string
	type: string
	size: number | null
	visibility: StartupGuideDocumentVisibility
	order: number
	isActive: boolean
	createdAt: string
	updatedAt: string
	createdBy: {
		id: string
		name: string
	}
}

interface UseGuideDocumentsParams {
	visibility?: StartupGuideDocumentVisibility
	includeInactive?: boolean
}

const fetchGuideDocuments = async ({
	visibility,
	includeInactive,
}: UseGuideDocumentsParams): Promise<GuideDocument[]> => {
	const searchParams = new URLSearchParams()
	if (visibility) searchParams.set("visibility", visibility)
	if (includeInactive) searchParams.set("includeInactive", "true")

	const res = await fetch(`/api/startup-guide-documents?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching guide documents")

	return res.json()
}

export const useGuideDocuments = ({
	visibility,
	includeInactive = false,
}: UseGuideDocumentsParams = {}) => {
	return useQuery({
		queryKey: ["guideDocuments", { visibility, includeInactive }],
		queryFn: () => fetchGuideDocuments({ visibility, includeInactive }),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	})
}

export const useCreateGuideDocument = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: GuideDocumentInput) => createGuideDocument(data),
		onSuccess: (result) => {
			if (result.ok) {
    void queryClient.invalidateQueries({ queryKey: ["guideDocuments"] })
			}
		},
	})
}

export const useUpdateGuideDocument = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: UpdateGuideDocumentInput) => updateGuideDocument(data),
		onSuccess: (result) => {
			if (result.ok) {
    void queryClient.invalidateQueries({ queryKey: ["guideDocuments"] })
			}
		},
	})
}

export const useDeleteGuideDocument = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => deleteGuideDocument({ id }),
		onSuccess: (result) => {
			if (result.ok) {
    void queryClient.invalidateQueries({ queryKey: ["guideDocuments"] })
			}
		},
	})
}
