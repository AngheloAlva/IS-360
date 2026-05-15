import Image from "next/image"
import { CheckCircle2Icon, XCircleIcon, ShieldOffIcon } from "lucide-react"

import { ReviewStatus } from "@/generated/prisma/enums"
import { sha256Hex } from "@/project/worker-compliance/lib/token"
import prisma from "@/lib/prisma"

function InvalidToken() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
			<div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border bg-white p-8 text-center shadow-sm">
				<ShieldOffIcon className="size-14 text-gray-300" />
				<div className="flex flex-col gap-1">
					<h1 className="text-xl font-bold text-gray-900">Código no válido</h1>
					<p className="text-sm text-gray-500">
						Este código QR fue revocado o no existe. Solicita uno nuevo.
					</p>
				</div>
			</div>
		</div>
	)
}

export default async function AccreditationPage({
	params,
}: {
	params: Promise<{ token: string }>
}) {
	const { token } = await params
	const tokenHash = sha256Hex(token)

	const record = await prisma.workerQRToken.findFirst({
		where: { tokenHash, revokedAt: null },
		select: {
			worker: {
				select: {
					name: true,
					rut: true,
					accreditationOverride: true,
					company: { select: { name: true } },
					workerFolder: {
						where: {
							status: ReviewStatus.APPROVED,
							startupFolder: { isArchived: false },
						},
						select: { id: true },
						take: 1,
					},
					basicFolder: {
						where: {
							status: ReviewStatus.APPROVED,
							startupFolder: { isArchived: false },
						},
						select: { id: true },
						take: 1,
					},
				},
			},
		},
	})

	if (!record) {
		return <InvalidToken />
	}

	const { worker } = record
	const isAccredited =
		worker.accreditationOverride ??
		(worker.workerFolder.length > 0 || worker.basicFolder.length > 0)

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
			<div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border bg-white p-8 text-center shadow-sm">
				<Image
					src="/logo.png"
					alt="OTC"
					width={72}
					height={72}
					priority
					className="size-16 object-contain"
				/>

				<div className="flex flex-col items-center gap-1">
					<p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
						Verificación de Acreditación
					</p>
				</div>

				<div className="flex flex-col items-center gap-2">
					{worker.company?.name ? (
						<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
							CONTRATISTA: {worker.company.name}
						</p>
					) : null}
					<h1 className="text-2xl font-bold leading-tight text-gray-900">{worker.name}</h1>
					<p className="text-sm text-gray-500">
						RUT: <span className="font-semibold text-gray-700">{worker.rut}</span>
					</p>
				</div>

				{isAccredited ? (
					<div className="flex w-full flex-col items-center gap-3 rounded-xl bg-green-50 py-6">
						<CheckCircle2Icon className="size-16 text-green-600" strokeWidth={1.5} />
						<span className="text-3xl font-black tracking-wide text-green-700">ACTIVO</span>
					</div>
				) : (
					<div className="flex w-full flex-col items-center gap-3 rounded-xl bg-red-50 py-6">
						<XCircleIcon className="size-16 text-red-500" strokeWidth={1.5} />
						<span className="text-3xl font-black tracking-wide text-red-600">INACTIVO</span>
					</div>
				)}

				<p className="text-[11px] text-gray-400">OTC 360 © {new Date().getFullYear()}</p>
			</div>
		</div>
	)
}
