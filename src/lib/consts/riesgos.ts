export interface Riesgo {
	id: string
	label: string
	hasSpecification?: boolean
}

export const RIESGOS: Riesgo[] = [
	{ id: "R01", label: "Incendio" },
	{ id: "R02", label: "Explosión" },
	{ id: "R03", label: "Fuga de hidrocarburos" },
	{ id: "R04", label: "Intoxicación / inhalación de gases" },
	{ id: "R05", label: "Asfixia" },
	{ id: "R06", label: "Quemaduras" },
	{ id: "R07", label: "Electrocución" },
	{ id: "R08", label: "Arco eléctrico" },
	{ id: "R09", label: "Atrapamiento" },
	{ id: "R10", label: "Aplastamiento" },
	{ id: "R11", label: "Golpes por / contra objetos" },
	{ id: "R12", label: "Proyección de partículas" },
	{ id: "R13", label: "Cortes / laceraciones" },
	{ id: "R14", label: "Caída al mismo nivel" },
	{ id: "R15", label: "Caída a distinto nivel" },
	{ id: "R16", label: "Colisión vehicular" },
	{ id: "R17", label: "Atropello" },
	{ id: "R18", label: "Vuelco de maquinaria" },
	{ id: "R19", label: "Caída de objetos" },
	{ id: "R20", label: "Sobreesfuerzo / lesión musculoesquelética" },
	{ id: "R21", label: "Contacto con sustancias peligrosas" },
	{ id: "R22", label: "Irritación (piel, ojos, vías respiratorias)" },
	{ id: "R23", label: "Contaminación ambiental" },
	{ id: "R24", label: "Daño a infraestructura crítica (oleoducto)" },
	{ id: "R25", label: "Derrumbe / sepultamiento (excavaciones)" },
	{ id: "R26", label: "Exposición a ruido (daño auditivo)" },
	{ id: "R27", label: "Golpe de calor / deshidratación" },
	{ id: "R28", label: "Hipotermia" },
	{ id: "R29", label: "Picaduras / mordeduras" },
	{ id: "R30", label: "Pérdida de control operacional" },
	{ id: "R31", label: "Emergencia mayor (daño a personas, instalación y medio ambiente)" },
	{ id: "R32", label: "Otra", hasSpecification: true },
]

export const RIESGO_OTRA_ID = "R32"

export const RiesgosOptions: { value: string; label: string }[] = RIESGOS.map((r) => ({
	value: r.id,
	label: r.label,
}))

export const RIESGOS_MAP = new Map(RIESGOS.map((r) => [r.id, r.label]))

export function getRiesgoLabel(id: string): string {
	return RIESGOS_MAP.get(id) ?? id
}
