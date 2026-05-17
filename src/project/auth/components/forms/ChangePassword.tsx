import { InfoIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"

export default function ChangePassword() {
	return (
		<Alert>
			<InfoIcon className="size-4" />
			<AlertTitle>No disponible en la demo</AlertTitle>
			<AlertDescription>
				Esta demo usa autenticación simulada (sin contraseñas reales). En el sistema real podrías
				cambiar tu contraseña desde aquí.
			</AlertDescription>
		</Alert>
	)
}
