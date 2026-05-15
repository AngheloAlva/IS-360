"use client"

import { useState } from "react"
import { Loader2Icon, CheckCircle2, XCircle, Upload } from "lucide-react"
import { toast } from "sonner"

import { uploadAllApprovedIRLCertificates } from "../actions/upload-all-approved-certificates"
import { Button } from "@/shared/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"

export function RetroactiveCertificateUploader() {
	const [isProcessing, setIsProcessing] = useState(false)
	const [result, setResult] = useState<{
		processed: number
		successful: number
		failed: number
		errors: Array<{ userId: string; userName: string; error: string }>
	} | null>(null)

	const handleUpload = async () => {
		if (
			!confirm(
				"¿Estás seguro de que quieres buscar charlas IRL aprobadas con certificados faltantes y subirlos?"
			)
		) {
			return
		}

		setIsProcessing(true)
		setResult(null)

		try {
			const uploadResult = await uploadAllApprovedIRLCertificates()

			if (uploadResult.success) {
				setResult(uploadResult)
				toast.success(
					`Proceso completado: ${uploadResult.successful} exitosos, ${uploadResult.failed} fallidos`
				)
			} else {
				toast.error("Error al procesar certificados")
			}
		} catch (error) {
			console.error("Error:", error)
			toast.error("Error al ejecutar el proceso")
		} finally {
			setIsProcessing(false)
		}
	}

	return (
		<Card className="w-full max-w-2xl">
			<CardHeader>
				<CardTitle>Subida Retroactiva de Certificados IRL</CardTitle>
				<CardDescription>
					Busca trabajadores con charla IRL aprobada que tengan carpetas de arranque sin certificado
					y sube solo los faltantes.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Alert>
					<AlertDescription>
						Esta acción es segura para ejecutar múltiples veces: no duplica certificados IRL y solo
						carga los que faltan en carpetas BASIC y FULL.
					</AlertDescription>
				</Alert>

				<Button onClick={handleUpload} disabled={isProcessing} className="w-full" size="lg">
					{isProcessing ? (
						<>
							<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
							Procesando...
						</>
					) : (
						<>
							<Upload className="mr-2 h-4 w-4" />
							Iniciar Proceso
						</>
					)}
				</Button>

				{result && (
					<div className="mt-6 space-y-4">
						<div className="grid grid-cols-3 gap-4">
							<Card>
								<CardContent className="pt-6 text-center">
									<div className="text-2xl font-bold">{result.processed}</div>
									<div className="text-muted-foreground text-sm">Procesadas</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="pt-6 text-center">
									<div className="flex items-center justify-center gap-2">
										<CheckCircle2 className="h-5 w-5 text-green-500" />
										<div className="text-2xl font-bold text-green-500">{result.successful}</div>
									</div>
									<div className="text-muted-foreground text-sm">Exitosas</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="pt-6 text-center">
									<div className="flex items-center justify-center gap-2">
										<XCircle className="h-5 w-5 text-red-500" />
										<div className="text-2xl font-bold text-red-500">{result.failed}</div>
									</div>
									<div className="text-muted-foreground text-sm">Fallidas</div>
								</CardContent>
							</Card>
						</div>

						{result.errors.length > 0 && (
							<Card className="border-red-500">
								<CardHeader>
									<CardTitle className="text-lg text-red-600">Errores</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{result.errors.map((error, index) => (
											<div key={index} className="text-sm">
												<span className="font-semibold">{error.userName}</span>:{" "}
												<span className="text-muted-foreground">{error.error}</span>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
