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

interface CompleteFolderEmailTemplateProps {
	folderName: string
	companyName: string
	completeDate: Date
	completedBy: {
		name: string
		email: string
		phone: string | null
	}
}

export const CompleteFolderEmail = ({
	folderName,
	companyName,
	completedBy,
	completeDate,
}: CompleteFolderEmailTemplateProps) => {
	return (
		<Html>
			<Tailwind>
				<Head>
					<title>Carpeta Completada: {folderName} - OTC 360</title>
					<Preview>La carpeta {folderName} ha sido completada exitosamente</Preview>
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
								¡Carpeta Completada!
							</Heading>

							<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
								La carpeta ha sido completada exitosamente en OTC 360 y ya puedes iniciar las
								actividades.
							</Text>

							{/* Folder Details */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-blue-50 p-[24px]">
								<Heading className="mb-[12px] text-[20px] font-bold text-gray-800">
									Detalles de la Carpeta
								</Heading>

								<Row className="mb-[10px]">
									<Column>
										<Text className="text-[14px] leading-none font-semibold text-gray-700">
											Carpeta Completada:
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
											Fecha de Completado:
										</Text>
										<Text className="mb-[10px] text-[16px] leading-none text-gray-800">
											{format(new Date(completeDate), "dd/MM/yyyy HH:mm")}
										</Text>
									</Column>
								</Row>
							</Section>

							{/* Completion Information */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-green-500 bg-green-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									Información del Aprobador
								</Heading>

								<Row className="mb-[10px]">
									<Column className="w-[50%]">
										<Text className="text-[14px] leading-none font-semibold text-gray-700">
											Aprobado por:
										</Text>
										<Text className="mb-[10px] text-[16px] leading-none text-gray-800">
											{completedBy.name}
										</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="text-[14px] leading-none font-semibold text-gray-700">
											Email:
										</Text>
										<Text className="mb-[10px] text-[16px] leading-none text-blue-600">
											{completedBy.email}
										</Text>
									</Column>
								</Row>
							</Section>

							{/* Success Message */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-green-500 bg-green-50 p-[24px]">
								<Text className="text-[16px] leading-[24px] text-green-700">
									✅ La carpeta ha sido completada exitosamente. Todos los documentos cumplen con
									los requisitos establecidos.
								</Text>
							</Section>

							{/* Action Button */}
							<Section className="mb-[32px] text-center">
								<Button
									href={systemUrl}
									className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-blue-600"
								>
									Ir a OTC 360
								</Button>
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
