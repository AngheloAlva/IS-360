import { systemUrl } from "@/lib/consts/systemUrl"
import {
	Hr,
	Img,
	Row,
	Html,
	Text,
	Body,
	Head,
	Button,
	Column,
	Section,
	Heading,
	Preview,
	Tailwind,
	Container,
} from "@react-email/components"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface UrgentWorkPermitEmailProps {
	applicantName: string
	exactPlace: string
	workWillBe: string
	activityDetails: string[]
	startDate: Date
	endDate: Date
	participants: string[]
	otNumber?: string
	additionalObservations?: string
}

export const UrgentWorkPermitEmail = ({
	applicantName,
	exactPlace,
	workWillBe,
	activityDetails,
	startDate,
	endDate,
	participants,
	otNumber,
	additionalObservations,
}: UrgentWorkPermitEmailProps): React.ReactElement => (
	<Html>
		<Tailwind>
			<Head>
				<title>🚨 Permiso de Trabajo Urgente - OTC 360</title>
				<Preview>Nuevo permiso de trabajo urgente creado por {applicantName}</Preview>
			</Head>

			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-lg">
					<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
						<Img
							alt="OTC 360 Logo"
							src={`${systemUrl}/logo.png`}
							className="mx-auto h-auto w-full max-w-[200px] object-cover"
						/>
					</Section>

					{/* Alert Header */}
					<Section className="border-l-4 border-red-500 bg-red-50 px-[40px] py-[24px]">
						<Heading className="mb-[16px] text-center text-[28px] font-bold text-red-600">
							🚨 Permiso de Trabajo Urgente
						</Heading>
						<Text className="text-center text-[16px] font-semibold text-red-700">
							Se ha creado un nuevo permiso de trabajo marcado como URGENTE
						</Text>
					</Section>

					{/* Main Content */}
					<Section className="px-[40px] py-[32px]">
						{/* Basic Information */}
						<Section className="mb-[24px] rounded-[8px] border border-gray-200 bg-gray-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								Información General
							</Heading>

							<Row className="mb-[12px]">
								<Column className="w-[30%]">
									<Text className="m-0 text-[14px] font-semibold text-gray-700">Solicitante:</Text>
								</Column>
								<Column>
									<Text className="m-0 text-[14px] text-gray-600">{applicantName}</Text>
								</Column>
							</Row>

							{otNumber && (
								<Row className="mb-[12px]">
									<Column className="w-[30%]">
										<Text className="m-0 text-[14px] font-semibold text-gray-700">Número OT:</Text>
									</Column>
									<Column>
										<Text className="m-0 text-[14px] text-gray-600">{otNumber}</Text>
									</Column>
								</Row>
							)}

							<Row className="mb-[12px]">
								<Column className="w-[30%]">
									<Text className="m-0 text-[14px] font-semibold text-gray-700">Lugar exacto:</Text>
								</Column>
								<Column>
									<Text className="m-0 text-[14px] text-gray-600">{exactPlace}</Text>
								</Column>
							</Row>

							<Row className="mb-[12px]">
								<Column className="w-[30%]">
									<Text className="m-0 text-[14px] font-semibold text-gray-700">
										Trabajo a realizar:
									</Text>
								</Column>
								<Column>
									<Text className="m-0 text-[14px] text-gray-600">{workWillBe}</Text>
								</Column>
							</Row>
						</Section>

						{/* Date Information */}
						<Section className="mb-[24px] rounded-[8px] border border-orange-200 bg-orange-50 p-[24px]">
							<Heading className="mb-[16px] text-[18px] font-bold text-orange-800">
								📅 Fechas del Permiso
							</Heading>

							<Row className="mb-[12px]">
								<Column className="w-[30%]">
									<Text className="m-0 text-[14px] font-semibold text-orange-700">
										Fecha de inicio:
									</Text>
								</Column>
								<Column>
									<Text className="m-0 text-[14px] text-orange-600">
										{format(startDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
									</Text>
								</Column>
							</Row>

							<Row>
								<Column className="w-[30%]">
									<Text className="m-0 text-[14px] font-semibold text-orange-700">
										Fecha de vencimiento:
									</Text>
								</Column>
								<Column>
									<Text className="m-0 text-[14px] text-orange-600">
										{format(endDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
									</Text>
								</Column>
							</Row>
						</Section>

						{/* Activity Details */}
						<Section className="mb-[24px] rounded-[8px] border border-blue-200 bg-blue-50 p-[24px]">
							<Heading className="mb-[16px] text-[18px] font-bold text-blue-800">
								🔧 Actividades a Realizar
							</Heading>
							{activityDetails.map((activity, index) => (
								<Text key={index} className="mb-[8px] text-[14px] text-blue-700">
									• {activity}
								</Text>
							))}
						</Section>

						{/* Participants */}
						<Section className="mb-[24px] rounded-[8px] border border-green-200 bg-green-50 p-[24px]">
							<Heading className="mb-[16px] text-[18px] font-bold text-green-800">
								👥 Participantes
							</Heading>
							{participants.map((participant, index) => (
								<Text key={index} className="mb-[8px] text-[14px] text-green-700">
									• {participant}
								</Text>
							))}
						</Section>

						{/* Additional Observations */}
						{additionalObservations && (
							<Section className="mb-[24px] rounded-[8px] border border-purple-200 bg-purple-50 p-[24px]">
								<Heading className="mb-[16px] text-[18px] font-bold text-purple-800">
									📝 Observaciones Adicionales
								</Heading>
								<Text className="text-[14px] text-purple-700">{additionalObservations}</Text>
							</Section>
						)}

						{/* Action Required */}
						<Section className="mb-[24px] rounded-[8px] border border-red-200 bg-red-50 p-[24px]">
							<Text className="mb-[8px] text-[16px] font-semibold text-red-800">
								⚠️ Acción Requerida
							</Text>
							<Text className="mb-[16px] text-[14px] leading-[20px] text-red-700">
								Este permiso ha sido marcado como URGENTE y requiere revisión inmediata. Por favor,
								revise los detalles y tome las acciones necesarias lo antes posible.
							</Text>

							<Section className="text-center">
								<Button
									href={`${systemUrl}/admin/dashboard/permisos-de-trabajo`}
									className="box-border rounded-[8px] bg-red-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-red-600"
								>
									Revisar Permiso Urgente
								</Button>
							</Section>
						</Section>

						<Hr className="my-[24px] border-gray-200" />

						<Text className="text-[14px] leading-[20px] text-gray-600">
							Este es un correo automático generado por el sistema OTC 360 para notificar la
							creación de un permiso de trabajo urgente. Por favor, tome las medidas necesarias de
							forma inmediata.
						</Text>
					</Section>

					{/* Footer */}
					<Section className="rounded-b-[8px] bg-gray-50 px-[40px] py-[24px]">
						<Text className="m-0 mb-[8px] text-center text-[12px] text-gray-500">
							© {new Date().getFullYear()} OTC 360 - Sistema de Gestión
						</Text>
						<Text className="m-0 text-center text-[12px] text-gray-500">
							Este es un correo automático, por favor no responder directamente.
						</Text>
					</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
)
