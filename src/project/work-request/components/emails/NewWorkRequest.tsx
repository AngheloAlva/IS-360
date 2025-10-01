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

interface NewWorkRequestEmailTemplateProps {
	requestNumber: string
	description: string
	isUrgent: boolean
	requestDate: Date
	observations?: string | null
	userName: string
	equipmentName?: string[]
	baseUrl: string
}

export const NewWorkRequestEmail = ({
	requestNumber,
	description,
	isUrgent,
	requestDate,
	observations,
	userName,
	equipmentName,
	baseUrl,
}: NewWorkRequestEmailTemplateProps): React.ReactElement => (
	<Html>
		<Tailwind>
			<Head>
				<title>Nueva Solicitud de Trabajo {isUrgent ? "URGENTE" : ""} - IS 360</title>
				<Preview>Se ha creado una nueva solicitud de trabajo: {requestNumber}</Preview>
			</Head>

			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-lg">
					<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
						<Img
							alt="IS 360 Logo"
							src={`${systemUrl}/logo.jpg`}
							className="mx-auto h-auto w-full max-w-[200px] object-cover"
						/>
					</Section>

					<Section className="px-[40px] py-[32px]">
						<Heading className="mb-[24px] text-center text-[28px] font-bold text-gray-800">
							Nueva Solicitud de Trabajo
						</Heading>

						<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
							Se ha registrado una nueva solicitud de trabajo en el sistema IS 360. A continuación,
							encontrarás los detalles de la solicitud.
						</Text>

						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-gray-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								Detalles de la Solicitud
							</Heading>

							<Row>
								<Column>
									<Text className="mb-[8px] text-[14px] font-semibold text-gray-700">
										Número de Solicitud:
									</Text>
									<Text className="mb-[16px] rounded-[4px] border border-gray-200 bg-white px-[12px] py-[8px] font-mono text-[16px] text-blue-600">
										{requestNumber}
									</Text>
								</Column>
							</Row>

							<Row>
								<Column>
									<Text className="mb-[8px] text-[14px] font-semibold text-gray-700">
										Solicitante:
									</Text>
									<Text className="mb-[16px] text-[14px] text-gray-600">{userName}</Text>
								</Column>
							</Row>

							{equipmentName && equipmentName.length > 0 && (
								<Row>
									<Column>
										<Text className="mb-[8px] text-[14px] font-semibold text-gray-700">
											Equipo(s):
										</Text>
										{equipmentName.map((equipment, index) => (
											<Text key={index} className="mb-[8px] text-[14px] text-gray-600">
												{equipment}
											</Text>
										))}
									</Column>
								</Row>
							)}

							<Row>
								<Column>
									<Text className="mb-[8px] text-[14px] font-semibold text-gray-700">
										Fecha de Solicitud:
									</Text>
									<Text className="mb-[16px] text-[14px] text-gray-600">
										{requestDate.toLocaleDateString("es-ES", {
											day: "2-digit",
											month: "long",
											year: "numeric",
										})}
									</Text>
								</Column>
							</Row>
						</Section>

						<Section className="mb-[24px] rounded-[8px] bg-gray-50 p-[24px]">
							<Row>
								<Column>
									<Text className="mb-[8px] text-[14px] font-semibold text-gray-700">
										Descripción:
									</Text>
									<Text className="mb-[16px] text-[14px] text-gray-600">{description}</Text>
								</Column>
							</Row>

							{observations && (
								<Row>
									<Column>
										<Text className="mb-[8px] text-[14px] font-semibold text-gray-700">
											Observaciones:
										</Text>
										<Text className="mb-[16px] text-[14px] text-gray-600">{observations}</Text>
									</Column>
								</Row>
							)}
						</Section>

						{isUrgent && (
							<Section className="mb-[24px] rounded-[8px] border border-red-200 bg-red-50 p-[20px]">
								<Text className="mb-[8px] text-[14px] font-semibold text-red-800">
									⚠️ Solicitud Urgente
								</Text>
								<Text className="text-[14px] leading-[20px] text-red-700">
									Esta solicitud ha sido marcada como urgente y requiere atención inmediata.
								</Text>
							</Section>
						)}

						<Section className="mb-[32px] text-center">
							<Button
								href={baseUrl}
								className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-blue-600"
							>
								Ver Solicitud en IS 360
							</Button>
						</Section>

						<Hr className="my-[24px] border-gray-200" />

						<Text className="text-[14px] leading-[20px] text-gray-600">
							Para ver más detalles o tomar acción sobre esta solicitud, por favor accede al sistema
							IS 360 utilizando el botón anterior.
						</Text>
					</Section>

					<Section className="rounded-b-[8px] bg-gray-50 px-[40px] py-[24px]">
						<Text className="m-0 mb-[8px] text-center text-[12px] text-gray-500">
							© {new Date().getFullYear()} IS 360
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
