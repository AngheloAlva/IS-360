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

interface RequestClosureEmailTemplateProps {
	companyName: string
	workOrderId: string
	workOrderName: string
	supervisorName: string
	workOrderNumber: string
	requestDate?: Date
}

export const RequestClousureEmail: React.FC<Readonly<RequestClosureEmailTemplateProps>> = ({
	companyName,
	workOrderId,
	workOrderName,
	supervisorName,
	workOrderNumber,
	requestDate,
}) => (
	<Html>
		<Tailwind>
			<Head>
				<title>Solicitud de Cierre de Libro de Obras - OTC 360</title>
				<Preview>Se ha solicitado el cierre del libro de obras {workOrderName}</Preview>
			</Head>
			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-lg">
					{/* Header with Logo */}
					<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
						<Img
							src="https://otc360.ingsimple.cl/logo.png"
							alt="OTC 360 Logo"
							className="mx-auto h-auto w-full max-w-[200px] object-cover"
						/>
					</Section>

					{/* Main Content */}
					<Section className="px-[40px] py-[32px]">
						<Heading className="mb-[24px] text-center text-[28px] font-bold text-gray-800">
							Solicitud de Cierre de Libro de Obras
						</Heading>

						<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
							Estimado/a Administrador, le informamos que se ha recibido una solicitud de cierre
							para el siguiente libro de obras:
						</Text>

						{/* Work Order Details */}
						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-blue-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								Detalles del Libro de Obras
							</Heading>

							{/* Work Order Info */}
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
									<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
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
										Solicitado por:
									</Text>
									<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
										{supervisorName}
									</Text>
								</Column>
							</Row>

							{/* Request Date */}
							{requestDate && (
								<Text className="text-[14px] leading-[20px] text-gray-600">
									Fecha de solicitud:{" "}
									<span className="font-semibold">
										{requestDate.toLocaleDateString("es-CL", {
											day: "2-digit",
											month: "long",
											year: "numeric",
										})}
									</span>
								</Text>
							)}
						</Section>

						{/* Next Steps */}
						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-blue-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								Próximos Pasos
							</Heading>

							<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
								<strong>1.</strong> Revisar la solicitud de cierre del libro de obras
							</Text>
							<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
								<strong>2.</strong> Verificar que todos los hitos estén completados y aprobados
							</Text>
							<Text className="text-[14px] leading-[20px] text-gray-600">
								<strong>3.</strong> Aprobar o rechazar el cierre según corresponda
							</Text>
						</Section>

						{/* Action Button */}
						<Section className="mb-[32px] text-center">
							<Button
								href={`${systemUrl}/admin/dashboard/ordenes-de-trabajo/${workOrderId}`}
								className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-blue-600"
							>
								Revisar Solicitud
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
