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
  companyName: string
  folderId: string
  folderName: string
  submittedBy: string
  submittedAt: Date
  message?: string
  reviewLink: string
}

const systemUrl = process.env.NEXT_PUBLIC_APP_URL || "https://otc360.ingsimple.cl"

export const RequestReviewEmailTemplate: React.FC<Readonly<RequestReviewEmailTemplateProps>> = async ({
  companyName,
  folderId,
  folderName,
  submittedBy,
  submittedAt,
  message,
  reviewLink,
}) => {
  const formattedDate = new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(submittedAt))

  return (
    <Html>
      <Tailwind>
        <Head>
          <title>Solicitud de Revisión de Carpeta - OTC 360</title>
          <Preview>{companyName} ha solicitado revisión de la carpeta {folderName}</Preview>
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
                Solicitud de Revisión de Carpeta
              </Heading>

              <Text className="mb-[16px] text-base leading-[24px] text-gray-600">
                Se ha solicitado la revisión de la carpeta <span className="font-semibold">{folderName}</span> de la empresa{" "}
                <span className="font-semibold">{companyName}</span>.
              </Text>

              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">Detalles de la solicitud:</Text>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2 font-medium">Solicitado por:</span>
                    <span>{submittedBy}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-medium">Fecha y hora:</span>
                    <span>{formattedDate}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-medium">ID de carpeta:</span>
                    <span className="font-mono">{folderId}</span>
                  </li>
                  {message && (
                    <li className="mt-3 pt-3 border-t border-gray-200">
                      <p className="mb-1 text-sm font-medium text-gray-700">Mensaje adicional:</p>
                      <p className="rounded bg-white p-3 text-sm text-gray-700">{message}</p>
                    </li>
                  )}
                </ul>
              </div>

              <Text className="mb-[16px] text-base leading-[24px] text-gray-600">
                Por favor, revisa la carpeta y notifica al solicitante una vez completada la revisión.
              </Text>

              <Button
                href={reviewLink}
                className="bg-primary hover:bg-primary/90 mx-auto mb-[32px] mt-[24px] block w-fit rounded-md px-6 py-3 text-center font-medium text-white"
              >
                Revisar Carpeta
              </Button>

              <Text className="mb-[16px] text-base leading-[24px] text-gray-600">
                Atentamente,
                <br />
                <strong>Equipo de OTC 360</strong>
              </Text>
              <Hr className="my-[32px] border-gray-200" />

              <Text className="text-center text-sm text-gray-500">
                Si tienes alguna duda, no dudes en contactarnos a través de nuestro correo electrónico:
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
