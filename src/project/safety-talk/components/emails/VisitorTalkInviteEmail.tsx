import { systemUrl } from "@/lib/consts/systemUrl"
import {
	Hr,
	Img,
	Html,
	Text,
	Body,
	Head,
	Button,
	Section,
	Heading,
	Preview,
	Tailwind,
	Container,
} from "@react-email/components"

interface VisitorTalkInviteEmailProps {
	companyName: string
	visitorEmail: string
	accessToken: string
	expiresAt: Date
}

export const VisitorTalkInviteEmail = ({
	companyName,
	visitorEmail,
	accessToken,
	expiresAt,
}: VisitorTalkInviteEmailProps): React.ReactElement => {
	const accessUrl = `${systemUrl}/charla-de-visitas/${accessToken}?email=${encodeURIComponent(visitorEmail)}`

	const expirationDate = expiresAt.toLocaleDateString("es-ES", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	})

	return (
		<Html>
			<Tailwind>
				<Head>
					<title>Invitación a Charla de Visitas - IS 360</title>
					<Preview>Accede a la charla de visitas de {companyName}</Preview>
				</Head>

				<Body className="bg-gray-100 py-[40px] font-sans">
					<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-lg">
						<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
							<Img
								alt="IS 360 Logo"
								src={`${systemUrl}/logo.jpg`}
								className="mx-auto h-auto w-full max-w-[200px] object-cover"
							/>
						</Section>

						{/* Welcome Content */}
						<Section className="px-[40px] py-[32px]">
							<Heading className="mb-[24px] text-center text-[28px] font-bold text-gray-800">
								¡Invitación a Charla de Visitas!
							</Heading>

							<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
								Estimado/a visitante de <strong>{companyName}</strong>, has sido invitado/a a
								participar en una charla de visitas obligatoria antes de ingresar a las
								instalaciones de IS 360.
							</Text>

							<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
								Esta charla es fundamental para garantizar tu visitas y la de todos los trabajadores
								en nuestras instalaciones.
							</Text>

							{/* Access Information */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-gray-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									Instrucciones de Acceso
								</Heading>

								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									1. Haz clic en el botón &quot;Acceder a la Charla&quot; a continuación
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									2. Completa tus datos personales (nombre y RUT)
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									3. Visualiza completamente el video de visitas
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									4. Una vez completada, podrás ingresar a las instalaciones
								</Text>
							</Section>

							{/* Access Button */}
							<Section className="mb-[32px] text-center">
								<Button
									href={accessUrl}
									className="box-border rounded-[8px] bg-emerald-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-emerald-600"
								>
									Acceder a la Charla de Visitas
								</Button>
							</Section>

							{/* Expiration Notice */}
							<Section className="mb-[24px] rounded-[8px] border border-yellow-200 bg-yellow-50 p-[20px]">
								<Text className="mb-[8px] text-[14px] font-semibold text-yellow-800">
									⏰ Fecha Límite de Acceso
								</Text>
								<Text className="text-[14px] leading-[20px] text-yellow-700">
									Este enlace estará disponible hasta el <strong>{expirationDate}</strong>. Después
									de esta fecha, deberás solicitar un nuevo acceso.
								</Text>
							</Section>

							{/* Important Information */}
							<Section className="mb-[24px] rounded-[8px] border border-red-200 bg-red-50 p-[20px]">
								<Text className="mb-[8px] text-[14px] font-semibold text-red-800">
									⚠️ Importante - Requisito Obligatorio
								</Text>
								<Text className="text-[14px] leading-[20px] text-red-700">
									La visualización completa de esta charla de visitas es{" "}
									<strong>obligatoria</strong> para poder ingresar a las instalaciones de IS 360.
									Sin la certificación de haber completado la charla, no se permitirá el acceso.
								</Text>
							</Section>

							<Hr className="my-[24px] border-gray-200" />

							<Text className="text-[14px] leading-[20px] text-gray-600">
								Si tienes alguna pregunta o problema técnico para acceder a la charla, por favor
								contacta al equipo de visitas de IS 360 o a tu supervisor en {companyName}.
							</Text>

							<Text className="mt-[16px] text-[14px] leading-[20px] text-gray-600">
								Gracias por tu colaboración en mantener un ambiente de trabajo seguro.
							</Text>
						</Section>

						{/* Footer */}
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
}
