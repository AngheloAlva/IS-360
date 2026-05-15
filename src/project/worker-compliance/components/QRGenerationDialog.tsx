"use client"

import {
	QrCodeIcon,
	RefreshCwIcon,
	Trash2Icon,
	PrinterIcon,
	LinkIcon,
	AlertTriangleIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import qrcode from "qrcode"
import { useQueryClient } from "@tanstack/react-query"

import { revokeWorkerQRToken } from "@/project/worker-compliance/actions/revoke-worker-qr-token"
import { useActiveWorkerQRStatus } from "@/project/worker-compliance/hooks/useActiveWorkerQRStatus"
import { useGenerateWorkerQR } from "@/project/worker-compliance/hooks/useGenerateWorkerQR"

import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogTrigger,
	DialogDescription,
} from "@/shared/components/ui/dialog"

interface QRGenerationDialogProps {
	workerId: string
	mode: "admin" | "self"
	workerName?: string
	asMenuItem?: boolean
}

export function QRGenerationDialog({
	workerId,
	mode,
	workerName,
	asMenuItem = false,
}: QRGenerationDialogProps) {
	const [open, setOpen] = useState(false)
	const [qrSvg, setQrSvg] = useState<string | null>(null)
	const [isRevoking, setIsRevoking] = useState(false)

	const queryClient = useQueryClient()
	const statusQuery = useActiveWorkerQRStatus(workerId, open)
	const { mutate: generate, data, isPending, reset } = useGenerateWorkerQR(workerId)

	useEffect(() => {
		if (!data?.url) return

		qrcode
			.toString(data.url, { type: "svg" })
			.then((svg) => setQrSvg(svg))
			.catch(() => setQrSvg(null))
	}, [data?.url])

	const handleOpen = (isOpen: boolean) => {
		setOpen(isOpen)
		if (!isOpen) {
			setQrSvg(null)
			reset()
		}
	}

	const handleGenerate = () => {
		setQrSvg(null)
		generate(undefined, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["worker-qr-status", workerId] })
			},
		})
	}

	const handleRegenerate = () => {
		setQrSvg(null)
		generate(
			{ force: true },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["worker-qr-status", workerId] })
				},
			}
		)
	}

	const handleRevoke = async () => {
		setIsRevoking(true)
		try {
			await revokeWorkerQRToken(workerId)
			setQrSvg(null)
			reset()
			queryClient.invalidateQueries({ queryKey: ["worker-qr-status", workerId] })
			toast.success("QR revocado correctamente")
			setOpen(false)
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Error al revocar el QR")
		} finally {
			setIsRevoking(false)
		}
	}

	const handleCopyLink = () => {
		if (!data?.url) return
		navigator.clipboard.writeText(data.url).then(() => {
			toast.success("Enlace copiado al portapapeles")
		})
	}

	const handlePrint = () => {
		window.print()
	}

	const trigger = asMenuItem ? (
		<span className="hover:bg-accent flex w-full cursor-pointer items-center gap-2 rounded-sm px-1.5 py-0.5 text-sm">
			<QrCodeIcon className="size-4" />
			QR de acreditación
		</span>
	) : (
		<Button variant="outline" size="sm" className="flex items-center gap-2">
			<QrCodeIcon className="size-4" />
			{mode === "self" ? "Mi QR de acreditación" : "QR de acreditación"}
		</Button>
	)

	const hasJustGenerated = Boolean(data?.url)
	const hasActive = statusQuery.data?.hasActive ?? false
	const isCheckingStatus = statusQuery.isLoading

	return (
		<>
			<style>{`
				@media print {
					body * { visibility: hidden !important; }
					.printable-qr,
					.printable-qr * { visibility: visible !important; }
					.printable-qr {
						position: fixed !important;
						top: 0 !important;
						left: 0 !important;
						width: 100% !important;
						display: flex !important;
						flex-direction: column !important;
						align-items: center !important;
						justify-content: center !important;
						gap: 8px !important;
						padding-top: 48px !important;
					}
				}
			`}</style>

			<Dialog open={open} onOpenChange={handleOpen}>
				<DialogTrigger asChild>{trigger}</DialogTrigger>

				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>QR de Acreditación</DialogTitle>
						<DialogDescription>
							{workerName ? `${workerName} · ` : ""}
							El QR es permanente hasta que sea revocado o regenerado.
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col items-center gap-4 py-2">
						{isCheckingStatus && !hasJustGenerated && (
							<div className="text-muted-foreground flex items-center gap-2 text-sm">
								<Spinner />
								Verificando estado del QR...
							</div>
						)}

						{isPending && (
							<div className="text-muted-foreground flex items-center gap-2 text-sm">
								<Spinner />
								Generando QR...
							</div>
						)}

						{hasJustGenerated && qrSvg && (
							<>
								<div className="printable-qr flex w-full flex-col items-center gap-2">
									<div
										className="size-[280px] rounded-lg border border-gray-200 p-2"
										aria-label={`QR de acreditación${workerName ? ` de ${workerName}` : ""}`}
										// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted SVG from qrcode lib
										dangerouslySetInnerHTML={{ __html: qrSvg }}
									/>
									<span className="text-muted-foreground text-xs">
										Acreditación trabajador — OTC 360
									</span>
								</div>

								<div className="flex w-full items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-left">
									<AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
									<p className="text-xs text-amber-800">
										Imprime o copia el enlace ahora. Por motivos de seguridad, este QR
										no podrá volver a visualizarse una vez cerrada esta ventana.
									</p>
								</div>

								<div className="flex flex-wrap justify-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={handleCopyLink}
										className="flex items-center gap-2"
									>
										<LinkIcon className="size-4" />
										Copiar enlace
									</Button>

									<Button
										variant="outline"
										size="sm"
										onClick={handlePrint}
										className="flex items-center gap-2"
									>
										<PrinterIcon className="size-4" />
										Imprimir QR
									</Button>

									{mode === "admin" && (
										<Button
											variant="destructive"
											size="sm"
											disabled={isRevoking}
											onClick={handleRevoke}
											className="flex items-center gap-2"
										>
											{isRevoking ? <Spinner /> : <Trash2Icon className="size-4" />}
											Revocar
										</Button>
									)}
								</div>
							</>
						)}

						{!isCheckingStatus && !isPending && !hasJustGenerated && !hasActive && (
							<div className="flex w-full flex-col items-center gap-3 py-4">
								<p className="text-muted-foreground text-center text-sm">
									Este trabajador aún no tiene un QR de acreditación activo.
								</p>
								<Button
									size="sm"
									onClick={handleGenerate}
									className="flex items-center gap-2"
								>
									<QrCodeIcon className="size-4" />
									Generar QR
								</Button>
							</div>
						)}

						{!isCheckingStatus && !isPending && !hasJustGenerated && hasActive && (
							<div className="flex w-full flex-col items-center gap-3 py-2">
								<div className="flex w-full items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-left">
									<AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-blue-600" />
									<p className="text-xs text-blue-800">
										Ya existe un QR activo emitido anteriormente. Por motivos de
										seguridad no se puede volver a visualizar. Si se perdió el QR
										físico, puedes regenerarlo; el anterior quedará inválido.
									</p>
								</div>

								<div className="flex flex-wrap justify-center gap-2">
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="flex items-center gap-2"
											>
												<RefreshCwIcon className="size-4" />
												Regenerar
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>¿Regenerar el QR?</AlertDialogTitle>
												<AlertDialogDescription>
													El QR actual quedará inválido de forma inmediata. Cualquier
													copia física impresa dejará de funcionar. Esta acción no se
													puede deshacer.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancelar</AlertDialogCancel>
												<AlertDialogAction onClick={handleRegenerate}>
													Sí, regenerar
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>

									{mode === "admin" && (
										<Button
											variant="destructive"
											size="sm"
											disabled={isRevoking}
											onClick={handleRevoke}
											className="flex items-center gap-2"
										>
											{isRevoking ? <Spinner /> : <Trash2Icon className="size-4" />}
											Revocar
										</Button>
									)}
								</div>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
