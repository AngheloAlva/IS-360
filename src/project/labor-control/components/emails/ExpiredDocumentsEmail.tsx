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

interface ExpiredDocument {
	id: string
	name: string
	type: string
	status: string
	category: string
	expirationDate: Date
}

interface ExpiredDocumentsEmailProps {
	companyName: string
	expiredDocuments: ExpiredDocument[]
	totalExpiredDocuments: number
	categorySummary: Record<string, number>
	isInternal?: boolean
}

const categoryNames: Record<string, string> = {
	BASIC: "Documentos Básicos",
	SAFETY_AND_HEALTH: "Seguridad y Salud",
	ENVIRONMENTAL: "Documentos Ambientales",
	ENVIRONMENT: "Medio Ambiente",
	TECHNICAL_SPECS: "Especificaciones Técnicas",
	PERSONNEL: "Personal",
	VEHICLES: "Vehículos",
}

const formatDate = (date: Date): string => {
	return new Intl.DateTimeFormat("es-CL", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(date)
}

export const ExpiredDocumentsEmail = ({
	companyName,
	expiredDocuments,
	totalExpiredDocuments,
	categorySummary,
	isInternal = false,
}: ExpiredDocumentsEmailProps): React.ReactElement => (
	<Html>
		<Tailwind>
			<Head>
				<title>Alerta: Documentos Vencidos - {companyName}</title>
				<Preview>
					{isInternal
						? `${totalExpiredDocuments} documentos vencidos detectados para ${companyName}`
						: `${totalExpiredDocuments} documentos de su empresa han vencido`}
				</Preview>
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
					<Section className="px-[40px] py-[32px]">
						<Heading className="mb-[24px] text-center text-[28px] font-bold text-red-600">
							⚠️ Alerta: Documentos Vencidos
						</Heading>

						<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
							{isInternal
								? `Se han detectado ${totalExpiredDocuments} documentos vencidos para la empresa ${companyName}. Es necesario tomar acción inmediata para mantener el cumplimiento normativo.`
								: `Estimado equipo de ${companyName}, le informamos que ${totalExpiredDocuments} documentos de su empresa han vencido y requieren actualización inmediata para mantener el cumplimiento normativo.`}
						</Text>

						{/* Summary by Category */}
						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-red-500 bg-red-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-red-800">
								Resumen por Categoría
							</Heading>

							{Object.entries(categorySummary).map(([category, count]) => (
								<Row key={category} className="mb-[8px]">
									<Column>
										<Text className="m-0 text-[14px] text-red-700">
											<strong>{categoryNames[category] || category}:</strong> {count} documento
											{count > 1 ? "s" : ""}
										</Text>
									</Column>
								</Row>
							))}
						</Section>

						{/* Detailed Document List */}
						<Section className="mb-[24px]">
							<Heading className="mb-[16px] text-[18px] font-bold text-gray-800">
								Documentos Vencidos
							</Heading>

							<Section className="rounded-[8px] border border-gray-200 bg-gray-50 p-[16px]">
								{expiredDocuments.slice(0, 10).map((doc, index) => (
									<Row
										key={doc.id}
										className={index > 0 ? "mt-[12px] border-t border-gray-200 pt-[12px]" : ""}
									>
										<Column>
											<Text className="m-0 mb-[4px] text-[14px] font-semibold text-gray-800">
												{doc.name}
											</Text>
											<Text className="m-0 mb-[4px] text-[12px] text-gray-600">
												Tipo: {doc.type} | Categoría: {categoryNames[doc.category] || doc.category}
											</Text>
											<Text className="m-0 text-[12px] font-medium text-red-600">
												Vencido el: {formatDate(doc.expirationDate)}
											</Text>
										</Column>
									</Row>
								))}

								{expiredDocuments.length > 10 && (
									<Row className="mt-[12px] border-t border-gray-200 pt-[12px]">
										<Column>
											<Text className="m-0 text-center text-[12px] text-gray-500">
												... y {expiredDocuments.length - 10} documento
												{expiredDocuments.length - 10 > 1 ? "s" : ""} más
											</Text>
										</Column>
									</Row>
								)}
							</Section>
						</Section>

						{/* Action Required */}
						<Section className="mb-[24px] rounded-[8px] border border-orange-200 bg-orange-50 p-[20px]">
							<Text className="mb-[8px] text-[14px] font-semibold text-orange-800">
								🚨 Acción Requerida
							</Text>
							<Text className="text-[14px] leading-[20px] text-orange-700">
								{isInternal
									? "Es necesario contactar a la empresa contratista para solicitar la actualización de estos documentos y garantizar el cumplimiento normativo."
									: "Por favor, actualice estos documentos lo antes posible para mantener el cumplimiento normativo y evitar interrupciones en las operaciones."}
							</Text>
						</Section>

						{/* Access Button */}
						<Section className="mb-[32px] text-center">
							<Button
								href={systemUrl}
								className="box-border rounded-[8px] bg-red-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-red-600"
							>
								Acceder al Sistema OTC 360
							</Button>
						</Section>

						{/* Next Steps */}
						<Section className="mb-[24px]">
							<Heading className="mb-[16px] text-[18px] font-bold text-gray-800">
								Próximos Pasos
							</Heading>
							{isInternal ? (
								<>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
										1. Contactar a los supervisores de {companyName} para notificar sobre los
										documentos vencidos
									</Text>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
										2. Solicitar la actualización inmediata de los documentos
									</Text>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
										3. Hacer seguimiento del estado de actualización
									</Text>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
										4. Verificar el cumplimiento normativo una vez actualizados
									</Text>
								</>
							) : (
								<>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
										1. Acceder al sistema OTC 360 con sus credenciales
									</Text>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
										2. Navegar a la sección de documentos correspondiente
									</Text>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
										3. Subir las versiones actualizadas de los documentos
									</Text>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
										4. Verificar que las nuevas fechas de vencimiento sean correctas
									</Text>
								</>
							)}
						</Section>

						<Hr className="my-[24px] border-gray-200" />

						<Text className="text-[14px] leading-[20px] text-gray-600">
							Si tiene alguna pregunta o necesita asistencia técnica, no dude en contactar a nuestro
							equipo de soporte. Es importante mantener todos los documentos actualizados para
							garantizar el cumplimiento normativo y la seguridad en las operaciones.
						</Text>
					</Section>

					{/* Footer */}
					<Section className="rounded-b-[8px] bg-gray-50 px-[40px] py-[24px]">
						<Text className="m-0 mb-[8px] text-center text-[12px] text-gray-500">
							© {new Date().getFullYear()} OTC 360 - Sistema de Gestión de Contratistas
						</Text>
						<Text className="m-0 text-center text-[12px] text-gray-500">
							Este es un correo automático generado por el sistema de alertas.
						</Text>
					</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
)
