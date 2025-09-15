export interface LockoutPermitData {
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
	supervisor?: { name: string; rut: string } | null
	operator?: { name: string; rut: string } | null
	removeLockout?: { name: string; rut: string } | null
	areaResponsible: { name: string; rut: string }
	requestedBy: { name: string; rut: string }
	company: { name: string; rut: string }
	otNumberRef?: {
		otNumber: string
		workRequest?: string | null
		workDescription?: string | null
	} | null
	equipments: { name: string; tag?: string | null; location?: string | null }[]
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
	}>
	zeroEnergyReviews: Array<{
		id: string
		location?: string | null
		action: string
		reviewedZero?: boolean | null
		equipment: { name: string; tag?: string | null; location?: string | null }
		performedBy: { name: string; rut: string }
		reviewer?: { name: string; rut: string } | null
	}>
}
