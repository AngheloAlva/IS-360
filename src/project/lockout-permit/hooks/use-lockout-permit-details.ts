"use client"

import { useQuery } from "@tanstack/react-query"

export interface LockoutPermitDetailsResponse {
	id: string
	status: string
	lockoutType: string
	lockoutTypeOther?: string | null
	startDate: string
	endDate: string
	activitiesToExecute: string[]
	observations?: string | null
	approved?: boolean | null
	approvalDate?: string | null
	approvalTime?: string | null
	finalObservations?: string | null
	approvalNotes?: string | null
	createdAt: string
	updatedAt: string
	supervisorName?: string | null
	operatorName?: string | null
	supervisor?: { id: string; name: string; rut: string } | null
	operator?: { id: string; name: string; rut: string } | null
	removeLockout?: { id: string; name: string; rut: string } | null
	areaResponsible: { id: string; name: string; rut: string }
	requestedBy: { id: string; name: string; rut: string }
	company: { id: string; name: string; rut: string }
	otNumberRef?: {
		id: string
		otNumber: string
		workRequest?: string | null
		workDescription?: string | null
	} | null
	equipments: { id: string; name: string; tag?: string | null }[]
	lockoutRegistrations: Array<{
		id: string
		order: number
		name: string
		rut: string
		lockNumber: string
		installDate?: string | null
		installTime?: string | null
		removeDate?: string | null
		removeTime?: string | null
		installSign?: string | null
		removeSign?: string | null
	}>
	zeroEnergyReviews: Array<{
		id: string
		location?: string | null
		action: string
		reviewedZero?: boolean | null
		equipment: { id: string; name: string; tag?: string | null; location?: string | null }
		performedBy: { id: string; name: string; rut: string }
		reviewer?: { id: string; name: string; rut: string } | null
		performedByName?: string | null
		reviewerName?: string | null
		reviewerSign?: string | null
	}>
	attachments: Array<{
		id: string
		name: string
		url: string
		createdAt: string
	}>
}

async function fetchLockoutPermitDetails(id: string): Promise<LockoutPermitDetailsResponse> {
	const response = await fetch(`/api/lockout-permit/${id}`)

	if (!response.ok) {
		throw new Error("Network response was not ok")
	}

	return response.json()
}

export function useLockoutPermitDetails(id: string) {
	return useQuery({
		queryKey: ["lockout-permit-details", id],
		queryFn: () => fetchLockoutPermitDetails(id),
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled: !!id,
	})
}
