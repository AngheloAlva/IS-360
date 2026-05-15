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
import { systemUrl } from "@/lib/consts/systemUrl"

interface RejectClosureEmailTemplateProps {
	workOrderName: string
	workOrderNumber: string
	companyName: string
	supervisorName: string
	rejectionReason?: string
	rejectionDate?: Date
}

export const RejectClousureEmail: React.FC<Readonly<RejectClosureEmailTemplateProps>> = ({
	workOrderName,
	workOrderNumber,
	companyName,
	supervisorName,
	rejectionReason,
	rejectionDate,
}) => (
	<Html>
		<Tailwind>
			<Head>
				<title>Cierre de Libro de Obras Rechazado - OTC 360</title>
				<Preview>El cierre del libro de obras {workOrderName} ha sido rechazado</Preview>
			</Head>
			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-lg">
					{/* Header with Logo */}
					<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
						<Img
							src="https://otc360.cl/logo.png"
							alt="OTC 360 Logo"
							className="mx-auto h-auto w-full max-w-[200px] object-cover"
						/>
					</Section>

					{/* Main Content */}
					<Section className="px-[40px] py-[32px]">
						<Heading className="mb-[24px] text-center text-[28px] font-bold text-gray-800">
							Cierre de Libro de Obras Rechazado
						</Heading>

						<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
							Estimado/a supervisor/a, le informamos que su solicitud de cierre del libro de obras
							<strong> {workOrderName} </strong> ha sido <strong>rechazada</strong>.
						</Text>

						{/* Work Order Details */}
						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-blue-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								Detalles del Libro de Obras
							</Heading>

							<Row className="mb-[12px]">
								<Column className="w-[50%]">
									<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
										Nombre:
									</Text>
									<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
										{workOrderName}
									</Text>
								</Column>
								<Column className="w-[50%]">
									<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
										Número OT:
									</Text>
									<Text className="mb-[12px] text-[16px] leading-none font-bold text-blue-600">
										{workOrderNumber}
									</Text>
								</Column>
							</Row>

							<Row className="mb-[12px]">
								<Column className="w-[50%]">
									<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
										Empresa:
									</Text>
									<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
										{companyName}
									</Text>
								</Column>
								<Column className="w-[50%]">
									<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
										Rechazado por:
									</Text>
									<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
										{supervisorName}
									</Text>
								</Column>
							</Row>

							{rejectionDate && (
								<Row className="mb-[12px]">
									<Column>
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Fecha de Rechazo:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{rejectionDate.toLocaleDateString("es-CL", {
												day: "2-digit",
												month: "long",
												year: "numeric",
											})}
										</Text>
									</Column>
								</Row>
							)}

							{rejectionReason && (
								<Row>
									<Column>
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Razón del Rechazo:
										</Text>
										<Text className="rounded-[4px] border border-gray-200 bg-white p-[12px] text-[14px] leading-[20px] text-gray-600">
											{rejectionReason}
										</Text>
									</Column>
								</Row>
							)}
						</Section>

						{/* Next Steps */}
						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-red-500 bg-red-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								Próximos Pasos
							</Heading>

							<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
								<strong>1.</strong> Revisar los motivos del rechazo detalladamente
							</Text>
							<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
								<strong>2.</strong> Realizar las correcciones necesarias en el libro de obras
							</Text>
							<Text className="text-[14px] leading-[20px] text-gray-600">
								<strong>3.</strong> Volver a solicitar el cierre una vez corregidas las
								observaciones
							</Text>
						</Section>

						{/* Action Button */}
						<Section className="mb-[32px] text-center">
							<Button
								href={`${systemUrl}/admin/dashboard/ordenes-de-trabajo`}
								className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-blue-600"
							>
								Ver Libro de Obras
							</Button>
						</Section>

						<Hr className="my-[24px] border-gray-200" />

						<Text className="text-[14px] leading-[20px] text-gray-600">
							Si tiene alguna pregunta o necesita asistencia, no dude en contactar a nuestro equipo
							de soporte técnico.
						</Text>
					</Section>

					{/* Footer */}
					<Section className="rounded-b-[8px] bg-gray-50 px-[40px] py-[24px]">
						<Text className="m-0 mb-[8px] text-center text-[12px] text-gray-500">
							© {new Date().getFullYear()} OTC 360
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
