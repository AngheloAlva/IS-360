import { InfoIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"

export default function Activate2FA() {
	return (
		<Alert>
			<InfoIcon className="size-4" />
			<AlertTitle>No disponible en la demo</AlertTitle>
			<AlertDescription>
				La autenticación de dos factores está deshabilitada en la demo. En el sistema real podrías
				activarla aquí para proteger tu cuenta.
			</AlertDescription>
		</Alert>
	)
}
