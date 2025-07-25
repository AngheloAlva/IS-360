"use client"

import { Calendar, MessageSquare, User } from "lucide-react"
import { useState } from "react"

import { Card, CardContent } from "@/shared/components/ui/card"
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/shared/components/ui/select"

import type { Tool, ToolActivity, ActivityType } from "../../types"

interface ToolActivityFormProps {
	tool: Tool
	onSubmit: (activity: Omit<ToolActivity, "id" | "timestamp" | "createdBy">) => void
	onCancel: () => void
}

const activityTypeLabels: Record<ActivityType, string> = {
	ENTRY: "Entrada a Planta",
	EXIT: "Salida de Planta",
	STAY: "Permanece en Planta",
}

export function ToolActivityForm({ tool, onSubmit, onCancel }: ToolActivityFormProps) {
	const [activityType, setActivityType] = useState<ActivityType | "">("")
	const [comments, setComments] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!activityType) {
			return
		}

		setIsSubmitting(true)

		try {
			// Simular delay de envío
			await new Promise((resolve) => setTimeout(resolve, 500))

			onSubmit({
				toolId: tool.id,
				activityType: activityType as ActivityType,
				comments: comments || undefined,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Card>
				<CardContent>
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-orange-500/10 p-2">
							<User className="h-5 w-5 text-orange-500" />
						</div>
						<div>
							<h3 className="font-medium">{tool.name}</h3>
							<p className="text-muted-foreground text-sm">Código: {tool.code}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="space-y-2">
				<Label htmlFor="activityType" className="flex items-center gap-2">
					<Calendar className="h-4 w-4" />
					Tipo de Actividad *
				</Label>
				<Select
					value={activityType}
					onValueChange={(value) => setActivityType(value as ActivityType)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Selecciona el tipo de actividad" />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(activityTypeLabels).map(([value, label]) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="comments" className="flex items-center gap-2">
					<MessageSquare className="h-4 w-4" />
					Comentarios (Opcional)
				</Label>
				<Textarea
					id="comments"
					className="h-28"
					value={comments}
					onChange={(e) => setComments(e.target.value)}
					placeholder="Describe detalles adicionales sobre esta actividad..."
					rows={3}
				/>
			</div>

			<div className="flex justify-end gap-3 pt-4">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					Cancelar
				</Button>
				<Button type="submit" disabled={!activityType || isSubmitting}>
					{isSubmitting ? "Registrando..." : "Registrar Actividad"}
				</Button>
			</div>
		</form>
	)
}
