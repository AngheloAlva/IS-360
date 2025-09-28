import {
	Hr,
	Img,
	Html,
	Text,
	Body,
	Head,
	Section,
	Heading,
	Preview,
	Tailwind,
	Container,
} from "@react-email/components"

interface SupportEmailProps {
	message: string
	filesUrls: string[]
	type: "support" | "contact"
}

const systemUrl = "https://otc360.cl"

export const SupportEmail: React.FC<Readonly<SupportEmailProps>> = ({
	message,
	filesUrls,
	type,
}) => (
	<Html>
		<Tailwind>
			<Head>
				<title>Nuevo mensaje de ${type === "support" ? "soporte" : "contacto"}</title>
				<Preview>Nuevo mensaje de ${type === "support" ? "soporte" : "contacto"}</Preview>
			</Head>
			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[40px]">
					<Section className="mb-[32px] text-center">
						<Img
							width="150"
							height="142"
							alt="OTC 360 Logo"
							src={`${systemUrl}/logo.png`}
							className="mx-auto h-auto w-[150px] object-cover"
						/>
					</Section>

					<Section>
						<Heading className="mb-[24px] text-center text-[24px] font-bold text-gray-800">
							Mensaje de ${type === "support" ? "soporte" : "contacto"}
						</Heading>

						<Text className="mb-[24px] text-[16px] text-gray-600">{message}</Text>

						{filesUrls.length > 0 && (
							<Section>
								<Heading className="mb-[24px] text-center text-[24px] font-bold text-gray-800">
									Archivos adjuntos
								</Heading>

								{filesUrls.map((fileUrl) => (
									<a href={fileUrl} key={fileUrl}>
										<Text className="mb-[24px] text-[16px] text-blue-500 underline">{fileUrl}</Text>
									</a>
								))}
							</Section>
						)}
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
