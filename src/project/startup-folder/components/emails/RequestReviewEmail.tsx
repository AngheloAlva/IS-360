import { format } from "date-fns"
import {
	Hr,
	Row,
	Img,
	Html,
	Head,
	Body,
	Text,
	Button,
	Column,
	Section,
	Heading,
	Tailwind,
	Container,
} from "@react-email/components"

interface RequestReviewEmailTemplateProps {
	reviewUrl: string
	folderName: string
	companyName: string
	solicitationDate: Date
	solicitator: {
		rut: string
		name: string
		email: string
		phone: string | null
	}
}

export const RequestReviewEmail = ({
	reviewUrl,
	folderName,
	companyName,
	solicitator,
	solicitationDate,
}: RequestReviewEmailTemplateProps) => {
	return (
		<Html>
			<Tailwind>
				<Head />
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
								Solicitud de Revisión de Carpeta
							</Heading>

							<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
								Se ha recibido una nueva solicitud de revisión de subcarpeta en OTC 360.
							</Text>

							{/* Request Details */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-blue-50 p-[24px]">
								<Heading className="mb-[12px] text-[20px] font-bold text-gray-800">
									Detalles de la Solicitud
								</Heading>

								<Row className="mb-[10px]">
									<Column>
										<Text className="text-[14px] font-semibold text-gray-700">
											Carpeta Solicitada:
										</Text>
										<Text className="mb-[10px] text-[16px] font-semibold text-blue-600">
											{folderName}
										</Text>
									</Column>
								</Row>

								<Row className="mb-[10px]">
									<Column>
										<Text className="text-[14px] font-semibold text-gray-700">Empresa:</Text>
										<Text className="mb-[10px] text-[16px] text-gray-800">{companyName}</Text>
									</Column>
								</Row>

								<Row className="mb-[10px]">
									<Column>
										<Text className="text-[14px] font-semibold text-gray-700">
											Fecha de Solicitud:
										</Text>
										<Text className="mb-[10px] text-[16px] text-gray-800">
											{format(new Date(solicitationDate), "dd/MM/yyyy HH:mm")}
										</Text>
									</Column>
								</Row>
							</Section>

							{/* Solicitator Information */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-green-500 bg-green-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									Información del Solicitante
								</Heading>

								<Row className="mb-[10px]">
									<Column className="w-[50%]">
										<Text className="text-[14px] font-semibold text-gray-700">Nombre:</Text>
										<Text className="mb-[10px] text-[16px] text-gray-800">{solicitator.name}</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="text-[14px] font-semibold text-gray-700">RUT:</Text>
										<Text className="mb-[10px] text-[16px] text-gray-800">{solicitator.rut}</Text>
									</Column>
								</Row>

								<Row className="mb-[10px]">
									<Column className="w-[50%]">
										<Text className="text-[14px] font-semibold text-gray-700">Email:</Text>
										<Text className="mb-[10px] text-[16px] text-blue-600">{solicitator.email}</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="text-[14px] font-semibold text-gray-700">Teléfono:</Text>
										<Text className="mb-[10px] text-[16px] text-gray-800">{solicitator.phone}</Text>
									</Column>
								</Row>
							</Section>

							{/* Action Required */}
							<Section className="mb-[24px] rounded-[8px] border border-yellow-200 bg-yellow-50 p-[20px]">
								<Text className="mb-[8px] text-[14px] font-semibold text-yellow-800">
									📋 Acción Requerida
								</Text>
								<Text className="text-[14px] leading-[20px] text-yellow-700">
									Esta solicitud requiere revisión y aprobación. Por favor, revisa los detalles y
									procede con la evaluación correspondiente en el sistema.
								</Text>
							</Section>

							{/* Access Button */}
							<Section className="mb-[32px] text-center">
								<Button
									href={reviewUrl}
									className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-blue-600"
								>
									Revisar Solicitud
								</Button>
							</Section>

							{/* Next Steps */}
							<Section className="mb-[24px]">
								<Heading className="mb-[16px] text-[18px] font-bold text-gray-800">
									Próximos Pasos
								</Heading>
								<Text className="mb-[10px] text-[14px] leading-[20px] text-gray-600">
									1. Accede al sistema OTC 360 para revisar la solicitud
								</Text>
								<Text className="mb-[10px] text-[14px] leading-[20px] text-gray-600">
									2. Evalúa la documentación de la subcarpeta solicitada
								</Text>
								<Text className="mb-[10px] text-[14px] leading-[20px] text-gray-600">
									3. Aprueba o rechaza la solicitud con comentarios
								</Text>
								<Text className="mb-[10px] text-[14px] leading-[20px] text-gray-600">
									4. El solicitante será notificado automáticamente de la decisión
								</Text>
							</Section>

							<Hr className="my-[24px] border-gray-200" />

							<Text className="text-[14px] leading-[20px] text-gray-600">
								Este correo ha sido generado automáticamente por el sistema OTC 360. Para cualquier
								consulta técnica, contacta al administrador del sistema.
							</Text>
						</Section>

						{/* Footer */}
						<Section className="rounded-b-[8px] bg-gray-50 px-[40px] py-[24px]">
							<Text className="m-0 mb-[8px] text-center text-[12px] text-gray-500">
								© {new Date().getFullYear()} OTC 360
							</Text>
							<Text className="m-0 text-center text-[12px] text-gray-500">
								Notificación Interna del Sistema - No Responder
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
