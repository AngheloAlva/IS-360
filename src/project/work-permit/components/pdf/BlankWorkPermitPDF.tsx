import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import {
	MutualityOptions,
	WorkWillBeOptions,
	ToolsOptions,
	PreChecksOptions,
	RisksOptions,
	ControlMeasuresOptions,
	WasteTypesOptions,
} from "@/lib/consts/work-permit-options"

// Reutilizar los mismos estilos del componente original
const styles = StyleSheet.create({
	page: {
		padding: 35,
		fontSize: 10,
		backgroundColor: "#fff",
		fontFamily: "Helvetica",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 25,
		borderBottomWidth: 2,
		borderBottomStyle: "solid",
		borderBottomColor: "#3B82F6",
		paddingBottom: 12,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#1E3A8A",
		marginLeft: 15,
	},
	subtitle: {
		fontSize: 13,
		fontWeight: "bold",
		marginTop: 12,
		marginBottom: 6,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#3B82F6",
		paddingBottom: 4,
		color: "#1E3A8A",
	},
	section: {
		marginBottom: 14,
		padding: 8,
		borderRadius: 4,
		backgroundColor: "#F9FAFB",
	},
	row: {
		flexDirection: "row",
		marginBottom: 7,
	},
	column: {
		flex: 1,
		paddingHorizontal: 4,
	},
	label: {
		fontWeight: "bold",
		marginRight: 5,
		color: "#4B5563",
	},
	value: {
		flex: 1,
		color: "#111827",
	},
	customLargeField: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#D1D5DB",
		padding: 6,
		height: 50,
		marginBottom: 6,
		borderRadius: 2,
		backgroundColor: "#F9FAFB",
	},
	customField: {
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#D1D5DB",
		height: 20,
		padding: 6,
		borderRadius: 2,
	},
	signatureBox: {
		height: 80,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#D1D5DB",
		marginTop: 6,
		marginBottom: 6,
		padding: 6,
		borderRadius: 4,
		backgroundColor: "#F9FAFB",
		breakInside: "avoid",
	},
	signatureLabel: {
		textAlign: "center",
		marginTop: 6,
		fontWeight: "medium",
		color: "#4B5563",
		breakInside: "avoid",
	},
	signatureSection: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 35,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
		borderTopStyle: "solid",
		breakInside: "avoid",
	},
	signatureColumn: {
		width: "30%",
		paddingHorizontal: 8,
		breakInside: "avoid",
	},
	footer: {
		position: "absolute",
		bottom: 35,
		left: 35,
		right: 35,
		textAlign: "center",
		fontSize: 8,
		color: "#6B7280",
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
		borderTopStyle: "solid",
		paddingTop: 8,
	},
	logo: {
		width: 50,
		height: 50,
		objectFit: "contain",
	},
	checkBox: {
		width: 14,
		height: 14,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#3B82F6",
		marginRight: 5,
		borderRadius: 2,
	},
	checkBoxRow: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 2,
		width: "48%",
		marginRight: "2%",
	},
	checkBoxContainer: {
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 4,
	},
	table: {
		display: "flex",
		width: "100%",
		borderWidth: 1,
		borderColor: "#D1D5DB",
		marginVertical: 10,
		borderRadius: 4,
		overflow: "hidden",
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderColor: "#D1D5DB",
	},
	tableCol: {
		borderStyle: "solid",
		borderRightWidth: 1,
		borderColor: "#D1D5DB",
		padding: 6,
	},
	tableHeader: {
		backgroundColor: "#EFF6FF",
		color: "#1E3A8A",
		fontWeight: "bold",
		textAlign: "center",
		padding: 6,
	},
	tableCell: {
		padding: 6,
		textAlign: "center",
		color: "#374151",
		height: 25,
	},
	measurementCol: {
		width: "25%",
		height: 35,
		borderStyle: "solid",
		borderRightWidth: 1,
		borderColor: "#D1D5DB",
	},
	lastCol: {
		borderRightWidth: 0,
	},
	participantsTable: {
		display: "flex",
		width: "100%",
		borderWidth: 1,
		borderColor: "#D1D5DB",
		marginTop: 10,
		borderRadius: 4,
		overflow: "hidden",
	},
	participantsCol: {
		flex: 1,
		borderStyle: "solid",
		borderRightWidth: 1,
		borderColor: "#D1D5DB",
	},
})

const BlankWorkPermitPDF = (): React.ReactElement => {
	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Encabezado */}
				<View style={styles.header}>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						{/* eslint-disable-next-line jsx-a11y/alt-text */}
						<Image style={styles.logo} src="https://is360.ingsimple.cl/logo.jpg" />
						<Text style={styles.headerTitle}>PERMISO DE TRABAJO</Text>
					</View>
					<View>
						<Text>Fecha de emisión: </Text>
						<Text>Fecha de vencimiento: </Text>
					</View>
				</View>

				{/* Información del permiso */}
				<View style={styles.section}>
					<Text style={styles.subtitle}>1. INFORMACIÓN GENERAL</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>N° OT: </Text>
							</View>
						</View>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Empresa: </Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Cargo del solicitante: </Text>
							</View>
						</View>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Adm. contrato IS 360: </Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Solicitante: </Text>
							</View>
						</View>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>RUT Solicitante: </Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Fecha inicio OT: </Text>
							</View>
						</View>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Fecha término OT: </Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Mutualidad:</Text>
							<View style={styles.checkBoxContainer}>
								{MutualityOptions.map((option) => (
									<View style={styles.checkBoxRow} key={option.value}>
										<View style={styles.checkBox} />
										<Text>{option.label}</Text>
									</View>
								))}
							</View>
						</View>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Lugar exacto: </Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Otra Mutualidad: </Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Trabajo Requerido: </Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Descripción de Trabajo: </Text>
							</View>
						</View>
					</View>
				</View>

				{/* Detalles del trabajo */}
				<View style={styles.section}>
					<Text style={styles.subtitle}>2. DETALLES DEL TRABAJO</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>El trabajo será:</Text>
							<View style={styles.checkBoxContainer}>
								{WorkWillBeOptions.map((option) => (
									<View style={styles.checkBoxRow} key={option.value}>
										<View style={styles.checkBox} />
										<Text>{option.label}</Text>
									</View>
								))}
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Herramientas y equipos:</Text>
							<View style={styles.checkBoxContainer}>
								{ToolsOptions.map((option) => (
									<View style={styles.checkBoxRow} key={option.value}>
										<View style={styles.checkBox} />
										<Text>{option.label}</Text>
									</View>
								))}
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Verificaciones previas:</Text>
							<View style={styles.checkBoxContainer}>
								{PreChecksOptions.map((option) => (
									<View style={styles.checkBoxRow} key={option.value}>
										<View style={styles.checkBox} />
										<Text>{option.label}</Text>
									</View>
								))}
							</View>
						</View>
					</View>
				</View>

				{/* Análisis de riesgos */}
				<View style={{ ...styles.section, marginBottom: 80 }}>
					<Text style={styles.subtitle}>3. ANÁLISIS DE RIESGOS</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Identificación de riesgos:</Text>
							<View style={styles.checkBoxContainer}>
								{RisksOptions.map((option) => (
									<View style={styles.checkBoxRow} key={option.value}>
										<View style={styles.checkBox} />
										<Text>{option.label}</Text>
									</View>
								))}
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Medidas de control preventivo:</Text>
							<View style={styles.checkBoxContainer}>
								{ControlMeasuresOptions.map((option) => (
									<View style={styles.checkBoxRow} key={option.value}>
										<View style={styles.checkBox} />
										<Text>{option.label}</Text>
									</View>
								))}
							</View>
						</View>
					</View>
				</View>

				{/* Tabla de actividades */}
				<View style={styles.section}>
					<Text style={styles.subtitle}>4. DETALLE DE ACTIVIDADES</Text>

					<View style={styles.table}>
						<View style={styles.tableRow}>
							<View style={[styles.tableCol, styles.tableHeader, { width: "60%" }]}>
								<Text>Descripción de la Actividad</Text>
							</View>
							<View style={[styles.tableCol, styles.tableHeader, { width: "20%" }]}>
								<Text>Hora Inicio</Text>
							</View>
							<View
								style={[styles.tableCol, styles.tableHeader, { width: "20%", borderRightWidth: 0 }]}
							>
								<Text>Hora Fin</Text>
							</View>
						</View>
						{/* Generar 6 filas vacías para actividades */}
						{Array.from({ length: 6 }, (_, index) => (
							<View style={styles.tableRow} key={index}>
								<View style={[styles.tableCol, { width: "60%", height: 40 }]}>
									<Text style={styles.tableCell}></Text>
								</View>
								<View style={[styles.tableCol, { width: "20%", height: 40 }]}>
									<Text style={styles.tableCell}></Text>
								</View>
								<View style={[styles.tableCol, { width: "20%", height: 40, borderRightWidth: 0 }]}>
									<Text style={styles.tableCell}></Text>
								</View>
							</View>
						))}
					</View>
				</View>

				{/* Mediciones ambientales */}
				<View style={styles.section}>
					<Text style={styles.subtitle}>5. MEDICIONES AMBIENTALES</Text>

					<View style={styles.table}>
						<View style={styles.tableRow}>
							<View style={[styles.measurementCol, styles.tableHeader]}>
								<Text>Parámetro</Text>
							</View>
							<View style={[styles.measurementCol, styles.tableHeader]}>
								<Text>Valor medido</Text>
							</View>
							<View style={[styles.measurementCol, styles.tableHeader]}>
								<Text>Límite permitido</Text>
							</View>
							<View style={[styles.measurementCol, styles.tableHeader, styles.lastCol]}>
								<Text>Observaciones</Text>
							</View>
						</View>
						<View style={styles.tableRow}>
							<View style={styles.measurementCol}>
								<Text style={styles.tableCell}>Oxígeno (%)</Text>
							</View>
							<View style={styles.measurementCol}>
								<Text style={styles.tableCell}></Text>
							</View>
							<View style={styles.measurementCol}>
								<Text style={styles.tableCell}></Text>
							</View>
							<View style={[styles.measurementCol, styles.lastCol]}>
								<Text style={styles.tableCell}></Text>
							</View>
						</View>
						<View style={styles.tableRow}>
							<View style={styles.measurementCol}>
								<Text style={styles.tableCell}>LEL (%)</Text>
							</View>
							<View style={styles.measurementCol}>
								<Text style={styles.tableCell}></Text>
							</View>
							<View style={styles.measurementCol}>
								<Text style={styles.tableCell}></Text>
							</View>
							<View style={[styles.measurementCol, styles.lastCol]}>
								<Text style={styles.tableCell}></Text>
							</View>
						</View>
						<View style={styles.tableRow}>
							<View style={styles.measurementCol}>
								<Text style={styles.tableCell}>H2S (ppm)</Text>
							</View>
							<View style={styles.measurementCol}>
								<Text style={styles.tableCell}></Text>
							</View>
							<View style={styles.measurementCol}>
								<Text style={styles.tableCell}></Text>
							</View>
							<View style={[styles.measurementCol, styles.lastCol]}>
								<Text style={styles.tableCell}></Text>
							</View>
						</View>
						<View style={styles.tableRow}>
							<View style={styles.measurementCol}>
								<Text style={styles.tableCell}>CO (ppm)</Text>
							</View>
							<View style={styles.measurementCol}>
								<Text style={styles.tableCell}></Text>
							</View>
							<View style={styles.measurementCol}>
								<Text style={styles.tableCell}></Text>
							</View>
							<View style={[styles.measurementCol, styles.lastCol]}>
								<Text style={styles.tableCell}></Text>
							</View>
						</View>
					</View>
				</View>

				{/* Gestión de residuos */}
				<View style={styles.section}>
					<Text style={styles.subtitle}>6. GESTIÓN DE RESIDUOS</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>¿Se generarán residuos?</Text>
							<View style={styles.row}>
								<View style={styles.checkBox} />
								<Text>Sí</Text>
								<View style={{ width: 20 }} />
								<View style={styles.checkBox} />
								<Text>No</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Tipo de residuos:</Text>
							<View style={styles.checkBoxContainer}>
								{WasteTypesOptions.map((option) => (
									<View style={styles.checkBoxRow} key={option.value}>
										<View style={styles.checkBox} />
										<Text>{option.label}</Text>
									</View>
								))}
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Lugar de disposición: ____</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Información adicional */}
				<View style={styles.section}>
					<Text style={styles.subtitle}>7. INFORMACIÓN ADICIONAL (COMPLETAR MANUALMENTE)</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Quién entrega el área de trabajo:</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>¿Trabajo completado?</Text>
							<View style={styles.row}>
								<View style={styles.checkBox} />
								<Text>Sí</Text>
								<View style={{ width: 20 }} />
								<View style={styles.checkBox} />
								<Text>No</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>¿Área de trabajo limpia y ordenada?</Text>
							<View style={styles.row}>
								<View style={styles.checkBox} />
								<Text>Sí</Text>
								<View style={{ width: 20 }} />
								<View style={styles.checkBox} />
								<Text>No</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Observaciones: </Text>
							</View>
						</View>
					</View>

					{/* Tabla de participantes con 15 espacios vacíos */}
					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Participantes:</Text>

							<View style={styles.participantsTable}>
								<View style={styles.tableRow}>
									<View style={[styles.participantsCol, styles.tableHeader]}>
										<Text>Nombre completo</Text>
									</View>
									<View style={[styles.participantsCol, styles.tableHeader]}>
										<Text>RUT</Text>
									</View>
									<View style={[styles.participantsCol, styles.tableHeader]}>
										<Text>Cargo</Text>
									</View>
									<View style={[styles.participantsCol, styles.tableHeader]}>
										<Text>Empresa</Text>
									</View>
									<View style={[styles.participantsCol, styles.tableHeader, styles.lastCol]}>
										<Text>Firma</Text>
									</View>
								</View>
								{/* Generar 15 filas vacías para participantes */}
								{Array.from({ length: 15 }, (_, index) => (
									<View style={styles.tableRow} key={index}>
										<View style={styles.participantsCol}>
											<Text style={styles.tableCell}></Text>
										</View>
										<View style={styles.participantsCol}>
											<Text style={styles.tableCell}></Text>
										</View>
										<View style={styles.participantsCol}>
											<Text style={styles.tableCell}></Text>
										</View>
										<View style={styles.participantsCol}>
											<Text style={styles.tableCell}></Text>
										</View>
										<View style={[styles.participantsCol, styles.lastCol]}>
											<Text style={styles.tableCell}></Text>
										</View>
									</View>
								))}
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Observaciones adicionales:</Text>
							<View style={[styles.customLargeField]}></View>
						</View>
					</View>
				</View>

				{/* Sección de firmas */}
				<View style={styles.signatureSection}>
					<View style={styles.signatureColumn}>
						<View style={styles.signatureBox}></View>
						<Text style={styles.signatureLabel}>Firma Solicitante</Text>
						<Text style={styles.signatureLabel}>__</Text>
					</View>

					<View style={styles.signatureColumn}>
						<View style={styles.signatureBox}></View>
						<Text style={styles.signatureLabel}>Firma Prevención</Text>
						<Text style={styles.signatureLabel}>Riesgos IS 360</Text>
					</View>

					<View style={styles.signatureColumn}>
						<View style={styles.signatureBox}></View>
						<Text style={styles.signatureLabel}>Firma</Text>
						<Text style={styles.signatureLabel}>Operador IS 360</Text>
					</View>
				</View>

				{/* Footer */}
				<View style={styles.footer}>
					<Text>
						Este documento debe ser impreso y firmado físicamente. Documento generado el{" "}
						{format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
					</Text>
				</View>
			</Page>
		</Document>
	)
}

export default BlankWorkPermitPDF
