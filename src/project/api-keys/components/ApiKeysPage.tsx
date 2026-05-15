"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import {
	BookOpenIcon,
	CopyIcon,
	EllipsisIcon,
	KeyIcon,
	Loader2Icon,
	PlusIcon,
	ShieldAlertIcon,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiKey {
	id: string
	name: string
	keyPrefix: string
	isActive: boolean
	expiresAt: string | null
	lastUsedAt: string | null
	requestCount: number
	createdAt: string
	createdBy: { name: string } | null
}

type KeyAction = "revoke" | "activate" | "renew"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatus(key: ApiKey): "active" | "revoked" | "expired" {
	if (!key.isActive) return "revoked"
	if (key.expiresAt && new Date(key.expiresAt) < new Date()) return "expired"
	return "active"
}

function StatusBadge({ status }: { status: ReturnType<typeof getStatus> }) {
	switch (status) {
		case "active":
			return <Badge className="bg-emerald-600 text-white">Activa</Badge>
		case "revoked":
			return <Badge className="bg-red-600 text-white">Revocada</Badge>
		case "expired":
			return <Badge className="bg-yellow-600 text-white">Expirada</Badge>
	}
}

function formatDate(date: string | null): string {
	if (!date) return "-"
	return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es })
}

function formatRelative(date: string | null): string {
	if (!date) return "Nunca"
	return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ApiKeysPage() {
	const queryClient = useQueryClient()

	const [showCreateDialog, setShowCreateDialog] = useState(false)
	const [showKeyDialog, setShowKeyDialog] = useState(false)
	const [revealedKey, setRevealedKey] = useState("")

	const [confirmAction, setConfirmAction] = useState<{
		type: "revoke" | "delete" | "renew"
		keyId: string
		keyName: string
	} | null>(null)

	const [actionLoading, setActionLoading] = useState(false)

	const { data, isLoading, isError } = useQuery<{ data: ApiKey[] }>({
		queryKey: ["admin-api-keys"],
		queryFn: async () => {
			const res = await fetch("/api/v1/admin/api-keys")
			if (!res.ok) throw new Error("Error al obtener las API keys")
			return res.json()
		},
	})

	const apiKeys = data?.data ?? []

	// ---- Mutations (manual fetch to keep it simple) ----

	async function handlePatchAction(keyId: string, action: KeyAction) {
		setActionLoading(true)
		try {
			const res = await fetch(`/api/v1/admin/api-keys/${keyId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action }),
			})

			if (!res.ok) {
				const err = await res.json().catch(() => null)
				throw new Error(err?.error ?? "Error al ejecutar la acción")
			}

			const result = await res.json()

			if (action === "renew" && result.key) {
				setRevealedKey(result.key)
				setShowKeyDialog(true)
			}

			toast.success(result.message ?? "Acción completada")
   void queryClient.invalidateQueries({ queryKey: ["admin-api-keys"] })
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error inesperado")
		} finally {
			setActionLoading(false)
			setConfirmAction(null)
		}
	}

	async function handleDelete(keyId: string) {
		setActionLoading(true)
		try {
			const res = await fetch(`/api/v1/admin/api-keys/${keyId}`, {
				method: "DELETE",
			})

			if (!res.ok) {
				const err = await res.json().catch(() => null)
				throw new Error(err?.error ?? "Error al eliminar")
			}

			toast.success("API key eliminada")
   void queryClient.invalidateQueries({ queryKey: ["admin-api-keys"] })
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error inesperado")
		} finally {
			setActionLoading(false)
			setConfirmAction(null)
		}
	}

	function onConfirmAction() {
		if (!confirmAction) return
		if (confirmAction.type === "delete") {
   void handleDelete(confirmAction.keyId)
		} else {
   void handlePatchAction(confirmAction.keyId, confirmAction.type)
		}
	}

	// ---- Copy key to clipboard ----

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text)
			toast.success("Key copiada al portapapeles")
		} catch {
			toast.error("No se pudo copiar")
		}
	}

	// ---- Render ----

	return (
		<div className="space-y-4">
			{/* Header actions */}
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Claves registradas</h2>
				<div className="flex items-center gap-2">
					<Button variant="outline" asChild>
						<a href="/admin/dashboard/api-keys/documentacion">
							<BookOpenIcon className="size-4" />
							Documentación
						</a>
					</Button>
					<Button onClick={() => setShowCreateDialog(true)}>
						<PlusIcon className="size-4" />
						Nueva API Key
					</Button>
				</div>
			</div>

			{/* Table */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2Icon className="text-muted-foreground size-6 animate-spin" />
				</div>
			) : isError ? (
				<div className="text-muted-foreground py-12 text-center text-sm">
					Error al cargar las API keys
				</div>
			) : (
				<Table className="bg-background rounded-lg">
					<TableHeader>
						<TableRow>
							<TableHead>Nombre</TableHead>
							<TableHead>Prefijo</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead>Requests</TableHead>
							<TableHead>Último uso</TableHead>
							<TableHead>Expira</TableHead>
							<TableHead>Creada</TableHead>
							<TableHead>Creado por</TableHead>
							<TableHead className="w-10" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{apiKeys.length === 0 && (
							<TableRow>
								<TableCell colSpan={9} className="py-8 text-center text-gray-500">
									No hay API keys registradas
								</TableCell>
							</TableRow>
						)}
						{apiKeys.map((key) => {
							const status = getStatus(key)
							return (
								<TableRow key={key.id}>
									<TableCell className="font-medium">{key.name}</TableCell>
									<TableCell>
										<code className="bg-muted rounded px-1.5 py-0.5 text-xs">
											{key.keyPrefix}...
										</code>
									</TableCell>
									<TableCell>
										<StatusBadge status={status} />
									</TableCell>
									<TableCell>{key.requestCount.toLocaleString("es-CL")}</TableCell>
									<TableCell>{formatRelative(key.lastUsedAt)}</TableCell>
									<TableCell>
										{key.expiresAt ? formatDate(key.expiresAt) : "Sin expiración"}
									</TableCell>
									<TableCell>{formatDate(key.createdAt)}</TableCell>
									<TableCell>{key.createdBy?.name ?? "-"}</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon-sm">
													<EllipsisIcon className="size-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												{status === "active" && (
													<DropdownMenuItem
														onClick={() =>
															setConfirmAction({
																type: "revoke",
																keyId: key.id,
																keyName: key.name,
															})
														}
													>
														Revocar
													</DropdownMenuItem>
												)}
												{status !== "active" && (
													<DropdownMenuItem onClick={() => handlePatchAction(key.id, "activate")}>
														Activar
													</DropdownMenuItem>
												)}
												<DropdownMenuItem
													onClick={() =>
														setConfirmAction({
															type: "renew",
															keyId: key.id,
															keyName: key.name,
														})
													}
												>
													Renovar
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													variant="destructive"
													onClick={() =>
														setConfirmAction({
															type: "delete",
															keyId: key.id,
															keyName: key.name,
														})
													}
												>
													Eliminar
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			)}

			{/* Confirm action AlertDialog */}
			<AlertDialog
				open={confirmAction !== null}
				onOpenChange={(open) => {
					if (!open) setConfirmAction(null)
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{confirmAction?.type === "revoke" && "Revocar API Key"}
							{confirmAction?.type === "renew" && "Renovar API Key"}
							{confirmAction?.type === "delete" && "Eliminar API Key"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{confirmAction?.type === "revoke" &&
								`Se revocará la key "${confirmAction.keyName}". Dejará de funcionar inmediatamente.`}
							{confirmAction?.type === "renew" &&
								`Se generará una nueva key para "${confirmAction.keyName}". La key actual será revocada.`}
							{confirmAction?.type === "delete" &&
								`Se eliminará permanentemente la key "${confirmAction.keyName}". Esta acción no se puede deshacer.`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							variant={confirmAction?.type === "delete" ? "destructive" : "default"}
							disabled={actionLoading}
							onClick={(e) => {
								e.preventDefault()
								onConfirmAction()
							}}
						>
							{actionLoading ? <Loader2Icon className="mr-1 size-4 animate-spin" /> : null}
							Confirmar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Create key dialog */}
			<CreateKeyDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				onKeyCreated={(key) => {
					setRevealedKey(key)
					setShowKeyDialog(true)
     void queryClient.invalidateQueries({ queryKey: ["admin-api-keys"] })
				}}
			/>

			{/* Reveal key dialog */}
			<RevealKeyDialog
				open={showKeyDialog}
				onOpenChange={(open) => {
					if (!open) {
						setShowKeyDialog(false)
						setRevealedKey("")
					}
				}}
				plainKey={revealedKey}
				onCopy={() => copyToClipboard(revealedKey)}
			/>
		</div>
	)
}

// ---------------------------------------------------------------------------
// Create key dialog
// ---------------------------------------------------------------------------

function CreateKeyDialog({
	open,
	onOpenChange,
	onKeyCreated,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	onKeyCreated: (key: string) => void
}) {
	const [name, setName] = useState("")
	const [expiresInDays, setExpiresInDays] = useState("")
	const [loading, setLoading] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!name.trim()) return

		setLoading(true)
		try {
			const body: Record<string, unknown> = { name: name.trim() }
			if (expiresInDays) body.expiresInDays = Number(expiresInDays)

			const res = await fetch("/api/v1/admin/generate-key", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			})

			if (!res.ok) {
				const err = await res.json().catch(() => null)
				throw new Error(err?.error ?? "Error al generar la key")
			}

			const result = await res.json()
			toast.success("API key creada exitosamente")
			onOpenChange(false)
			setName("")
			setExpiresInDays("")
			onKeyCreated(result.key)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Error inesperado")
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Crear nueva API Key</DialogTitle>
					<DialogDescription>
						Ingresá un nombre descriptivo para identificar esta key.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="key-name">Nombre</Label>
						<Input
							id="key-name"
							placeholder="Ej: Power BI - Producción"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="key-expires">Días hasta expiración (opcional)</Label>
						<Input
							id="key-expires"
							type="number"
							placeholder="90"
							min={1}
							value={expiresInDays}
							onChange={(e) => setExpiresInDays(e.target.value)}
						/>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline" disabled={loading}>
								Cancelar
							</Button>
						</DialogClose>
						<Button type="submit" disabled={loading || !name.trim()}>
							{loading && <Loader2Icon className="mr-1 size-4 animate-spin" />}
							Crear Key
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

// ---------------------------------------------------------------------------
// Reveal key dialog
// ---------------------------------------------------------------------------

function RevealKeyDialog({
	open,
	onOpenChange,
	plainKey,
	onCopy,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	plainKey: string
	onCopy: () => void
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<KeyIcon className="size-5" />
						Tu nueva API Key
					</DialogTitle>
					<DialogDescription>
						Copiá esta key ahora. No se puede recuperar después de cerrar este diálogo.
					</DialogDescription>
				</DialogHeader>

				<div className="flex items-center gap-2">
					<code className="bg-muted flex-1 overflow-x-auto rounded-md p-3 font-mono text-sm break-all">
						{plainKey}
					</code>
					<Button variant="outline" size="icon-sm" onClick={onCopy}>
						<CopyIcon className="size-4" />
					</Button>
				</div>

				<div className="flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
					<ShieldAlertIcon className="mt-0.5 size-4 shrink-0" />
					<span>Guardá esta key de forma segura. No se puede recuperar.</span>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cerrar</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
