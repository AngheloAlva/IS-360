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

interface WorkRequestNewCommentEmailProps {
	userName: string
	commenterName: string
	requestNumber: string
	description: string
	commentContent: string
}

export const WorkRequestNewCommentEmail = ({
	userName,
	commenterName,
	requestNumber,
	description,
	commentContent,
}: WorkRequestNewCommentEmailProps): React.ReactElement => (
	<Html>
		<Tailwind>
			<Head>
				<title>Nuevo comentario en Solicitud de Trabajo - IS 360</title>
				<Preview>
					Nuevo comentario de {commenterName} en tu solicitud #{requestNumber} - IS 360
				</Preview>
			</Head>

			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-lg">
					<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
						<Img
							alt="IS 360 Logo"
							src={`${systemUrl}/logo.png`}
							className="mx-auto h-auto w-full max-w-[200px] object-cover"
						/>
					</Section>

					<Section className="px-[40px] py-[32px]">
						<Heading className="mb-[24px] text-center text-[28px] font-bold text-gray-800">
							Nuevo Comentario en tu Solicitud
						</Heading>

						<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
							Hola {userName}, <strong className="text-gray-800">{commenterName}</strong> agregó
							un nuevo comentario en tu solicitud de trabajo. Revisa el contenido a continuación.
						</Text>

						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-gray-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								Detalles de la Solicitud
							</Heading>

							<Row>
								<Column>
									<Text className="mb-[8px] text-[14px] font-semibold text-gray-700">
										N° de Solicitud:
									</Text>
									<Text className="mb-[16px] rounded-[4px] border border-gray-200 bg-white px-[12px] py-[8px] font-mono text-[16px] text-blue-600">
										#{requestNumber}
									</Text>
								</Column>
							</Row>

							<Row>
								<Column>
									<Text className="mb-[8px] text-[14px] font-semibold text-gray-700">
										Descripción:
									</Text>
									<Text className="mb-[16px] rounded-[4px] border border-gray-200 bg-white px-[12px] py-[8px] text-[14px] leading-[20px] text-gray-700">
										{description}
									</Text>
								</Column>
							</Row>
						</Section>

						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-green-500 bg-green-50 p-[24px]">
							<Heading className="mb-[12px] text-[16px] font-bold text-gray-800">
								Comentario de {commenterName}
							</Heading>
							<Text className="m-0 rounded-[4px] border border-gray-200 bg-white px-[12px] py-[8px] text-[14px] leading-[22px] whitespace-pre-wrap text-gray-700">
								{commentContent}
							</Text>
						</Section>

						<Section className="mb-[32px] text-center">
							<Button
								href={`${systemUrl}/admin/dashboard/solicitudes-de-trabajo`}
								className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-blue-600"
							>
								Ver solicitud y responder
							</Button>
						</Section>

						<Hr className="my-[24px] border-gray-200" />

						<Text className="text-[14px] leading-[20px] text-gray-600">
							Puedes ingresar a la plataforma para ver el hilo completo de comentarios y
							responder a tu equipo.
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
