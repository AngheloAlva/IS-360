import { useQuery } from "@tanstack/react-query"

export interface ZeroEnergyReview {
	id: string
	location: string | null
	action: string
	reviewedZero: boolean | null
	equipmentId: string
	performedById: string
	reviewerId: string | null
	lockoutPermitId: string
	createdAt: string
	updatedAt: string
	equipment: {
		id: string
		name: string
		tag: string
	}
	performedBy: {
		id: string
		name: string
		rut: string
	}
	reviewer: {
		id: string
		name: string
		rut: string
	} | null
}

interface UseZeroEnergyReviewsProps {
	lockoutPermitId?: string
}

export const useZeroEnergyReviews = ({ lockoutPermitId }: UseZeroEnergyReviewsProps) => {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["zeroEnergyReviews", lockoutPermitId],
		queryFn: async () => {
			if (!lockoutPermitId) return []

			const response = await fetch(`/api/zero-energy-reviews?lockoutPermitId=${lockoutPermitId}`)

			if (!response.ok) {
				throw new Error("Error al obtener las revisiones de energía cero")
			}

			const data = await response.json()
			return data.reviews as ZeroEnergyReview[]
		},
		enabled: !!lockoutPermitId,
	})

	return {
		reviews: data ?? [],
		isLoading,
		error,
		refetch,
	}
}
