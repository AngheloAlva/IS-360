"use client"

import { Button } from "@/shared/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"

import type { AdminWorkPermit } from "@/features/work-permit/hooks/use-admin-work-permits"

interface WorkPermitActionsProps {
	workPermit: AdminWorkPermit
}

export function WorkPermitActions({ workPermit }: WorkPermitActionsProps) {
	const [isLoading, setIsLoading] = useState(false)

	const handleUpdateStatus = async () => {
		try {
			setIsLoading(true)

			const response = await fetch(`/api/work-permit/${workPermit.id}/status`, {
				method: "PATCH",
				body: JSON.stringify({ workCompleted: !workPermit.workCompleted }),
				headers: {
					"Content-Type": "application/json",
				},
			})

			if (!response.ok) {
				throw new Error("Failed to update status")
			}

			toast.success("Estado actualizado correctamente")
		} catch {
			toast.error("Error al actualizar el estado")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex items-center gap-2">
			<Button variant="outline" size="sm" onClick={handleUpdateStatus} disabled={isLoading}>
				{workPermit.workCompleted ? "Marcar como pendiente" : "Marcar como completado"}
			</Button>
		</div>
	)
}
