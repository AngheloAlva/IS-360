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

interface RejectClosureEmailTemplateProps {
	workOrderName: string
	workOrderNumber: string
	companyName: string
	supervisorName: string
	rejectionReason?: string
}

const systemUrl = "https://otc360.ingsimple.cl"

export const RejectClousureEmail: React.FC<Readonly<RejectClosureEmailTemplateProps>> = ({
	workOrderName,
	workOrderNumber,
	companyName,
	supervisorName,
	rejectionReason,
}) => (
	<Html>
		<Tailwind>
			<Head>
				<title>Cierre de Libro de Obras Rechazado - OTC 360</title>
				<Preview>El cierre del libro de obras {workOrderName} ha sido rechazado</Preview>
			</Head>
			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[40px]">
					<Section className="mb-[32px] text-center">
						<Img
							width="150"
							height="142"
							alt="OTC 360 Logo"
							src={`${systemUrl}/logo.png`}
							className="mx-auto h-auto w-[150px] object-cover"
						/>
					</Section>

					<Section>
						<Heading className="mb-[24px] text-center text-[24px] font-bold text-gray-800">
							Cierre de Libro de Obras Rechazado
						</Heading>

						<Text className="mb-[16px] text-[16px] text-gray-600">Estimado(a) Supervisor(a),</Text>

						<Text className="mb-[24px] text-[16px] text-gray-600">
							Le informamos que su solicitud de cierre ha sido <strong>rechazada</strong>.
						</Text>

						<Section className="mb-[24px] rounded-[8px] border border-gray-200 bg-gray-50 p-[24px]">
							<Heading className="mb-[16px] text-[18px] font-bold text-gray-800">
								Detalles del Libro de Obras
							</Heading>

							<Row>
								<Column>
									<Text className="mb-[8px] text-[16px] text-gray-700">
										<strong>Nombre:</strong>
									</Text>
								</Column>
								<Column>
									<Text className="mb-[8px] ml-auto text-[16px] text-gray-800">
										{workOrderName}
									</Text>
								</Column>
							</Row>

							<Row>
								<Column>
									<Text className="mb-[8px] text-[16px] text-gray-700">
										<strong>Número OT:</strong>
									</Text>
								</Column>
								<Column>
									<Text className="mb-[8px] ml-auto text-[16px] text-gray-800">
										{workOrderNumber}
									</Text>
								</Column>
							</Row>

							<Row>
								<Column>
									<Text className="mb-[8px] text-[16px] text-gray-700">
										<strong>Empresa:</strong>
									</Text>
								</Column>
								<Column>
									<Text className="mb-[8px] ml-auto text-[16px] text-gray-800">{companyName}</Text>
								</Column>
							</Row>

							<Row>
								<Column>
									<Text className="mb-[8px] text-[16px] text-gray-700">
										<strong>Rechazado por:</strong>
									</Text>
								</Column>
								<Column>
									<Text className="mb-[8px] ml-auto text-[16px] text-gray-800">
										{supervisorName}
									</Text>
								</Column>
							</Row>

							{rejectionReason && (
								<Row>
									<Column>
										<Text className="mb-[8px] text-[16px] text-gray-700">
											<strong>Razón del rechazo:</strong>
										</Text>
									</Column>
									<Column>
										<Text className="mb-[8px] ml-auto text-[16px] text-gray-800">
											{rejectionReason}
										</Text>
									</Column>
								</Row>
							)}
						</Section>

						<Text className="mb-[24px] text-[16px] text-gray-600">
							Por favor, revise los motivos del rechazo y realice las correcciones necesarias antes
							de volver a solicitar el cierre.
						</Text>

						<Section className="mb-[32px] text-center">
							<Button
								href={`${systemUrl}/admin/dashboard/ordenes-de-trabajo`}
								className="box-input rounded-[4px] bg-blue-600 px-[24px] py-[12px] text-center font-bold text-white no-underline"
							>
								Ver Libro de Obras
							</Button>
						</Section>

						<Text className="mb-[16px] text-[16px] text-gray-600">
							Si tiene alguna pregunta o necesita asistencia, no dude en contactar a nuestro equipo
							de soporte técnico.
						</Text>

						<Text className="mb-[8px] text-[16px] text-gray-600">Saludos cordiales,</Text>

						<Text className="mb-[24px] text-[16px] font-bold text-gray-700">
							El equipo de OTC 360
						</Text>
					</Section>

					<Hr className="my-[24px] border-t border-gray-300" />

					<Section>
						<Text className="m-0 text-center text-[14px] text-gray-500">
							© {new Date().getFullYear()} OTC 360. Todos los derechos reservados.
						</Text>
					</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
)
