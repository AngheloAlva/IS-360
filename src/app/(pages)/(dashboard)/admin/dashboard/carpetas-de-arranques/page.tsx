import { StartupFolderStatsContainer } from "@/project/startup-folder/components/stats/StartupFolderStatsContainer"
import { AdminStartupFoldersList } from "@/project/startup-folder/components/data/AdminStartupFoldersList"

export default function AdminStartupFoldersPage() {
	return (
		<div className="w-full flex-1 space-y-6">
			<div className="rounded-lg bg-gradient-to-r from-teal-600 to-cyan-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Carpetas de Arranque</h1>
						<p className="opacity-90">Gestión de documentación para inicio de proyectos</p>
					</div>
				</div>
			</div>

			<StartupFolderStatsContainer />

			<AdminStartupFoldersList />
		</div>
	)
}
