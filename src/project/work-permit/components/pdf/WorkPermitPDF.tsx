"use client"
/* eslint-disable jsx-a11y/alt-text */

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import type { WorkPermitData } from "@/app/api/work-permit/pdf/[id]/types"

// Estilos para el PDF
const styles = StyleSheet.create({
	page: {
		padding: 35,
		fontSize: 10,
		backgroundColor: "#fff",
		fontFamily: "Helvetica",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 25,
		borderBottomWidth: 2,
		borderBottomStyle: "solid",
		borderBottomColor: "#3B82F6", // Azul moderno
		paddingBottom: 12,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 18,
		textAlign: "center",
		color: "#1E3A8A", // Azul oscuro
	},
	subtitle: {
		fontSize: 13,
		fontWeight: "bold",
		marginTop: 12,
		marginBottom: 6,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#3B82F6", // Azul moderno
		paddingBottom: 4,
		color: "#1E3A8A", // Azul oscuro
	},
	section: {
		marginBottom: 14,
		padding: 8,
		borderRadius: 4,
		backgroundColor: "#F9FAFB", // Gris muy claro
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
		color: "#4B5563", // Gris medio
	},
	value: {
		flex: 1,
		color: "#111827", // Casi negro
	},
	field: {
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#D1D5DB", // Gris claro
		padding: 6,
		marginBottom: 6,
		borderRadius: 2,
	},
	customLargeField: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#D1D5DB", // Gris claro
		padding: 6,
		height: 38,
		marginBottom: 6,
		borderRadius: 2,
		backgroundColor: "#F9FAFB", // Gris muy claro
	},
	customField: {
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#D1D5DB", // Gris claro
		height: 5,
		padding: 6,
		borderRadius: 2,
	},
	signatureBox: {
		height: 80,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#D1D5DB", // Gris claro
		marginTop: 6,
		marginBottom: 6,
		padding: 6,
		borderRadius: 4,
		backgroundColor: "#F9FAFB", // Gris muy claro
		breakInside: "avoid",
	},
	signatureLabel: {
		textAlign: "center",
		marginTop: 6,
		fontWeight: "medium",
		color: "#4B5563", // Gris medio
		breakInside: "avoid",
	},
	signatureSection: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 35,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB", // Gris muy claro
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
		color: "#6B7280", // Gris medio
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
		borderColor: "#3B82F6", // Azul moderno
		marginRight: 5,
		borderRadius: 2,
	},
	checkBoxChecked: {
		width: 14,
		height: 14,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#3B82F6", // Azul moderno
		backgroundColor: "#3B82F6", // Azul moderno
		marginRight: 5,
		borderRadius: 2,
	},
	checkBoxRow: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 4,
	},
	table: {
		display: "flex",
		width: "100%",
		borderWidth: 1,
		borderColor: "#D1D5DB", // Gris claro
		marginVertical: 10,
		borderRadius: 4,
		overflow: "hidden",
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderColor: "#D1D5DB", // Gris claro
	},
	tableCol: {
		borderStyle: "solid",
		borderRightWidth: 1,
		borderColor: "#D1D5DB", // Gris claro
		padding: 6,
	},
	tableHeader: {
		backgroundColor: "#EFF6FF", // Azul muy claro
		color: "#1E3A8A", // Azul oscuro
		fontWeight: "bold",
		textAlign: "center",
		padding: 6,
	},
	tableCell: {
		padding: 6,
		textAlign: "center",
		color: "#374151", // Gris oscuro
	},
	measurementCol: {
		width: "25%",
		height: 35,
		borderStyle: "solid",
		borderRightWidth: 1,
		borderColor: "#D1D5DB", // Gris claro
	},
	lastCol: {
		borderRightWidth: 0,
	},
	participantsTable: {
		display: "flex",
		width: "100%",
		borderWidth: 1,
		borderColor: "#D1D5DB", // Gris claro
		marginTop: 10,
		borderRadius: 4,
		overflow: "hidden",
	},
	participantsCol: {
		flex: 1,
		borderStyle: "solid",
		borderRightWidth: 1,
		borderColor: "#D1D5DB", // Gris claro
	},
})

interface WorkPermitPDFProps {
	workPermit: WorkPermitData
}

const WorkPermitPDF = ({ workPermit }: WorkPermitPDFProps) => {
	const toolsString = Array.isArray(workPermit.tools)
		? workPermit.tools.join(", ")
		: workPermit.tools
	const preChecksString = Array.isArray(workPermit.preChecks)
		? workPermit.preChecks.join(", ")
		: workPermit.preChecks
	const riskIdentificationString = Array.isArray(workPermit.riskIdentification)
		? workPermit.riskIdentification.join(", ")
		: workPermit.riskIdentification
	const preventiveControlMeasuresString = Array.isArray(workPermit.preventiveControlMeasures)
		? workPermit.preventiveControlMeasures.join(", ")
		: workPermit.preventiveControlMeasures

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Encabezado */}
				<View style={styles.header}>
					<Image
						style={styles.logo}
						src="https://otc360.ingsimple.cl/logo.png"
						source="https://otc360.ingsimple.cl/logo.png"
					/>
					<View>
						<Text>PERMISO DE TRABAJO</Text>
						<Text>Fecha de emisión: {format(new Date(), "dd/MM/yyyy", { locale: es })}</Text>
						<Text>
							Fecha de vencimiento:{" "}
							{format(new Date(workPermit.endDate), "dd/MM/yyyy", { locale: es })}
						</Text>
					</View>
				</View>

				{/* Título */}
				<Text style={styles.title}>PERMISO DE TRABAJO</Text>

				{/* Información del permiso */}
				<View style={styles.section}>
					<Text style={styles.subtitle}>1. INFORMACIÓN GENERAL</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>
									{" "}
									N°
									{workPermit.otNumber.otNumber}
								</Text>
							</View>
						</View>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Empresa:</Text>
								<Text style={styles.value}>{workPermit.company.name}</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Cargo del solicitante:</Text>
								<Text style={styles.value}>{workPermit.user.internalRole || ""}</Text>
							</View>
						</View>

						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Adm. contrato OTC:</Text>
								<View style={styles.value}>
									<Text style={styles.value}>{workPermit.otNumber.responsible.name}</Text>
								</View>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Solicitante:</Text>
								<Text style={styles.value}>{workPermit.user.name}</Text>
							</View>
						</View>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>RUT Solicitante:</Text>
								<Text style={styles.value}>{workPermit.user.rut}</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Fecha inicio:</Text>
								<Text style={styles.value}>
									{format(new Date(workPermit.startDate), "dd/MM/yyyy", { locale: es })}
								</Text>
							</View>
						</View>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Fecha término:</Text>
								<Text style={styles.value}>
									{format(new Date(workPermit.endDate), "dd/MM/yyyy", { locale: es })}
								</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Mutualidad:</Text>
								<Text style={styles.value}>{workPermit.mutuality}</Text>
							</View>
						</View>
						{workPermit.otherMutuality && (
							<View style={styles.column}>
								<View style={styles.row}>
									<Text style={styles.label}>Otra Mutualidad:</Text>
									<Text style={styles.value}>{workPermit.otherMutuality || "N/A"}</Text>
								</View>
							</View>
						)}
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Trabajo:</Text>
								<Text style={styles.value}>
									{workPermit.otNumber.workName || "No especificado"}
								</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Lugar exacto:</Text>
								<Text style={styles.value}>{workPermit.exactPlace}</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Detalles del trabajo */}
				<View style={styles.section}>
					<Text style={styles.subtitle}>2. DETALLES DEL TRABAJO</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Trabajo a realizar:</Text>
								<Text style={styles.value}>{workPermit.workWillBe}</Text>
							</View>
						</View>

						{workPermit.workWillBe === "Otro" && (
							<View style={styles.column}>
								<View style={styles.row}>
									<Text style={styles.label}>Otro tipo:</Text>
									<Text style={styles.value}>{workPermit.workWillBeOther || "N/A"}</Text>
								</View>
							</View>
						)}
					</View>

					{workPermit.workWillBe === "Espacio confinado" ||
					workPermit.workWillBe === "En Caliente" ? (
						<View style={styles.row}>
							<View style={styles.column}>
								<Text style={styles.label}>Medición inicial del área:</Text>

								<View style={styles.table}>
									<View style={styles.tableRow}>
										<View style={[styles.tableCol, styles.tableHeader, styles.measurementCol]}>
											<Text>O2</Text>
										</View>
										<View style={[styles.tableCol, styles.tableHeader, styles.measurementCol]}>
											<Text>LEL</Text>
										</View>
										<View style={[styles.tableCol, styles.tableHeader, styles.measurementCol]}>
											<Text>CO</Text>
										</View>
										<View
											style={[
												styles.tableCol,
												styles.tableHeader,
												styles.measurementCol,
												styles.lastCol,
											]}
										>
											<Text>H2S</Text>
										</View>
									</View>
									<View style={styles.tableRow}>
										<View style={[styles.tableCol, styles.measurementCol, { height: 55 }]}>
											<Text></Text>
										</View>
										<View style={[styles.tableCol, styles.measurementCol, { height: 55 }]}>
											<Text></Text>
										</View>
										<View style={[styles.tableCol, styles.measurementCol, { height: 55 }]}>
											<Text></Text>
										</View>
										<View
											style={[
												styles.tableCol,
												styles.measurementCol,
												styles.lastCol,
												{ height: 55 },
											]}
										>
											<Text></Text>
										</View>
									</View>
								</View>
							</View>
						</View>
					) : null}

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Herramientas:</Text>
								<Text style={styles.value}>{toolsString}</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Otras herramientas:</Text>
								<Text style={styles.value}>{workPermit.otherTools || "N/A"}</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Verificaciones previas */}
				<View style={styles.section}>
					<Text style={styles.subtitle}>3. VERIFICACIONES PREVIAS</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Verificaciones:</Text>
								<Text style={styles.value}>{preChecksString}</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Otras verificaciones:</Text>
								<Text style={styles.value}>{workPermit.otherPreChecks || "N/A"}</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Riesgos y medidas */}
				<View style={styles.section}>
					<Text style={styles.subtitle}>4. RIESGOS Y MEDIDAS PREVENTIVAS</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Riesgos identificados:</Text>
								<Text style={styles.value}>{riskIdentificationString}</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Otros riesgos:</Text>
								<Text style={styles.value}>{workPermit.otherRisk || "N/A"}</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Medidas preventivas:</Text>
								<Text style={styles.value}>{preventiveControlMeasuresString}</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Otras medidas:</Text>
								<Text style={styles.value}>
									{workPermit.otherPreventiveControlMeasures || "N/A"}
								</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Gestión de residuos */}
				<View style={styles.section}>
					<Text style={styles.subtitle}>5. GESTIÓN DE RESIDUOS</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.checkBoxRow}>
								<View style={workPermit.generateWaste ? styles.checkBoxChecked : styles.checkBox} />
								<Text>¿Genera residuos?</Text>
							</View>
						</View>
					</View>

					{workPermit.generateWaste && (
						<>
							<View style={styles.row}>
								<View style={styles.column}>
									<View style={styles.row}>
										<Text style={styles.label}>Tipo de residuos:</Text>
										<Text style={styles.value}>{workPermit.wasteType || "N/A"}</Text>
									</View>
								</View>
							</View>

							<View style={styles.row}>
								<View style={styles.column}>
									<View style={styles.row}>
										<Text style={styles.label}>Lugar de disposición:</Text>
										<Text style={styles.value}>{workPermit.wasteDisposalLocation || "N/A"}</Text>
									</View>
								</View>
							</View>
						</>
					)}
				</View>

				<View style={styles.section}>
					<Text style={styles.subtitle}>6. INFORMACIÓN ADICIONAL (COMPLETAR MANUALMENTE)</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Quién entrega el área de trabajo:</Text>
							<View style={styles.customLargeField}></View>
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
							<Text style={styles.label}>Observaciones:</Text>
							<View style={styles.customLargeField}>{workPermit.observations}</View>
						</View>
					</View>

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
								{Array.isArray(workPermit.participants) &&
									workPermit.participants.map((participant, index) => (
										<View style={styles.tableRow} key={index}>
											<View style={styles.participantsCol}>
												<Text style={styles.tableCell}>{participant.name}</Text>
											</View>
											<View style={styles.participantsCol}>
												<Text style={styles.tableCell}>{participant.rut}</Text>
											</View>
											<View style={styles.participantsCol}>
												<Text style={styles.tableCell}>{participant.internalRole || ""}</Text>
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
						<Text style={styles.signatureLabel}>{workPermit.user.name}</Text>
					</View>

					{workPermit.workWillBe === "Espacio confinado" ||
						(workPermit.workWillBe === "En Caliente" && (
							<View style={styles.signatureColumn}>
								<View style={styles.signatureBox}></View>
								<Text style={styles.signatureLabel}>Firma Prevención</Text>
								<Text style={styles.signatureLabel}>Riesgos OTC</Text>
							</View>
						))}

					<View style={styles.signatureColumn}>
						<View style={styles.signatureBox}></View>
						<Text style={styles.signatureLabel}>Firma</Text>
						<Text style={styles.signatureLabel}>Operador OTC</Text>
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

export default WorkPermitPDF
