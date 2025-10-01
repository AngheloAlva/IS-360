import * as React from "react"
import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components"

interface WorkRequestStatusUpdateEmailProps {
	userName: string
	requestNumber: string
	status: string
	description: string
	baseUrl: string
}

export const WorkRequestStatusUpdateEmail = ({
	userName,
	requestNumber,
	status,
	description,
	baseUrl,
}: WorkRequestStatusUpdateEmailProps) => {
	return (
		<Html>
			<Head />
			<Preview>
				Actualización de estado de tu solicitud de trabajo #{requestNumber} - IS 360
			</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={heading}>IS 360 - Gestión de Solicitudes</Heading>
					<Section style={section}>
						<Text style={paragraph}>Hola {userName},</Text>
						<Text style={paragraph}>
							Te informamos que tu solicitud de trabajo #{requestNumber} ha sido actualizada.
						</Text>
						<Text style={paragraph}>
							<strong>Estado actual:</strong> {status}
						</Text>
						<Text style={paragraph}>
							<strong>Descripción de la solicitud:</strong> {description}
						</Text>
						<Text style={paragraph}>
							Puedes consultar más detalles de tu solicitud accediendo a tu panel de usuario en
							nuestra plataforma.
						</Text>
						<Text style={paragraph}>
							<Link href={`${baseUrl}/dashboard`} style={button}>
								Ver detalle de la solicitud
							</Link>
						</Text>
					</Section>
					<Text style={footer}>
						Este es un mensaje automático, por favor no responda a este correo.
					</Text>
				</Container>
			</Body>
		</Html>
	)
}

// Estilos para el email
const main = {
	backgroundColor: "#f6f9fc",
	fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "20px 0 48px",
	marginBottom: "64px",
	maxWidth: "600px",
}

const section = {
	padding: "0 48px",
}

const heading = {
	fontSize: "32px",
	fontWeight: "300",
	textAlign: "center" as const,
	margin: "30px 0",
	padding: "0",
	color: "#0046b8",
}

const paragraph = {
	fontSize: "16px",
	lineHeight: "26px",
}

const button = {
	backgroundColor: "#0046b8",
	borderRadius: "4px",
	color: "#fff",
	fontSize: "16px",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "block",
	width: "100%",
	padding: "12px 0",
}

const footer = {
	color: "#8898aa",
	fontSize: "12px",
	textAlign: "center" as const,
	marginTop: "28px",
	paddingLeft: "48px",
	paddingRight: "48px",
}
