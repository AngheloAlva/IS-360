import { StartupFolderStatsContainer } from "@/project/startup-folder/components/stats/StartupFolderStatsContainer"
import { AdminStartupFoldersList } from "@/project/startup-folder/components/data/AdminStartupFoldersList"
import ScrollToTableButton from "@/shared/components/ScrollToTable"

export default function AdminStartupFoldersPage() {
	return (
		<div className="w-full flex-1 space-y-6">
			<div className="rounded-lg bg-gradient-to-r from-teal-600 to-cyan-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-2xl font-bold tracking-tight md:text-3xl">Carpetas de Arranque</h1>
						<p className="opacity-90">Gestión de documentación para inicio de proyectos</p>
					</div>

					<div className="flex flex-wrap items-center justify-end gap-2">
						<ScrollToTableButton
							label="Lista Carpetas"
							id="startup-folders-list"
							className="text-cyan-600 hover:bg-white hover:text-cyan-600"
						/>
					</div>
				</div>
			</div>

			<StartupFolderStatsContainer />

			<AdminStartupFoldersList id="startup-folders-list" />
		</div>
	)
}
