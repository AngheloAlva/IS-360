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

interface ReviewEmailTemplateProps {
	folderName: string
	companyName: string
}

const systemUrl = process.env.NEXT_PUBLIC_APP_URL || "https://otc360.ingsimple.cl"

export const ReviewEmail: React.FC<Readonly<ReviewEmailTemplateProps>> = async ({
	folderName,
	companyName,
}) => {
	return (
		<Html>
			<Tailwind>
				<Head>
					<title>La carpeta {folderName} ha sido revisada - OTC 360</title>
					<Preview>La carpeta {folderName} ha sido revisada por OTC</Preview>
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
								Revisión de Carpeta
							</Heading>

							<Text className="mb-[16px] text-base leading-[24px] text-gray-600">
								Se ha revisado la carpeta <span className="font-semibold">{folderName}</span> de la
								empresa <span className="font-semibold">{companyName}</span>.
							</Text>

							<Text className="mb-[16px] text-base leading-[24px] text-gray-600">
								Por favor, si hay algún archivo que requiera actualización realice la actualización
								en OTC 360 y envíe la carpeta de nuevo para su revisión.
							</Text>

							<Button
								href={`${systemUrl}`}
								className="bg-primary hover:bg-primary/90 mx-auto mt-[24px] mb-[32px] block w-fit rounded-md px-6 py-3 text-center font-medium text-white"
							>
								Ir a OTC 360
							</Button>

							<Text className="mb-[16px] text-base leading-[24px] text-gray-600">
								Atentamente,
								<br />
								<strong>Equipo de OTC 360</strong>
							</Text>
							<Hr className="my-[32px] border-gray-200" />

							<Text className="text-center text-sm text-gray-500">
								Si tienes alguna duda, no dudes en contactarnos a través de nuestro correo
								electrónico:
								<br />
								<a href="mailto:soporte@otc360.cl" className="text-blue-600 hover:underline">
									soporte@otc360.cl
								</a>
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
