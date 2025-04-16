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

interface OTPCodeEmailTemplateProps {
	otp: string
}

const systemUrl = "https://otc360.ingsimple.cl"

export const OTPCodeEmailTemplate: React.FC<Readonly<OTPCodeEmailTemplateProps>> = ({ otp }) => (
	<Html>
		<Tailwind>
			<Head>
				<title>Código de verificación para OTC 360 - OTC</title>
				<Preview>Su código de verificación para acceder a OTC 360 - OTC es: {otp}</Preview>
			</Head>
			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[40px]">
					<Section className="mb-[32px] text-center">
						<Img
							width="150"
							height="142"
							alt="OTC 360 Logo"
							src={`${systemUrl}/logo.svg`}
							className="mx-auto h-auto w-[150px] object-cover"
						/>
					</Section>

					<Section>
						<Heading className="mb-[24px] text-center text-[24px] font-bold text-gray-800">
							Código de Verificación
						</Heading>

						<Text className="mb-[16px] text-[16px] text-gray-600">Estimado usuario,</Text>

						<Text className="mb-[24px] text-[16px] text-gray-600">
							Hemos recibido una solicitud de inicio de sesión en su cuenta de{" "}
							<strong>OTC 360 - OTC</strong>. Para completar el proceso de verificación, utilice el
							siguiente código:
						</Text>

						<Section className="mb-[24px] rounded-[8px] border border-gray-200 bg-gray-50 p-[24px] text-center">
							<Text className="my-[8px] text-[32px] font-bold tracking-[5px] text-blue-600">
								{otp}
							</Text>
						</Section>

						<Text className="mb-[16px] text-[16px] text-gray-600">
							Este código solo puede utilizarse una vez.
						</Text>

						<Text className="mb-[24px] text-[16px] text-gray-600">
							Si usted no ha intentado iniciar sesión, le recomendamos cambiar su contraseña
							inmediatamente o contactar a nuestro equipo de soporte técnico.
						</Text>

						<Section className="mb-[32px] text-center">
							<Button
								href={systemUrl}
								className="box-input rounded-[4px] bg-blue-600 px-[24px] py-[12px] text-center font-bold text-white no-underline"
							>
								Ir al Sistema
							</Button>
						</Section>

						<Text className="mb-[16px] text-[16px] text-gray-600">
							Por razones de seguridad, nunca comparta este código con otras personas, incluyendo
							personal de OTC 360. Nuestro equipo nunca le solicitará su código de verificación.
						</Text>

						<Text className="mb-[8px] text-[16px] text-gray-600">Saludos cordiales,</Text>

						<Text className="mb-[24px] text-[16px] font-bold text-gray-700">
							El equipo de OTC 360
						</Text>
					</Section>

					<Hr className="my-[24px] border-t border-gray-300" />

					<Section>
						<Text className="m-0 text-center text-[14px] text-gray-500">
							© {new Date().getFullYear()} OTC 360. Todos los derechos reservados.
						</Text>
					</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
)
