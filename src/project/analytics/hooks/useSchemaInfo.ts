import { useQuery } from "@tanstack/react-query"

export interface Field {
	id: string
	name: string
	displayName: string
	type: string
	isRequired: boolean
	isPrimary: boolean
	enumValues?: string[]
}

export interface Table {
	id: string
	name: string
	displayName: string
	description?: string
	fields: Field[]
}

export interface Relationship {
	id: string
	sourceTable: string
	sourceField: string
	targetTable: string
	targetField: string
	relationType: "oneToOne" | "oneToMany" | "manyToOne" | "manyToMany"
}

export interface SchemaInfo {
	tables: Table[]
	relationships: Relationship[]
}

export function useSchemaInfo() {
	return useQuery<SchemaInfo>({
		queryKey: ["schemaInfo"],
		queryFn: async () => {
			const response = await fetch("/api/analytics/schema")

			if (!response.ok) {
				throw new Error("Error al obtener información del esquema")
			}

			const data = await response.json()
			return data
		},
	})
}
