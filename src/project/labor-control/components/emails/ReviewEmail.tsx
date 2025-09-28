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
	Preview,
	Tailwind,
	Container,
} from "@react-email/components"

import { systemUrl } from "@/lib/consts/systemUrl"

interface ReviewEmailTemplateProps {
	folderName: string
	companyName: string
	reviewDate: Date
	reviewer: {
		name: string
		email: string
		phone: string | null
	}
	rejectedDocuments?: Array<{
		name: string
		reason: string
	}>
	isApproved: boolean
}

export const ReviewEmail = ({
	reviewer,
	isApproved,
	reviewDate,
	folderName,
	companyName,
	rejectedDocuments,
}: ReviewEmailTemplateProps) => {
	return (
		<Html>
			<Tailwind>
				<Head>
					<title>Resultado de Revisión: {folderName} - OTC 360</title>
					<Preview>Resultado de la revisión de la carpeta {folderName}</Preview>
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
								Resultado de Revisión - Control Laboral
							</Heading>

							<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
								Se ha completado la revisión de los documentos de Control Laboral en OTC 360.
							</Text>

							{/* Review Details */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-blue-50 p-[24px]">
								<Heading className="mb-[12px] text-[20px] font-bold text-gray-800">
									Detalles de la Revisión
								</Heading>

								<Row className="mb-[10px]">
									<Column>
										<Text className="text-[14px] leading-none font-semibold text-gray-700">
											Control Laboral Revisado:
										</Text>
										<Text className="mb-[10px] text-[16px] leading-none font-semibold text-blue-600">
											{folderName}
										</Text>
									</Column>
								</Row>

								<Row className="mb-[10px]">
									<Column>
										<Text className="text-[14px] leading-none font-semibold text-gray-700">
											Empresa:
										</Text>
										<Text className="mb-[10px] text-[16px] leading-none text-gray-800">
											{companyName}
										</Text>
									</Column>
								</Row>

								<Row className="mb-[10px]">
									<Column>
										<Text className="text-[14px] leading-none font-semibold text-gray-700">
											Fecha de Revisión:
										</Text>
										<Text className="mb-[10px] text-[16px] leading-none text-gray-800">
											{format(new Date(reviewDate), "dd/MM/yyyy HH:mm")}
										</Text>
									</Column>
								</Row>
							</Section>

							{/* Reviewer Information */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-green-500 bg-green-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									Información del Revisor
								</Heading>

								<Row className="mb-[10px]">
									<Column className="w-[50%]">
										<Text className="text-[14px] leading-none font-semibold text-gray-700">
											Nombre:
										</Text>
										<Text className="mb-[10px] text-[16px] leading-none text-gray-800">
											{reviewer.name}
										</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="text-[14px] leading-none font-semibold text-gray-700">
											Email:
										</Text>
										<Text className="mb-[10px] text-[16px] leading-none text-blue-600">
											{reviewer.email}
										</Text>
									</Column>
								</Row>
							</Section>

							{/* Review Status */}
							<Section
								className={`mb-[24px] rounded-[8px] border-l-[4px] p-[24px] ${
									isApproved ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"
								}`}
							>
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									Estado de la Revisión
								</Heading>

								{isApproved ? (
									<Text className="text-[16px] leading-[24px] text-green-700">
										✅ Los documentos de Control Laboral han sido aprobados satisfactoriamente. Toda
										la documentación cumple con los requisitos establecidos.
									</Text>
								) : (
									<>
										<Text className="mb-[16px] text-[16px] leading-[24px] text-yellow-700">
											⚠️ Se han encontrado documentos de Control Laboral que requieren atención. Por
											favor, revise los siguientes documentos:
										</Text>

										{rejectedDocuments?.map((doc, index) => (
											<Section
												key={index}
												className="mb-[12px] rounded-[4px] bg-yellow-100 p-[12px]"
											>
												<Text className="text-[14px] leading-none font-semibold text-yellow-800">
													{doc.name}
												</Text>
												<Text className="text-[14px] leading-none text-yellow-700">
													{doc.reason}
												</Text>
											</Section>
										))}
									</>
								)}
							</Section>

							{/* Next Steps */}
							<Section className="mb-[24px]">
								<Heading className="mb-[16px] text-[18px] font-bold text-gray-800">
									Próximos Pasos
								</Heading>
								{isApproved ? (
									<Text className="mb-[10px] text-[14px] leading-[20px] text-gray-600">
										Los documentos de Control Laboral han sido aprobados y están listos. No se
										requieren acciones adicionales.
									</Text>
								) : (
									<>
										<Text className="mb-[10px] text-[14px] leading-[10px] text-gray-600">
											1. Revise los comentarios para cada documento rechazado
										</Text>
										<Text className="mb-[10px] text-[14px] leading-[10px] text-gray-600">
											2. Realice las correcciones necesarias en los documentos
										</Text>
										<Text className="mb-[10px] text-[14px] leading-[10px] text-gray-600">
											3. Vuelva a enviar los documentos de Control Laboral para su revisión
										</Text>
									</>
								)}
							</Section>

							{/* Action Button */}
							{!isApproved && (
								<Section className="mb-[32px] text-center">
									<Button
										href={systemUrl}
										className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-blue-600"
									>
										Ir a OTC 360
									</Button>
								</Section>
							)}

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
