interface SendNewWorkOrderEmailProps {
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
		}
		workDescription: string | null
		supervisor: {
			name: string
			email: string
		}
	}
}

export const sendNewWorkOrderEmail = async (
	props: SendNewWorkOrderEmailProps
) => {
	console.info("[demo] email noop: sendNewWorkOrderEmail", props)
	return { ok: true, data: null as unknown }
}
