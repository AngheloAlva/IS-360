import { SAFETY_TALK_STATUS } from "@prisma/client"
import { useEffect, useState } from "react"

interface Employee {
	id: string
	name: string
	email: string
	rut: string
	safetyTalks: {
		id: string
		score: number
		expiresAt: Date
		completedAt: Date
		inPersonSessionDate: Date
		status: SAFETY_TALK_STATUS
	}[]
}

interface UseCompanyEmployeesProps {
	companyId?: string
}

export function useCompanyEmployees({ companyId }: UseCompanyEmployeesProps) {
	const [employees, setEmployees] = useState<Employee[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function fetchEmployees() {
			if (!companyId) {
				setEmployees([])
				return
			}

			setIsLoading(true)
			setError(null)

			try {
				const response = await fetch(`/api/companies/${companyId}/employees`)

				if (!response.ok) {
					throw new Error(`Error al obtener los empleados: ${response.status}`)
				}

				const data = await response.json()
				setEmployees(data.employees || [])
			} catch (err) {
				console.error("Error fetching employees:", err)
				setError(err instanceof Error ? err.message : "Error al obtener los empleados")
				setEmployees([])
			} finally {
				setIsLoading(false)
			}
		}

		fetchEmployees()
	}, [companyId])

	return {
		employees,
		isLoading,
		error,
	}
}
