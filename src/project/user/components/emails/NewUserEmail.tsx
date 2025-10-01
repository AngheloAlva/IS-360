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

interface NewuserEmailTemplateProps {
	name: string
	email: string
	password: string
}

export const NewUserEmail = ({
	name,
	email,
	password,
}: NewuserEmailTemplateProps): React.ReactElement => (
	<Html>
		<Tailwind>
			<Head>
				<title>¡Bienvenido a IS 360!</title>
				<Preview>Datos de acceso para tu cuenta en IS 360</Preview>
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
							¡Bienvenido a IS 360!
						</Heading>

						<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
							{name}, nos complace informarte que tu cuenta en el sistema IS 360 ha sido creada
							exitosamente. Ahora puedes iniciar sesión con tus credenciales y comenzar a utilizar
							el sistema.
						</Text>

						{/* Access Credentials */}
						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-green-500 bg-gray-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								Credenciales de Acceso
							</Heading>

							<Row>
								<Column>
									<Text className="mb-[8px] text-[14px] font-semibold text-gray-700">
										Correo Electrónico:
									</Text>
									<Text className="mb-[16px] rounded-[4px] border border-gray-200 bg-white px-[12px] py-[8px] font-mono text-[16px] text-blue-600">
										{email}
									</Text>
								</Column>
							</Row>

							<Row>
								<Column>
									<Text className="mb-[8px] text-[14px] font-semibold text-gray-700">
										Contraseña Temporal:
									</Text>
									<Text className="mb-[16px] rounded-[4px] border border-gray-200 bg-white px-[12px] py-[8px] font-mono text-[16px] text-green-600">
										{password}
									</Text>
								</Column>
							</Row>
						</Section>

						{/* Security Notice */}
						<Section className="mb-[24px] rounded-[8px] border border-yellow-200 bg-yellow-50 p-[20px]">
							<Text className="mb-[8px] text-[14px] font-semibold text-yellow-800">
								⚠️ Importante - Seguridad de tu Cuenta
							</Text>
							<Text className="text-[14px] leading-[20px] text-yellow-700">
								Por tu seguridad, te recomendamos encarecidamente cambiar tu contraseña temporal
								inmediatamente después de tu primer inicio de sesión. Utiliza una contraseña segura
								que incluya letras mayúsculas, minúsculas, números y símbolos.
							</Text>
						</Section>

						{/* Access Button */}
						<Section className="mb-[32px] text-center">
							<Button
								href={systemUrl}
								className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-blue-600"
							>
								Acceder al Sistema IS 360
							</Button>
						</Section>

						{/* Additional Information */}
						<Section className="mb-[24px]">
							<Heading className="mb-[16px] text-[18px] font-bold text-gray-800">
								Próximos Pasos
							</Heading>
							<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
								1. Haz clic en el botón &quot;Acceder al Sistema IS 360&quot; o visita la plataforma
								directamente
							</Text>
							<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
								2. Inicia sesión con las credenciales proporcionadas
							</Text>
							<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
								3. Cambia tu contraseña temporal por una segura
							</Text>
							<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
								4. Explora las funcionalidades del sistema
							</Text>
						</Section>

						<Hr className="my-[24px] border-gray-200" />

						<Text className="text-[14px] leading-[20px] text-gray-600">
							Si tienes alguna pregunta o necesitas asistencia técnica, no dudes en contactar a
							nuestro equipo de soporte. Estamos aquí para ayudarte a aprovechar al máximo las
							capacidades de IS 360.
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
