import { RetroactiveCertificateUploader } from "@/project/safety-talk/components/RetroactiveCertificateUploader"

export default function RetroactiveCertificatesPage() {
	return (
		<div className="container mx-auto py-10">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Herramientas de Administración</h1>
				<p className="text-muted-foreground mt-2">
					Utilidades para gestión de certificados de charlas de seguridad
				</p>
			</div>
			<RetroactiveCertificateUploader />
		</div>
	)
}
