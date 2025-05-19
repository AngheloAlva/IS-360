import { AdminStartupFoldersList } from "@/components/sections/startup-folders/admin/AdminStartupFoldersList"

export default function AdminStartupFoldersPage() {
	return (
		<div className="w-full flex-1 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Carpetas de Arranque</h1>
					<p className="text-muted-foreground">
						Revisa y gestiona las carpetas de arranque de las empresas
					</p>
				</div>
			</div>

			<AdminStartupFoldersList />
		</div>
	)
}
