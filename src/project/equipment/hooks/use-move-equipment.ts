import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { EquipmentsResponse, WorkEquipment } from "@/project/equipment/hooks/use-equipments"

export type MoveEquipmentVariables = {
	id: string
	parentId: string | null
}

export function useMoveEquipment() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (variables: MoveEquipmentVariables) => {
			const res = await fetch(`/api/equipments/${variables.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ parentId: variables.parentId }),
			})

			if (!res.ok) {
				const error = await res.json().catch(() => ({}))
				const err = new Error(error.error ?? "Error al mover el equipo") as Error & { status: number }
				err.status = res.status
				throw err
			}

			return res.json()
		},
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey: ["equipments"] })

			const snapshot = queryClient.getQueriesData<EquipmentsResponse>({
				queryKey: ["equipments"],
			})

			let movedItem: WorkEquipment | undefined
			let oldParentId: string | null = null

			for (const [, data] of snapshot) {
				if (!data?.equipments) continue
				const found = data.equipments.find((e) => e.id === variables.id)
				if (found) {
					movedItem = found
					oldParentId = found.parentId
					break
				}
			}

			if (!movedItem) return { previousQueries: snapshot }

			for (const [queryKey, data] of snapshot) {
				if (!data?.equipments) continue
				const params = (queryKey as [string, { parentId: string | null }])[1]
				if (!params || typeof params !== "object") continue

				let updated = false
				let newEquipments = data.equipments
				let newTotal = data.total

				if (params.parentId === oldParentId && data.equipments.some((e) => e.id === variables.id)) {
					newEquipments = newEquipments.filter((e) => e.id !== variables.id)
					newTotal = newTotal - 1
					updated = true
				}

				if (params.parentId === variables.parentId) {
					newEquipments = [...newEquipments, { ...movedItem, parentId: variables.parentId }]
					newTotal = newTotal + 1
					updated = true
				}

				if (updated) {
					queryClient.setQueryData(queryKey, {
						...data,
						equipments: newEquipments,
						total: newTotal,
					})
				}
			}

			return { previousQueries: snapshot }
		},
		onError: (_err, _vars, context) => {
			if (context?.previousQueries) {
				for (const [queryKey, data] of context.previousQueries) {
					queryClient.setQueryData(queryKey, data)
				}
			}

			const err = _err as Error & { status?: number }
			if (err.status === 409) {
				toast.error("Operación no permitida: generaría un ciclo en la jerarquía")
			} else {
				toast.error("Error al mover el equipo")
			}
		},
		onSuccess: () => {
			toast.success("Equipo movido exitosamente")
		},
		onSettled: () => {
   void queryClient.invalidateQueries({ queryKey: ["equipments"] })
		},
	})
}
