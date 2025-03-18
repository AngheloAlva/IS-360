import { SecurityItemsTable } from "@/components/security/SecurityItemsTable"

const items = [
	{
		name: "CUESTIONARIO INDUCCIÓN MA",
		description: "Cuestionario de induccion ma",
		href: "/dashboard/charlas-de-seguridad/medio-ambiente",
	},
]

export default function SecurityPage(): React.ReactElement {
	return (
		<>
			<h1 className="text-2xl font-bold">Charlas de seguridad</h1>

			<SecurityItemsTable items={items} />
		</>
	)
}
