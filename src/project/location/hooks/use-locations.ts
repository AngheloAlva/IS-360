import { useQuery } from "@tanstack/react-query"

export interface WorkLocation {
	id: string
	name: string
	parentId: string | null
	path: string
	equipmentCount: number
}

export async function fetchAllLocations(): Promise<WorkLocation[]> {
	const res = await fetch("/api/locations")
	if (!res.ok) throw new Error("Error fetching locations")
	return res.json()
}

export function useLocations() {
	return useQuery<WorkLocation[]>({
		queryKey: ["locations"],
		queryFn: fetchAllLocations,
	})
}
