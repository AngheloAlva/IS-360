import React from "react"
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { systemUrl } from "@/lib/consts/systemUrl"

const styles = StyleSheet.create({
	page: {
		backgroundColor: "#f8fafc",
		fontFamily: "Helvetica",
		padding: 20,
	},
	frame: {
		border: "2 solid #0f172a",
		backgroundColor: "#ffffff",
		height: "100%",
		width: "100%",
		position: "relative",
		padding: 34,
	},
	topAccent: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 14,
		backgroundColor: "#0f766e",
	},
	watermark: {
		position: "absolute",
		top: "38%",
		left: "35%",
		fontSize: 78,
		color: "#e2e8f0",
		transform: "rotate(-18deg)",
		fontWeight: "bold",
		letterSpacing: 4,
	},
	header: {
		marginTop: 10,
		marginBottom: 24,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	brand: {
		flexDirection: "column",
		gap: 3,
	},
	brandLabel: {
		fontSize: 10,
		letterSpacing: 2,
		color: "#475569",
	},
	title: {
		fontSize: 42,
		fontWeight: "bold",
		color: "#0f172a",
		letterSpacing: 3,
	},
	subtitle: {
		fontSize: 18,
		color: "#0f766e",
		fontWeight: "bold",
		letterSpacing: 1.5,
	},
	logo: {
		width: 138,
		height: 138,
	},
	separator: {
		height: 2,
		backgroundColor: "#cbd5e1",
		marginBottom: 18,
	},
	certText: {
		fontSize: 13,
		color: "#334155",
		marginBottom: 18,
		textAlign: "left",
	},
	name: {
		fontSize: 35,
		fontWeight: "bold",
		color: "#1e3a8a",
		marginBottom: 8,
		paddingBottom: 9,
		borderBottom: "2 solid #bfdbfe",
	},
	description: {
		fontSize: 13,
		color: "#0f172a",
		lineHeight: 1.7,
		marginTop: 14,
		marginBottom: 26,
	},
	scoreBadge: {
		alignSelf: "flex-start",
		border: "1 solid #059669",
		backgroundColor: "#ecfdf5",
		borderRadius: 14,
		paddingVertical: 6,
		paddingHorizontal: 14,
		marginBottom: 24,
	},
	scoreText: {
		fontSize: 12,
		color: "#065f46",
		fontWeight: "bold",
		letterSpacing: 0.6,
	},
	footer: {
		flexDirection: "row",
		justifyContent: "space-between",
		borderTop: "1 solid #e2e8f0",
		paddingTop: 18,
		marginTop: "auto",
	},
	footerItem: {
		flex: 1,
	},
	footerLabel: {
		fontSize: 10,
		color: "#64748b",
		marginBottom: 4,
		letterSpacing: 1,
	},
	footerValue: {
		fontSize: 13,
		color: "#0f172a",
		fontWeight: "bold",
	},
	qrContainer: {
		alignItems: "flex-end",
		justifyContent: "center",
	},
	qrHint: {
		fontSize: 9,
		color: "#64748b",
		marginTop: 4,
	},
	rightContent: {
		width: "100%",
		height: "100%",
	},
})

interface SafetyTalkCertificateProps {
	rut: string
	name: string
	score: number
	expiresAt: Date
	category: string
	completedAt: Date
	companyName: string
}

const getCategoryName = (category: string): string => {
	switch (category) {
		case "VISITOR":
			return "Inducción para visitas planta Hualpén"
		case "VISITOR_TRM":
			return "Inducción para visitas planta El Avellano"
		case "IRL":
			return "Introducción de Riesgos Laborales"
		default:
			return category
	}
}

export function SafetyTalkCertificate({
	rut,
	name,
	score,
	category,
	expiresAt,
	completedAt,
	companyName,
}: SafetyTalkCertificateProps) {
	const categoryName = getCategoryName(category)
	const completedDate = new Date(completedAt).toLocaleDateString("es-CL", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	})
	const expiryDate = new Date(expiresAt).toLocaleDateString("es-CL", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	})

	return (
		<Document>
			<Page size="A4" orientation="landscape" style={styles.page}>
				<View style={styles.frame}>
					<View style={styles.topAccent} />
					<Text style={styles.watermark}>OTC</Text>

					<View style={styles.rightContent}>
						<View style={styles.header}>
							<View style={styles.brand}>
								<Text style={styles.brandLabel}>Oleoducto Trasandino Chile</Text>
								<Text style={styles.title}>CERTIFICADO</Text>
								<Text style={styles.subtitle}>DE APROBACIÓN</Text>
							</View>
							{/* eslint-disable-next-line jsx-a11y/alt-text */}
							<Image src={`${systemUrl}/logo.png`} style={styles.logo} />
						</View>

						<View style={styles.separator} />

						<Text style={styles.certText}>
							El departamento de Medio Ambiente y Seguridad Operacional certifica que:
						</Text>

						<Text style={styles.name}>{name}</Text>

						<Text style={styles.description}>
							con rut {rut} de la empresa {companyName}, ha completado satisfactoriamente la{" "}
							{categoryName} con un puntaje de {score.toFixed(0)}%
						</Text>

						<View style={styles.footer}>
							<View style={styles.footerItem}>
								<Text style={styles.footerLabel}>Fecha de Aprobación</Text>
								<Text style={styles.footerValue}>{completedDate}</Text>
							</View>
							<View style={styles.footerItem}>
								<Text style={styles.footerLabel}>Válido hasta</Text>
								<Text style={styles.footerValue}>{expiryDate}</Text>
							</View>
							<View style={styles.qrContainer}>
								<Text style={styles.footerLabel}>Documento oficial OTC</Text>
								<Text style={styles.qrHint}>Emitido digitalmente</Text>
							</View>
						</View>
					</View>
				</View>
			</Page>
		</Document>
	)
}
