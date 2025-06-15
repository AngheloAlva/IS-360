import { useMutation, useQueryClient } from "@tanstack/react-query"

import { linkFolderEntity } from "../actions/link-folder-entity"

export function useLinkEntity() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: linkFolderEntity,
		onSuccess: (_, { startupFolderId, category }) => {
			// Invalidate both the documents list and the startup folder
			queryClient.invalidateQueries({
				queryKey: ["startupFolderDocuments", { startupFolderId, category }],
			})
			queryClient.invalidateQueries({
				queryKey: ["startupFolder", { folderId: startupFolderId }],
			})
		},
	})
}
