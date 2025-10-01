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

interface OtcInspectionNotificationEmailProps {
	inspection: {
		id: string
		activityName: string
		executionDate: Date
		activityStartTime: string
		activityEndTime: string
		inspectorName: string
		nonConformities?: string
		safetyObservations?: string
		supervisionComments?: string
		recommendations?: string
		attachmentCount?: number
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
			email: string
		}
		company?: {
			name: string
		}
	}
	recipient: {
		name: string
		isInternal: boolean
		role: "responsible" | "supervisor" | "safety"
	}
	url: string
}

const OtcInspectionNotificationEmail = ({
	url,
	workOrder,
	recipient,
	inspection,
}: OtcInspectionNotificationEmailProps) => {
	const getRoleContext = () => {
		switch (recipient.role) {
			case "responsible":
				return "como responsable de la Orden de Trabajo"
			case "supervisor":
				return "como supervisor de la Orden de Trabajo"
			case "safety":
				return "como persona del área de seguridad"
			default:
				return ""
		}
	}

	const getSeverityColor = () => {
		if (inspection.nonConformities && inspection.nonConformities.trim().length > 0) {
			return "text-red-600 bg-red-50 border-red-200"
		}
		if (inspection.safetyObservations && inspection.safetyObservations.trim().length > 0) {
			return "text-yellow-600 bg-yellow-50 border-yellow-200"
		}
		return "text-green-600 bg-green-50 border-green-200"
	}

	const getSeverityLabel = () => {
		if (inspection.nonConformities && inspection.nonConformities.trim().length > 0) {
			return "⚠️ Requiere Atención"
		}
		if (inspection.safetyObservations && inspection.safetyObservations.trim().length > 0) {
			return "⚡ Observaciones de Seguridad"
		}
		return "✅ Sin Observaciones Críticas"
	}

	return (
		<Html>
			<Tailwind>
				<Head />
				<Body className="bg-gray-100 py-[40px] font-sans">
					<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-lg">
						{/* Header with Logo */}
						<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
							<Img
								src="https://is360.ingsimple.cl/logo.jpg"
								alt="IS 360 Logo"
								className="mx-auto h-auto w-full max-w-[200px] object-cover"
							/>
						</Section>

						{/* Main Content */}
						<Section className="px-[40px] py-[32px]">
							<Heading className="mb-[24px] text-center text-[28px] font-bold text-gray-800">
								Nueva Inspección IS 360 Realizada
							</Heading>

							<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
								Estimado/a {recipient.name}, se ha realizado una nueva inspección IS 360 en el
								sistema. Le notificamos {getRoleContext()}.
							</Text>

							{/* Severity Alert */}
							<Section className={`mb-[24px] rounded-[8px] border p-[16px] ${getSeverityColor()}`}>
								<Text className="mb-[8px] text-[16px] font-bold">{getSeverityLabel()}</Text>
								<Text className="text-[14px] leading-[20px]">
									{inspection.nonConformities && inspection.nonConformities.trim().length > 0
										? "Esta inspección reportó no conformidades que requieren atención inmediata."
										: inspection.safetyObservations &&
											  inspection.safetyObservations.trim().length > 0
											? "Esta inspección incluye observaciones de seguridad importantes."
											: "Esta inspección se completó sin observaciones críticas."}
								</Text>
							</Section>

							{/* Work Order Details */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-blue-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									Información de la Orden de Trabajo
								</Heading>

								<Row className="mb-[12px]">
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Número OT:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none font-bold text-blue-600">
											{workOrder.otNumber}
										</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Administrador Contrato:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{workOrder.responsible.name}
										</Text>
									</Column>
								</Row>

								{workOrder.workBookName && (
									<Row className="mb-[12px]">
										<Column>
											<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
												Nombre del Trabajo:
											</Text>
											<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
												{workOrder.workBookName}
											</Text>
										</Column>
									</Row>
								)}

								{workOrder.workBookLocation && (
									<Row className="mb-[12px]">
										<Column>
											<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
												Ubicación:
											</Text>
											<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
												{workOrder.workBookLocation}
											</Text>
										</Column>
									</Row>
								)}

								{workOrder.company && (
									<Row>
										<Column>
											<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
												Empresa:
											</Text>
											<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
												{workOrder.company.name}
											</Text>
										</Column>
									</Row>
								)}
							</Section>

							{/* Inspection Details */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-orange-500 bg-orange-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									Detalles de la Inspección
								</Heading>

								<Row className="mb-[12px]">
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Nombre de la Inspección:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none font-bold text-orange-600">
											{inspection.activityName}
										</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Inspector:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{inspection.inspectorName}
										</Text>
									</Column>
								</Row>

								<Row className="mb-[12px]">
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Fecha de Ejecución:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{format(inspection.executionDate, "dd/MM/yyyy", { locale: es })}
										</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Horario:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{inspection.activityStartTime} - {inspection.activityEndTime}
										</Text>
									</Column>
								</Row>

								{inspection.attachmentCount && (
									<Row>
										<Column>
											<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
												Archivos Adjuntos:
											</Text>
											<Text className="mb-[12px] text-[14px] leading-none text-blue-600">
												📎 {inspection.attachmentCount || 1} archivo(s) adjunto(s)
											</Text>
										</Column>
									</Row>
								)}
							</Section>

							{/* Findings Section */}
							{(inspection.nonConformities ||
								inspection.safetyObservations ||
								inspection.supervisionComments ||
								inspection.recommendations) && (
								<Section className="mb-[24px] rounded-[8px] border border-gray-200 bg-gray-50 p-[24px]">
									<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
										Hallazgos y Observaciones
									</Heading>

									{inspection.nonConformities && (
										<div className="mb-[16px]">
											<Text className="mb-[4px] text-[14px] font-semibold text-red-700">
												🚨 No Conformidades:
											</Text>
											<Text className="rounded-[4px] border border-red-200 bg-red-50 p-[12px] text-[14px] leading-[20px] text-red-800">
												{inspection.nonConformities}
											</Text>
										</div>
									)}

									{inspection.safetyObservations && (
										<div className="mb-[16px]">
											<Text className="mb-[4px] text-[14px] font-semibold text-yellow-700">
												⚠️ Observaciones de Seguridad:
											</Text>
											<Text className="rounded-[4px] border border-yellow-200 bg-yellow-50 p-[12px] text-[14px] leading-[20px] text-yellow-800">
												{inspection.safetyObservations}
											</Text>
										</div>
									)}

									{inspection.supervisionComments && (
										<div className="mb-[16px]">
											<Text className="mb-[4px] text-[14px] font-semibold text-blue-700">
												💬 Comentarios de Supervisión:
											</Text>
											<Text className="rounded-[4px] border border-blue-200 bg-blue-50 p-[12px] text-[14px] leading-[20px] text-blue-800">
												{inspection.supervisionComments}
											</Text>
										</div>
									)}

									{inspection.recommendations && (
										<div>
											<Text className="mb-[4px] text-[14px] font-semibold text-green-700">
												💡 Recomendaciones:
											</Text>
											<Text className="rounded-[4px] border border-green-200 bg-green-50 p-[12px] text-[14px] leading-[20px] text-green-800">
												{inspection.recommendations}
											</Text>
										</div>
									)}
								</Section>
							)}

							{/* Action Required Section */}
							{inspection.nonConformities && (
								<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-red-500 bg-red-50 p-[24px]">
									<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
										Acción Requerida
									</Heading>

									<Text className="mb-[12px] text-[14px] leading-[20px] text-red-700">
										<strong>⚠️ Atención Inmediata Requerida</strong>
									</Text>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-red-600">
										Esta inspección ha identificado no conformidades que requieren atención
										inmediata. Por favor, revise los detalles y tome las acciones correctivas
										necesarias.
									</Text>
									<Text className="text-[14px] leading-[20px] text-red-600">
										Se recomienda coordinar con el equipo de seguridad y supervisión para
										implementar las medidas correctivas apropiadas.
									</Text>
								</Section>
							)}

							{/* Action Button */}
							<Section className="mb-[32px] text-center">
								<Button
									href={url}
									className="box-border rounded-[8px] bg-orange-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-orange-600"
								>
									Ver Inspección en IS 360
								</Button>
							</Section>

							<Hr className="my-[24px] border-gray-200" />

							<Text className="text-[14px] leading-[20px] text-gray-600">
								Para cualquier consulta sobre esta inspección o para coordinar acciones de
								seguimiento, contacte al supervisor de la orden de trabajo o al área de seguridad
								según corresponda.
							</Text>
						</Section>

						{/* Footer */}
						<Section className="rounded-b-[8px] bg-gray-50 px-[40px] py-[24px]">
							<Text className="m-0 mb-[8px] text-center text-[12px] text-gray-500">
								© {new Date().getFullYear()} IS 360 - Sistema de Gestión de Inspecciones
							</Text>
							<Text className="m-0 text-center text-[12px] text-gray-500">
								Notificación Automática del Sistema - No Responder
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

export default OtcInspectionNotificationEmail
