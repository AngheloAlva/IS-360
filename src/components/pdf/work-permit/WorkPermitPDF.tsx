/* eslint-disable jsx-a11y/alt-text */

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import type { WorkPermitData } from "@/app/api/work-permit/pdf/[id]/types"

// Estilos para el PDF
const styles = StyleSheet.create({
	page: {
		padding: 30,
		fontSize: 10,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#ccc",
		paddingBottom: 10,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 15,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 12,
		fontWeight: "bold",
		marginTop: 10,
		marginBottom: 5,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#ccc",
		paddingBottom: 3,
	},
	section: {
		marginBottom: 10,
	},
	row: {
		flexDirection: "row",
		marginBottom: 5,
	},
	column: {
		flex: 1,
	},
	label: {
		fontWeight: "bold",
		marginRight: 5,
	},
	value: {
		flex: 1,
	},
	field: {
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#ccc",
		padding: 5,
		marginBottom: 5,
	},
	customField: {
		borderBottomWidth: 1,
		borderBottomStyle: "dotted",
		borderBottomColor: "#000",
		padding: 5,
		height: 25,
		marginBottom: 5,
	},
	signatureBox: {
		height: 80,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#000",
		marginTop: 5,
		marginBottom: 5,
		padding: 5,
	},
	signatureLabel: {
		textAlign: "center",
		marginTop: 5,
	},
	signatureSection: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 30,
	},
	signatureColumn: {
		width: "30%",
	},
	footer: {
		position: "absolute",
		bottom: 30,
		left: 30,
		right: 30,
		textAlign: "center",
		fontSize: 8,
		color: "grey",
	},
	logo: {
		width: 100,
		height: 50,
		objectFit: "contain",
	},
	checkBox: {
		width: 12,
		height: 12,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#000",
		marginRight: 5,
	},
	checkBoxChecked: {
		width: 12,
		height: 12,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#000",
		backgroundColor: "#000",
		marginRight: 5,
	},
	checkBoxRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 3,
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
	const participantsString = Array.isArray(workPermit.participants)
		? workPermit.participants.map((participant) => participant.name).join(", ")
		: workPermit.participants

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Encabezado */}
				<View style={styles.header}>
					<Image
						style={styles.logo}
						src="https://otc360.ingsimple.cl/logo.jpeg"
						source="https://otc360.ingsimple.cl/logo.jpeg"
					/>
					<View>
						<Text>PERMISO DE TRABAJO</Text>
						<Text>Fecha de emisión: {format(new Date(), "dd/MM/yyyy", { locale: es })}</Text>
						<Text>
							Fecha de vencimiento: {format(workPermit.endDate, "dd/MM/yyyy", { locale: es })}
						</Text>
						<Text>N° PT: {workPermit.id.substring(0, 8).toUpperCase()}</Text>
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
								<Text style={styles.label}>N°:</Text>
								<Text style={styles.value}>{workPermit.otNumber.otNumber}</Text>
							</View>
						</View>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Trabajo:</Text>
								<Text style={styles.value}>{workPermit.otNumber.workName}</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Empresa:</Text>
								<Text style={styles.value}>{workPermit.company.name}</Text>
							</View>
						</View>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>RUT Empresa:</Text>
								<Text style={styles.value}>{workPermit.company.rut}</Text>
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
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Otra Mutualidad:</Text>
								<Text style={styles.value}>{workPermit.otherMutuality || "N/A"}</Text>
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
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Otro tipo:</Text>
								<Text style={styles.value}>{workPermit.workWillBeOther || "N/A"}</Text>
							</View>
						</View>
					</View>

					{workPermit.workWillBe === "Espacio confinado" ||
					workPermit.workWillBe === "Acceso Limitado" ||
					workPermit.workWillBe === "En Caliente" ? (
						<View style={styles.row}>
							<View style={styles.column}>
								<View style={styles.row}>
									<Text style={styles.label}>Medicion inicial del area:</Text>
									<View style={styles.customField}></View>
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
							<Text style={styles.label}>Quién entrega el área de trabajo (OTP):</Text>
							<View style={styles.customField}></View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Trabajador ejecutor:</Text>
							<View style={styles.customField}></View>
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
							<View style={styles.customField}>{workPermit.observations}</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Participantes:</Text>
							<View style={styles.customField}>{participantsString}</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Observaciones adicionales:</Text>
							<View style={[styles.customField, { height: 50 }]}></View>
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

					<View style={styles.signatureColumn}>
						<View style={styles.signatureBox}></View>
						<Text style={styles.signatureLabel}>Firma Prevención</Text>
						<Text style={styles.signatureLabel}>{"Oficial de prevención"}</Text>
					</View>

					<View style={styles.signatureColumn}>
						<View style={styles.signatureBox}></View>
						<Text style={styles.signatureLabel}>Firma Supervisor</Text>
						<Text style={styles.signatureLabel}>Supervisor autorizado</Text>
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
