"use client"

import { CheckCircle2Icon, CircleIcon, Loader2Icon, ZapIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { useZeroEnergyReviews } from "../hooks/use-zero-energy-reviews"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"

interface ZeroEnergyReviewsListProps {
	lockoutPermitId: string
}

export function ZeroEnergyReviewsList({ lockoutPermitId }: ZeroEnergyReviewsListProps) {
	const { reviews, isLoading } = useZeroEnergyReviews({ lockoutPermitId })

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2Icon className="h-6 w-6 animate-spin text-fuchsia-600" />
			</div>
		)
	}

	if (!reviews || reviews.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-8 text-center">
				<ZapIcon className="text-muted-foreground/50 mx-auto h-12 w-12" />
				<p className="text-muted-foreground mt-2 text-sm">
					No hay revisiones de energía cero registradas
				</p>
				<p className="text-muted-foreground text-xs">
					Haz clic en &ldquo;Agregar Revisión&rdquo; para crear una nueva
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-3">
			{reviews.map((review, index) => (
				<Card key={review.id} className="border-l-4 border-l-fuchsia-500">
					<CardHeader className="pb-3">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-2">
								<ZapIcon className="h-4 w-4 text-fuchsia-600" />
								<CardTitle className="text-base">Revisión {index + 1}</CardTitle>
								{review.reviewedZero ? (
									<Badge variant="outline" className="gap-1 border-green-600 text-green-600">
										<CheckCircle2Icon className="h-3 w-3" />
										Energía Cero Verificada
									</Badge>
								) : (
									<Badge variant="outline" className="gap-1 border-amber-600 text-amber-600">
										<CircleIcon className="h-3 w-3" />
										Pendiente Verificación
									</Badge>
								)}
							</div>
							<span className="text-muted-foreground text-xs">
								{format(new Date(review.createdAt), "dd MMM yyyy HH:mm", { locale: es })}
							</span>
						</div>
					</CardHeader>
					<CardContent className="space-y-2">
						<div className="grid gap-2 text-sm">
							<div>
								<span className="text-muted-foreground font-semibold">Equipo:</span>{" "}
								<span className="font-semibold">{review.equipment.name}</span>
								<span className="text-muted-foreground ml-2 text-xs">({review.equipment.tag})</span>
							</div>

							<div>
								<span className="text-muted-foreground font-semibold">Acción:</span>{" "}
								<span>{review.action}</span>
							</div>

							{review.location && (
								<div>
									<span className="text-muted-foreground font-semibold">Ubicación:</span>{" "}
									<span>{review.location}</span>
								</div>
							)}

							<div>
								<span className="text-muted-foreground font-semibold">Realizado por:</span>{" "}
								<span>{review.performedBy.name}</span>
								<span className="text-muted-foreground ml-2 text-xs">
									({review.performedBy.rut})
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
