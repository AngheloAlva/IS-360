import {
	Img,
	Row,
	Html,
	Text,
	Body,
	Head,
	Column,
	Section,
	Heading,
	Preview,
	Tailwind,
	Container,
} from "@react-email/components"
import { systemUrl } from "@/lib/consts/systemUrl"

interface CloseWorkOrderEmailTemplateProps {
	workOrderName: string
	workOrderNumber: string
	companyName: string
	supervisorName: string
	closureReason: string
	closureDate: Date
	otNumber: string
}

export const CloseWorkOrderEmail: React.FC<Readonly<CloseWorkOrderEmailTemplateProps>> = ({
	workOrderName,
	workOrderNumber,
	companyName,
	supervisorName,
	closureReason,
	closureDate,
	otNumber,
}) => (
	<Html>
		<Tailwind>
			<Head>
				<title>Libro de Obras Cerrado - OTC 360</title>
				<Preview>El libro de obras {workOrderName} ha sido cerrado</Preview>
			</Head>
			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-lg">
					{/* Header with Logo */}
					<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
						<Img
							alt="OTC 360 Logo"
							src={systemUrl + "/logo.png"}
							className="mx-auto h-auto w-full max-w-[200px] object-cover"
						/>
					</Section>

					{/* Main Content */}
					<Section className="px-[40px] py-[32px]">
						<Heading className="mb-[24px] text-center text-[28px] font-bold text-gray-800">
							Libro de Obras Cerrado
						</Heading>

						<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
							Estimado/a supervisor/a, le informamos que el libro de obras
							<strong>
								{" "}
								{workOrderName} ({otNumber}){" "}
							</strong>{" "}
							ha sido <strong>cerrado</strong>.
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

							{closureDate && (
								<Row className="mb-[12px]">
									<Column>
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Fecha de Cierre:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{closureDate.toLocaleDateString("es-CL", {
												day: "2-digit",
												month: "long",
												year: "numeric",
											})}
										</Text>
									</Column>
								</Row>
							)}

							{closureReason && (
								<Row>
									<Column>
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Razón del Cierre:
										</Text>
										<Text className="rounded-[4px] border border-gray-200 bg-white p-[12px] text-[14px] leading-[20px] text-gray-600">
											{closureReason}
										</Text>
									</Column>
								</Row>
							)}
						</Section>

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
