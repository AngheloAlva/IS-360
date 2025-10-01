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

interface ApproveMilestoneEmailProps {
	otNumber: string
	milestoneName: string
	comment?: string
}

export const ApproveMilestoneEmail: React.FC<Readonly<ApproveMilestoneEmailProps>> = ({
	comment,
	otNumber,
	milestoneName,
}) => (
	<Html>
		<Tailwind>
			<Head>
				<title>Hito {otNumber} aprobado - IS 360</title>
				<Preview>
					El hito {milestoneName} de la orden de trabajo {otNumber} ha sido aprobado
				</Preview>
			</Head>
			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-lg">
					{/* Header with Logo */}
					<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
						<Img
							src="https://is360.ingsimple.cl/logo.jpg"
							alt="IS 360 Logo"
							className="mx-auto h-auto w-full max-w-[200px] object-cover"
						/>
					</Section>

					{/* Main Content */}
					<Section className="px-[40px] py-[32px]">
						<Heading className="mb-[24px] text-center text-[28px] font-bold text-gray-800">
							Hito Aprobado
						</Heading>

						<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
							Estimado/a usuario, le informamos que el hito <strong>{milestoneName}</strong> de la
							orden de trabajo <strong>{otNumber}</strong> ha sido aprobado.
						</Text>

						{/* Milestone Details */}
						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-blue-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								Detalles del Hito
							</Heading>

							<Row className="mb-[12px]">
								<Column className="w-[50%]">
									<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
										Nombre del Hito:
									</Text>
									<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
										{milestoneName}
									</Text>
								</Column>
								<Column className="w-[50%]">
									<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
										Número OT:
									</Text>
									<Text className="mb-[12px] text-[16px] leading-none font-bold text-blue-600">
										{otNumber}
									</Text>
								</Column>
							</Row>

							{comment && (
								<Row>
									<Column>
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Comentario:
										</Text>
										<Text className="rounded-[4px] border border-gray-200 bg-white p-[12px] text-[14px] leading-[20px] text-gray-600">
											{comment}
										</Text>
									</Column>
								</Row>
							)}
						</Section>

						{/* Next Steps */}
						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-green-500 bg-green-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								Próximos Pasos
							</Heading>

							<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
								<strong>1.</strong> Continuar con la ejecución de los siguientes hitos planificados
							</Text>
							<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
								<strong>2.</strong> Mantener actualizado el libro de obras con las actividades
								diarias
							</Text>
							<Text className="text-[14px] leading-[20px] text-gray-600">
								<strong>3.</strong> Asegurar el cumplimiento de los plazos establecidos
							</Text>
						</Section>

						{/* Action Button */}
						<Section className="mb-[32px] text-center">
							<Button
								href={systemUrl}
								className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-blue-600"
							>
								Acceder a IS 360
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
							© {new Date().getFullYear()} IS 360
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
