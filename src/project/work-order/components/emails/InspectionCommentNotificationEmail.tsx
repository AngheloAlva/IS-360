import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Hr,
	Img,
	Section,
	Text,
	Tailwind,
	Row,
	Column,
} from "@react-email/components"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { INSPECTION_COMMENT_TYPE } from "@prisma/client"

interface InspectionCommentNotificationEmailProps {
	comment: {
		id: string
		content: string
		type: INSPECTION_COMMENT_TYPE
		createdAt: Date
		author: {
			name: string
			email: string
		}

		attachmentCount?: number
	}
	inspection: {
		id: string
		activityName: string
		executionDate: Date
		activityStartTime: string
		activityEndTime: string
		inspectionStatus: string
		isResolved?: boolean
	}
	workOrder: {
		id: string
		otNumber: string
		workBookName?: string
		workBookLocation?: string
		responsible: {
			name: string
		}
		supervisor: {
			name: string
		}
		company?: {
			name: string
		}
	}
	recipient: {
		name: string
		email: string
		isInternal: boolean
		role: "responsible" | "supervisor" | "inspector" | "safety"
	}
	url: string
}

const commentTypeLabels = {
	SUPERVISOR_RESPONSE: "Respuesta del Supervisor",
	RESPONSIBLE_APPROVAL: "Aprobación del Responsable",
	RESPONSIBLE_REJECTION: "Rechazo del Responsable",
}

const commentTypeColors = {
	SUPERVISOR_RESPONSE: "#3B82F6",
	RESPONSIBLE_APPROVAL: "#10B981",
	RESPONSIBLE_REJECTION: "#EF4444",
}

const InspectionCommentNotificationEmail = ({
	url,
	workOrder,
	recipient,
	comment,
	inspection,
}: InspectionCommentNotificationEmailProps) => {
	const isApproval = comment.type === "RESPONSIBLE_APPROVAL"
	const isRejection = comment.type === "RESPONSIBLE_REJECTION"

	const getSubjectLine = () => {
		if (inspection.isResolved) {
			return `✅ Inspección Resuelta - ${workOrder.otNumber}`
		}
		if (isApproval) {
			return `✅ Inspección Aprobada - ${workOrder.otNumber}`
		}
		if (isRejection) {
			return `❌ Inspección Rechazada - ${workOrder.otNumber}`
		}
		return `💬 Nuevo Comentario en Inspección - ${workOrder.otNumber}`
	}

	const getHeaderMessage = () => {
		if (inspection.isResolved) {
			return "La inspección ha sido resuelta"
		}
		if (isApproval) {
			return "La inspección ha sido aprobada"
		}
		if (isRejection) {
			return "La inspección ha sido rechazada"
		}
		return "Se ha agregado un nuevo comentario"
	}

	return (
		<Html>
			<Head />
			<Tailwind>
				<Body className="mx-auto my-auto bg-white px-2 font-sans">
					<Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
						<Section className="mt-[32px]">
							<Img
								src="https://otcapp.blob.core.windows.net/files/logo.jpg"
								width="40"
								height="37"
								alt="IS 360"
								className="mx-auto my-0"
							/>
						</Section>

						<Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
							{getSubjectLine()}
						</Heading>

						<Text className="text-[14px] leading-[24px] text-black">
							Hola <strong>{recipient.name}</strong>,
						</Text>

						<Text className="text-[14px] leading-[24px] text-black">
							{getHeaderMessage()} en la orden de trabajo <strong>{workOrder.otNumber}</strong>
							{workOrder.workBookName && ` - ${workOrder.workBookName}`}.
						</Text>

						<Section className="my-4 rounded-lg bg-gray-50 p-4">
							<Row>
								<Column>
									<Text className="m-0 mb-1 text-[12px] text-gray-600">Comentario por:</Text>
									<Text className="m-0 text-[14px] font-semibold">{comment.author.name}</Text>
								</Column>
								<Column align="right">
									<Text
										className="m-0 rounded px-2 py-1 text-[12px] font-medium"
										style={{
											backgroundColor: `${commentTypeColors[comment.type]}20`,
											color: commentTypeColors[comment.type],
										}}
									>
										{commentTypeLabels[comment.type]}
									</Text>
								</Column>
							</Row>
							<Text className="m-0 mt-1 text-[12px] text-gray-600">
								{format(comment.createdAt, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
							</Text>
							<Hr className="my-3" />
							<Text className="m-0 text-[14px] leading-[20px]">{comment.content}</Text>
							{comment.attachmentCount && (
								<Text className="m-0 mt-2 text-[12px] text-gray-600">
									📎 {comment.attachmentCount} archivo(s) adjunto(s)
								</Text>
							)}
						</Section>

						<Section className="my-4 rounded-lg bg-blue-50 p-4">
							<Text className="m-0 mb-2 text-[12px] text-gray-600">Detalles de la Inspección:</Text>
							<Text className="m-0 mb-1 text-[14px] font-semibold">{inspection.activityName}</Text>
							<Row>
								<Column>
									<Text className="m-0 text-[12px] text-gray-600">Fecha:</Text>
									<Text className="m-0 text-[13px]">
										{format(inspection.executionDate, "dd/MM/yyyy", { locale: es })}
									</Text>
								</Column>
								<Column>
									<Text className="m-0 text-[12px] text-gray-600">Horario:</Text>
									<Text className="m-0 text-[13px]">
										{inspection.activityStartTime} - {inspection.activityEndTime}
									</Text>
								</Column>
							</Row>
							{inspection.isResolved && (
								<Text
									className="m-0 mt-2 rounded px-2 py-1 text-[12px] font-medium"
									style={{
										backgroundColor: "#10B98120",
										color: "#10B981",
									}}
								>
									✅ Estado: Resuelta
								</Text>
							)}
						</Section>

						<Section className="my-4 rounded-lg bg-amber-50 p-4">
							<Text className="m-0 mb-2 text-[12px] text-gray-600">
								Información de la Orden de Trabajo:
							</Text>
							<Row>
								<Column>
									<Text className="m-0 text-[12px] text-gray-600">Número:</Text>
									<Text className="m-0 text-[13px] font-semibold">{workOrder.otNumber}</Text>
								</Column>
								{workOrder.company && (
									<Column>
										<Text className="m-0 text-[12px] text-gray-600">Empresa:</Text>
										<Text className="m-0 text-[13px]">{workOrder.company.name}</Text>
									</Column>
								)}
							</Row>
							<Row>
								<Column>
									<Text className="m-0 text-[12px] text-gray-600">Responsable:</Text>
									<Text className="m-0 text-[13px]">{workOrder.responsible.name}</Text>
								</Column>
								<Column>
									<Text className="m-0 text-[12px] text-gray-600">Supervisor:</Text>
									<Text className="m-0 text-[13px]">{workOrder.supervisor.name}</Text>
								</Column>
							</Row>
							{workOrder.workBookLocation && (
								<Row>
									<Column>
										<Text className="m-0 text-[12px] text-gray-600">Ubicación:</Text>
										<Text className="m-0 text-[13px]">{workOrder.workBookLocation}</Text>
									</Column>
								</Row>
							)}
						</Section>

						<Section className="mt-[32px] mb-[32px] text-center">
							<Button
								className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
								href={url}
							>
								Ver Inspección Completa
							</Button>
						</Section>

						<Text className="text-[14px] leading-[24px] text-black">
							Saludos,
							<br />
							Equipo IS 360
						</Text>

						<Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

						<Text className="text-[12px] leading-[24px] text-[#666666]">
							Este correo fue enviado automáticamente desde el sistema IS 360. Por favor no
							responder a esta dirección de correo.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

export default InspectionCommentNotificationEmail
