interface SendAutomatedWorkOrderEmailsProps {
	workOrder: {
		otNumber: string
		type: string
		priority: string
		equipments: {
			name: string
		}[]
		programDate: Date
		estimatedDays: number
		estimatedHours: number
		responsible: {
			name: string
			email: string
		}
		workDescription: string | null
		supervisor: {
			name: string
			email: string
		}
		company: {
			name: string
		}
	}
	maintenanceTask: {
		name: string
		frequency: string
		emailsForCopy: string[]
	}
}

export const sendAutomatedWorkOrderEmails = async (
	props: SendAutomatedWorkOrderEmailsProps
) => {
	console.info("[demo] email noop: sendAutomatedWorkOrderEmails", props)
	return {
		ok: true,
		results: {
			responsibleEmail: { ok: true, error: null as unknown },
			supervisorEmail: { ok: true, error: null as unknown },
			controlRoomEmail: { ok: true, error: null as unknown },
		},
		message: `Notificaciones (demo) para OT ${props.workOrder.otNumber}`,
	}
}

export const sendAutomatedWorkOrderEmailsWithFallback = async (
	props: SendAutomatedWorkOrderEmailsProps
) => {
	return sendAutomatedWorkOrderEmails(props)
}
