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

const systemUrl = "https://is360.cl"

export const OTPCodeEmail: React.FC<Readonly<OTPCodeEmailTemplateProps>> = ({ otp }) => (
	<Html>
		<Tailwind>
			<Head>
				<title>Código de verificación para IS 360 - OTC</title>
				<Preview>Su código de verificación para acceder a IS 360 - OTC es: {otp}</Preview>
			</Head>
			<Body className="bg-gray-100 py-10 font-sans">
				<Container className="mx-auto max-w-150 rounded-xl bg-white p-10">
					<Section className="mb-8 text-center">
						<Img
							width="150"
							height="142"
							alt="IS 360 Logo"
							src={`${systemUrl}/logo.png`}
							className="mx-auto h-auto w-37.5 object-cover"
						/>
					</Section>

					<Section>
						<Heading className="mb-6 text-center text-[24px] font-bold text-gray-800">
							Código de Verificación
						</Heading>

						<Text className="mb-4 text-[16px] text-gray-600">Estimado usuario,</Text>

						<Text className="mb-6 text-[16px] text-gray-600">
							Hemos recibido una solicitud de inicio de sesión en su cuenta de{" "}
							<strong>IS 360 - OTC</strong>. Para completar el proceso de verificación, utilice el
							siguiente código:
						</Text>

						<Section className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
							<Text className="my-2 text-[32px] font-bold tracking-[5px] text-blue-600">{otp}</Text>
						</Section>

						<Text className="mb-4 text-[16px] text-gray-600">
							Este código solo puede utilizarse una vez.
						</Text>

						<Text className="mb-6 text-[16px] text-gray-600">
							Si usted no ha intentado iniciar sesión, le recomendamos cambiar su contraseña
							inmediatamente o contactar a nuestro equipo de soporte técnico.
						</Text>

						<Section className="mb-8 text-center">
							<Button
								href={systemUrl}
								className="box-input rounded-lg bg-blue-600 px-6 py-3 text-center font-bold text-white no-underline"
							>
								Ir al Sistema
							</Button>
						</Section>

						<Text className="mb-4 text-[16px] text-gray-600">
							Por razones de seguridad, nunca comparta este código con otras personas, incluyendo
							personal de IS 360. Nuestro equipo nunca le solicitará su código de verificación.
						</Text>

						<Text className="mb-2 text-[16px] text-gray-600">Saludos cordiales,</Text>

						<Text className="mb-6 text-[16px] font-bold text-gray-700">El equipo de IS 360</Text>
					</Section>

					<Hr className="my-6 border-t border-gray-300" />

					<Section>
						<Text className="m-0 text-center text-[14px] text-gray-500">
							© {new Date().getFullYear()} IS 360. Todos los derechos reservados.
						</Text>
					</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
)
