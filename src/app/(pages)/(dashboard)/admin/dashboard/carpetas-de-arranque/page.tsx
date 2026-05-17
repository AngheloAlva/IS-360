import { StartupFolderStatsContainer } from "@/project/startup-folder/components/stats/StartupFolderStatsContainer"
import { AdminStartupFoldersList } from "@/project/startup-folder/components/data/AdminStartupFoldersList"
import MemoizedModuleHeader from "@/shared/components/ModuleHeader"

export default function AdminStartupFoldersPage() {
	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				title="Carpetas de Arranque"
				className="from-teal-600 to-cyan-700 dark:from-teal-700 dark:to-cyan-900"
				description="Gestión de documentación para inicio de proyectos"
			/>

			<StartupFolderStatsContainer />

			<AdminStartupFoldersList id="startup-folders-list" />
		</div>
	)
}
