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

interface RequestReviewEmailTemplateProps {
	folderName: string
	companyName: string
	solicitator: {
		rut: string
		name: string
		email: string
		phone: string | null
	}
}

const systemUrl = process.env.NEXT_PUBLIC_APP_URL || "https://otc360.ingsimple.cl"

export const RequestReviewEmailTemplate: React.FC<
	Readonly<RequestReviewEmailTemplateProps>
> = async ({ folderName, companyName, solicitator }) => {
	return (
		<Html>
			<Tailwind>
				<Head>
					<title>Solicitud de Revisión de Carpeta - OTC 360</title>
					<Preview>
						{companyName} ha solicitado revisión de la carpeta {folderName}
					</Preview>
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
								Solicitud de Revisión de Carpeta
							</Heading>

							<Text className="mb-[16px] text-base leading-[24px] text-gray-600">
								Se ha solicitado la revisión de la carpeta{" "}
								<span className="font-semibold">{folderName}</span> de la empresa{" "}
								<span className="font-semibold">{companyName}</span>.
							</Text>

							<div className="mb-6 rounded-lg bg-gray-50 p-4">
								<Text className="mb-2 text-sm font-medium text-gray-700">
									Detalles del solicitante:
								</Text>
								<ul className="space-y-2 text-sm text-gray-600">
									<li className="flex items-start">
										<span className="mr-2 font-medium">RUT:</span>
										<span>{solicitator.rut}</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2 font-medium">Nombre:</span>
										<span>{solicitator.name}</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2 font-medium">Correo:</span>
										<span>{solicitator.email}</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2 font-medium">Teléfono:</span>
										<span>{solicitator.phone || "No proporcionado"}</span>
									</li>
								</ul>
							</div>

							<Text className="mb-[16px] text-base leading-[24px] text-gray-600">
								Por favor, revisa la carpeta y notifica al solicitante una vez completada la
								revisión.
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
