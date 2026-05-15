/* eslint-disable jsx-a11y/alt-text */
"use client"

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import type { LockoutPermitData } from "@/app/api/lockout-permit/pdf/[id]/types"

const styles = StyleSheet.create({
	page: {
		padding: 20,
		fontSize: 8,
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
		borderBottomColor: "#3B82F6", // Azul moderno
		paddingBottom: 12,
	},
	logo: {
		width: 50,
		height: 50,
		objectFit: "contain",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#1E3A8A", // Azul oscuro
		marginLeft: 15,
	},
	identificationSection: {
		border: "1px solid #000",
		marginBottom: 6,
	},
	identRow: {
		flexDirection: "row",
		borderBottom: "1px solid #000",
	},
	identCell: {
		padding: 4,
		borderRight: "1px solid #000",
		flex: 1,
	},
	identCellLast: {
		padding: 4,
		flex: 1,
	},
	identLabel: {
		fontSize: 7,
		fontWeight: "bold",
		marginBottom: 2,
	},
	identValue: {
		fontSize: 8,
		minHeight: 12,
	},
	sectionTitle: {
		fontSize: 9,
		fontWeight: "bold",
		padding: 4,
		backgroundColor: "#f0f0f0",
		borderBottom: "1px solid #000",
		textAlign: "center",
	},
	checkboxRow: {
		flexDirection: "row",
		gap: 8,
		marginTop: 2,
	},
	checkbox: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
	},
	checkboxSquare: {
		width: 10,
		height: 10,
		border: "1px solid #000",
		justifyContent: "center",
		alignItems: "center",
	},
	checkboxChecked: {
		fontSize: 10,
		fontWeight: "bold",
	},
	checkboxLabel: {
		fontSize: 7,
	},

	descriptionSection: {
		border: "1px solid #000",
		marginBottom: 8,
	},
	descriptionHeader: {
		padding: 4,
		backgroundColor: "#f0f0f0",
		fontSize: 7,
		fontWeight: "bold",
		borderBottom: "1px solid #000",
	},
	descriptionContent: {
		padding: 6,
		minHeight: 50,
		fontSize: 8,
		lineHeight: 1.4,
	},

	tableTitle: {
		fontSize: 9,
		fontWeight: "bold",
		textAlign: "center",
		backgroundColor: "#f0f0f0",
		padding: 4,
		border: "1px solid #000",
		marginBottom: 0,
	},
	table: {
		border: "1px solid #000",
		borderTop: "none",
		marginBottom: 6,
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#f0f0f0",
		borderBottom: "1px solid #000",
		fontSize: 6,
		fontWeight: "bold",
	},
	tableRow: {
		flexDirection: "row",
		borderBottom: "1px solid #000",
		minHeight: 18,
	},
	tableCell: {
		padding: 2,
		borderRight: "1px solid #000",
		justifyContent: "center",
		alignItems: "center",
		fontSize: 7,
	},
	tableCellLast: {
		padding: 2,
		justifyContent: "center",
		alignItems: "center",
		fontSize: 7,
	},
	colN: { width: "5%" },
	colNombre: { width: "20%" },
	colRun: { width: "12%" },
	colCandado: { width: "10%" },
	colInstalacion: { width: "26.5%" },
	colRetiro: { width: "26.5%" },
	colSubCell: { flex: 1 },
	subHeaderGroup: {
		flexDirection: "row",
		flex: 1,
		borderRight: "1px solid #000",
	},
	subHeader: {
		flex: 1,
		padding: 2,
		borderRight: "1px solid #000",
		textAlign: "center",
		fontSize: 6,
	},
	subHeaderLast: {
		flex: 1,
		padding: 2,
		textAlign: "center",
		fontSize: 6,
	},

	signaturesSection: {
		border: "1px solid #000",
		marginBottom: 6,
	},
	noteText: {
		fontSize: 6,
		padding: 4,
		borderBottom: "1px solid #000",
		textAlign: "center",
		fontStyle: "italic",
	},
	signaturesRow: {
		flexDirection: "row",
		borderBottom: "1px solid #000",
	},
	signatureCell: {
		padding: 4,
		borderRight: "1px solid #000",
		flex: 1,
	},
	signatureCellLast: {
		padding: 4,
		flex: 1,
	},
	signatureLabel: {
		fontSize: 6,
		fontWeight: "bold",
		marginBottom: 2,
	},
	signatureField: {
		minHeight: 25,
		borderBottom: "1px solid #000",
		marginTop: 2,
	},
	approvalRow: {
		flexDirection: "row",
		gap: 8,
		marginTop: 2,
	},
	approvalOption: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
	},

	maneuversSection: {
		border: "1px solid #000",
	},
	maneuversTitle: {
		fontSize: 9,
		fontWeight: "bold",
		textAlign: "center",
		backgroundColor: "#f0f0f0",
		padding: 4,
		borderBottom: "1px solid #000",
	},
	maneuversTable: {
		borderBottom: "1px solid #000",
	},
	maneuversRow: {
		flexDirection: "row",
		borderBottom: "1px solid #000",
		minHeight: 18,
	},
	maneuversCell: {
		padding: 3,
		borderRight: "1px solid #000",
		fontSize: 7,
		justifyContent: "center",
		alignItems: "flex-start",
	},
	maneuversCellLast: {
		padding: 3,
		fontSize: 7,
		justifyContent: "center",
		alignItems: "flex-start",
	},

	footerSection: {
		border: "1px solid #000",
	},
	footerRow: {
		flexDirection: "row",
		borderBottom: "1px solid #000",
	},
	footerCell: {
		padding: 6,
		borderRight: "1px solid #000",
		flex: 1,
	},
	footerCellLast: {
		padding: 6,
		flex: 1,
	},
	footerLabel: {
		fontSize: 7,
		fontWeight: "bold",
		marginBottom: 15,
	},
	footerNote: {
		backgroundColor: "#000",
		color: "#fff",
		padding: 4,
		fontSize: 6,
		textAlign: "center",
		fontWeight: "bold",
	},
})

interface LockoutPermitPDFProps {
	data: LockoutPermitData
}

export default function LockoutPermitPDF({ data }: LockoutPermitPDFProps) {
	if (!data) {
		return (
			<Document>
				<Page size="LETTER" style={styles.page}>
					<Text>Error: No se pudieron cargar los datos del permiso</Text>
				</Page>
			</Document>
		)
	}

	const lockoutTypeLabels: Record<string, string> = {
		PREVENTIVE: "PREVENTIVO",
		CORRECTIVE: "CORRECTIVO",
		EMERGENCY: "EMERGENCIA",
		OTHER: "OTRO",
	}

	const registrationRows = [...(data.lockoutRegistrations || [])]
	const emptyRowsNeeded = Math.max(5, 10 - registrationRows.length)
	for (let i = 0; i < emptyRowsNeeded; i++) {
		registrationRows.push({
			id: `empty-${i}`,
			name: "",
			rut: "",
			contractorLockNumber: "",
			contractorInstallDate: null,
			contractorInstallTime: "",
			contractorRemoveDate: null,
			contractorRemoveTime: "",
			order: registrationRows.length + 1,
		})
	}

	const maneuverRows = [...(data.zeroEnergyReviews || [])]
	const emptyManeuverRows = Math.max(3, 5 - maneuverRows.length)
	for (let i = 0; i < emptyManeuverRows; i++) {
		maneuverRows.push({
			id: `empty-${i}`,
			equipment: { name: "", tag: "" },
			location: "",
			action: "",
			performedBy: { name: "", rut: "" },
			reviewedZero: null,
		})
	}

	return (
		<Document>
			<Page size="LETTER" style={styles.page}>
				<View style={styles.header}>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Image style={styles.logo} src="https://is360.cl/logo.png" />
						<Text style={styles.headerTitle}>PERMISO DE BLOQUEO</Text>
					</View>
					<View>
						<Text>
							Fecha de inicio: {format(new Date(data.startDate), "dd/MM/yyyy", { locale: es })}
						</Text>
						<Text>
							Fecha de fin: {format(new Date(data.endDate), "dd/MM/yyyy", { locale: es })}
						</Text>
					</View>
				</View>

				<View style={styles.identificationSection}>
					<View style={styles.sectionTitle}>
						<Text>IDENTIFICACIÓN</Text>
					</View>

					<View style={styles.identRow}>
						<View style={[styles.identCell, { flex: 2 }]}>
							<Text style={styles.identLabel}>EMPRESA COLABORADORA/MANTENCIÓN OTC:</Text>
							<Text style={styles.identValue}>{data.company?.name || ""}</Text>
						</View>
						<View style={styles.identCellLast}>
							<Text style={styles.identLabel}>NOMBRE DEL RESPONSABLE DEL ÁREA:</Text>
							<Text style={styles.identValue}>{data.areaResponsible?.name || ""}</Text>
						</View>
					</View>

					<View style={styles.identRow}>
						<View style={[styles.identCell, { flex: 2 }]}>
							<Text style={styles.identLabel}>EQUIPO, SISTEMA O TIPO DE ENERGÍA:</Text>
							<Text style={styles.identValue}>
								{data.equipments?.map((eq) => eq.name).join(", ") || ""}
							</Text>
						</View>
						<View style={styles.identCellLast}>
							<Text style={styles.identLabel}>N° / TAG EQUIPO / SISTEMA:</Text>
							<Text style={styles.identValue}>
								{data.equipments?.map((eq) => eq.tag).join(", ") || ""}
							</Text>
						</View>
					</View>

					<View style={[styles.identRow, { borderBottom: "none" }]}>
						<View style={[styles.identCell, { flex: 2 }]}>
							<View style={styles.checkboxRow}>
								{Object.entries(lockoutTypeLabels).map(([key, label]) => (
									<View key={key} style={styles.checkbox}>
										<View style={styles.checkboxSquare}>
											{data.lockoutType === key && <Text style={styles.checkboxChecked}>|</Text>}
										</View>
										<Text style={styles.checkboxLabel}>{label}</Text>
									</View>
								))}
							</View>
						</View>
						<View style={styles.identCellLast}>
							<Text style={styles.identLabel}>NOMBRE SOLICITANTE BLOQUEÓ:</Text>
							<Text style={styles.identValue}>{data.requestedBy?.name || ""}</Text>
						</View>
					</View>

					<View style={[styles.identRow, { borderTop: "1px solid #000", borderBottom: "none" }]}>
						<View style={[styles.identCell, { flex: 2 }]}>
							<Text style={styles.identValue}>
								{data.lockoutType === "OTHER" && data.lockoutTypeOther
									? `Otro: ${data.lockoutTypeOther}`
									: ""}
							</Text>
						</View>
						<View style={styles.identCellLast}>
							<View style={{ flexDirection: "row", gap: 8 }}>
								<View style={{ flex: 1 }}>
									<Text style={styles.identLabel}>DESDE:</Text>
									<Text style={styles.identValue}>
										{format(new Date(data.startDate), "dd/MM/yyyy", { locale: es })}
									</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.identLabel}>HASTA:</Text>
									<Text style={styles.identValue}>
										{data.endDate
											? format(new Date(data.endDate), "dd/MM/yyyy", { locale: es })
											: ""}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>

				<View style={styles.identificationSection}>
					<View style={styles.sectionTitle}>
						<Text>DESCRIPCIÓN</Text>
					</View>
					<View style={styles.identRow}>
						<View style={{ flex: 1, borderBottom: "none" }}>
							<View style={[styles.descriptionHeader, { borderBottom: "1px solid #000" }]}>
								<Text>ACTIVIDAD A EJECUTAR:</Text>
							</View>
							<View style={styles.descriptionContent}>
								{data.activitiesToExecute?.map((activity, idx) => (
									<Text key={idx}>
										{idx + 1}. {activity}
									</Text>
								))}
							</View>
						</View>
					</View>
				</View>

				<Text style={styles.tableTitle}>REGISTRO DEL BLOQUEO Y ETIQUETADO</Text>
				<View style={styles.table}>
					<View style={styles.tableHeader}>
						<View style={[styles.tableCell, styles.colN]}>
							<Text>N°</Text>
						</View>
						<View style={[styles.tableCell, styles.colNombre]}>
							<Text>NOMBRE</Text>
						</View>
						<View style={[styles.tableCell, styles.colRun]}>
							<Text>RUN</Text>
						</View>
						<View style={[styles.tableCell, styles.colCandado]}>
							<Text>N° CANDADO</Text>
						</View>
						<View style={[styles.tableCell, styles.colInstalacion]}>
							<Text>INSTALACIÓN</Text>
						</View>
						<View style={[styles.tableCellLast, styles.colRetiro]}>
							<Text>RETIRO</Text>
						</View>
					</View>

					<View style={[styles.tableHeader, { backgroundColor: "#fff" }]}>
						<View style={[styles.tableCell, styles.colN]}></View>
						<View style={[styles.tableCell, styles.colNombre]}></View>
						<View style={[styles.tableCell, styles.colRun]}></View>
						<View style={[styles.tableCell, styles.colCandado]}></View>
						<View style={[styles.subHeaderGroup, styles.colInstalacion]}>
							<View style={[styles.subHeader, styles.colSubCell]}>
								<Text>FECHA</Text>
							</View>
							<View style={[styles.subHeader, styles.colSubCell]}>
								<Text>HORA</Text>
							</View>
							<View style={[styles.subHeaderLast, styles.colSubCell]}>
								<Text>FIRMA</Text>
							</View>
						</View>
						<View style={[styles.subHeaderGroup, styles.colRetiro, { borderRight: "none" }]}>
							<View style={[styles.subHeader, styles.colSubCell]}>
								<Text>FECHA</Text>
							</View>
							<View style={[styles.subHeader, styles.colSubCell]}>
								<Text>HORA</Text>
							</View>
							<View style={[styles.subHeaderLast, styles.colSubCell]}>
								<Text>FIRMA</Text>
							</View>
						</View>
					</View>

					{registrationRows.map((reg, idx) => (
						<View
							key={reg.id}
							style={[
								styles.tableRow,
								idx === registrationRows.length - 1 ? { borderBottom: "none" } : {},
							]}
						>
							<View style={[styles.tableCell, styles.colN]}>
								<Text>{String(idx + 1).padStart(2, "0")}</Text>
							</View>
							<View style={[styles.tableCell, styles.colNombre, { alignItems: "flex-start" }]}>
								<Text>{reg.name || ""}</Text>
							</View>
							<View style={[styles.tableCell, styles.colRun]}>
								<Text>{reg.rut || ""}</Text>
							</View>
							<View style={[styles.tableCell, styles.colCandado]}>
								<Text>{reg.contractorLockNumber || ""}</Text>
							</View>
							<View style={[styles.subHeaderGroup, styles.colInstalacion]}>
								<View
									style={[styles.tableCell, styles.colSubCell, { borderRight: "1px solid #000" }]}
								>
									<Text>
										{reg.contractorInstallDate
											? format(new Date(reg.contractorInstallDate), "dd/MM/yy")
											: ""}
									</Text>
								</View>
								<View
									style={[styles.tableCell, styles.colSubCell, { borderRight: "1px solid #000" }]}
								>
									<Text>{reg.contractorInstallTime || ""}</Text>
								</View>
								<View style={[styles.tableCellLast, styles.colSubCell]}></View>
							</View>
							<View style={[styles.subHeaderGroup, styles.colRetiro, { borderRight: "none" }]}>
								<View
									style={[styles.tableCell, styles.colSubCell, { borderRight: "1px solid #000" }]}
								>
									<Text>
										{reg.contractorRemoveDate
											? format(new Date(reg.contractorRemoveDate), "dd/MM/yy")
											: ""}
									</Text>
								</View>
								<View
									style={[styles.tableCell, styles.colSubCell, { borderRight: "1px solid #000" }]}
								>
									<Text>{reg.contractorRemoveTime || ""}</Text>
								</View>
								<View style={[styles.tableCellLast, styles.colSubCell]}></View>
							</View>
						</View>
					))}
				</View>

				<View style={styles.maneuversSection}>
					<View style={styles.sectionTitle}>
						<Text>MANIOBRAS DE REVISIÓN ENERGÍA CERO (0)</Text>
					</View>

					<View style={{ flex: 1 }}>
						<View style={styles.maneuversTable}>
							<View style={[styles.tableHeader, { borderBottom: "1px solid #000" }]}>
								<View style={[styles.maneuversCell, { flex: 2 }]}>
									<Text>EQUIPO</Text>
								</View>
								<View style={[styles.maneuversCell, { flex: 2 }]}>
									<Text>UBICACIÓN</Text>
								</View>
								<View style={[styles.maneuversCell, { flex: 2 }]}>
									<Text>ACCIÓN</Text>
								</View>
								<View style={[styles.maneuversCell, { flex: 2 }]}>
									<Text>REALIZADO POR:</Text>
								</View>
								<View style={[styles.maneuversCellLast, { flex: 1.5 }]}>
									<Text>REVISA ENERGÍA 0: SI | NO </Text>
								</View>
							</View>

							{maneuverRows.map((maneuver, idx) => (
								<View
									key={maneuver.id}
									style={[
										styles.maneuversRow,
										idx === maneuverRows.length - 1 ? { borderBottom: "none" } : {},
									]}
								>
									<View style={[styles.maneuversCell, { flex: 2 }]}>
										<Text style={{ textAlign: "left" }}>{maneuver.equipment?.name || ""}</Text>
									</View>
									<View style={[styles.maneuversCell, { flex: 2 }]}>
										<Text style={{ textAlign: "left" }}>{maneuver.location || ""}</Text>
									</View>
									<View style={[styles.maneuversCell, { flex: 2 }]}>
										<Text style={{ textAlign: "left" }}>{maneuver.action || ""}</Text>
									</View>
									<View style={[styles.maneuversCell, { flex: 2 }]}>
										<Text style={{ textAlign: "left" }}>{maneuver.performedBy?.name || ""}</Text>
									</View>
									<View style={[styles.maneuversCellLast, { flex: 1.5 }]}></View>
								</View>
							))}

							<View style={{ padding: 4, minHeight: 30 }}>
								<Text style={styles.signatureLabel}>(nombre y firma):</Text>
							</View>
						</View>
					</View>
				</View>

				<View style={styles.signaturesSection} break>
					<Text style={styles.noteText}>
						SUPERVISOR RESPONSABLE DE LA ACTIVIDAD DEBERÁ ESPERAR LA AUTORIZACIÓN DEL OPERADOR
						RESPONSABLE DE OTC (PERMISO DE INICIO DE TRABAJO), ANTES DE BLOQUEAR.
					</Text>

					<View style={styles.signaturesRow}>
						<View style={styles.signatureCell}>
							<Text style={[{ ...styles.sectionTitle, fontSize: 7 }]}>
								SUPERVISOR A CARGO DE LA ACTIVIDAD
							</Text>
							<Text style={styles.signatureLabel}>Nombre:</Text>
							<View style={styles.signatureField}></View>
							<Text style={styles.signatureLabel}>Firma:</Text>
							<View style={styles.signatureField}></View>
							<Text style={styles.signatureLabel}>OBSERVACIONES:</Text>
							<View
								style={[{ ...styles.signatureField, borderBottom: "0px" }, { minHeight: 20 }]}
							></View>
						</View>

						<View style={styles.signatureCell}>
							<Text style={[{ ...styles.sectionTitle, fontSize: 7 }]}>
								OPERADOR A CARGO DEL BLOQUEO
							</Text>
							<Text style={styles.signatureLabel}>Nombre:</Text>
							<View style={styles.signatureField}></View>
							<Text style={styles.signatureLabel}>Firma:</Text>
							<View style={styles.signatureField}></View>
							<View style={styles.approvalRow}>
								<Text style={styles.signatureLabel}>APROBADO:</Text>
								<View style={styles.approvalOption}>
									<Text style={styles.checkboxLabel}>SI</Text>
									<View style={styles.checkboxSquare}>
										<Text style={styles.checkboxChecked}>|</Text>
									</View>
								</View>
								<View style={styles.approvalOption}>
									<Text style={styles.checkboxLabel}>NO</Text>
									<View style={styles.checkboxSquare}>
										<Text style={styles.checkboxChecked}>|</Text>
									</View>
								</View>
							</View>
						</View>

						<View style={styles.signatureCellLast}>
							<Text style={styles.signatureLabel}>SUPERVISOR (nombre y firma):</Text>
							<View style={[styles.signatureField, { minHeight: 30 }]}></View>
							<View style={{ marginTop: 6 }}>
								<Text style={styles.signatureLabel}>REVISA RETIRO BLOQUEO: SI [ ] NO [ ]</Text>
							</View>
							<View style={{ marginTop: 6 }}>
								<Text style={styles.signatureLabel}>FECHA APROBACIÓN:</Text>
								<Text style={styles.identValue}></Text>
							</View>
							<View style={{ marginTop: 4 }}>
								<Text style={styles.signatureLabel}>HORA APROBACIÓN:</Text>
								<Text style={styles.identValue}></Text>
							</View>
						</View>
					</View>
				</View>

				<View style={styles.footerSection}>
					<View style={styles.footerRow}>
						<View style={[styles.footerCell, { flex: 1.5 }]}>
							<Text style={styles.footerLabel}>JEFE DE ÁREA A CARGO DE LA ACTIVIDAD OTC</Text>
						</View>
						<View style={[styles.footerCellLast, { flex: 2 }]}>
							<Text style={styles.footerLabel}>Observación:</Text>
							<Text style={styles.identValue}>{data.finalObservations || ""}</Text>
						</View>
					</View>
					<View style={styles.footerNote}>
						<Text>
							TODOS LOS TRABAJADORES QUE INTERVIENEN DEBEN COLOCAR CANDADO Y TARJETA DE BLOQUEO /
							LOS BLOQUEOS Y DESBLOQUEOS SON PERSONALES E INTRANSFERIBLES
						</Text>
					</View>
				</View>
			</Page>
		</Document>
	)
}
