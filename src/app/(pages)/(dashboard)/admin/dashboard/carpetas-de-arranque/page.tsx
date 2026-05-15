import { StartupFolderStatsContainer } from "@/project/startup-folder/components/stats/StartupFolderStatsContainer"
import { AdminStartupFoldersList } from "@/project/startup-folder/components/data/AdminStartupFoldersList"
import MemoizedModuleHeader from "@/shared/components/ModuleHeader"
import VideoTutorials from "@/shared/components/VideoTutorials"

export default function AdminStartupFoldersPage() {
	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				title="Carpetas de Arranque"
				className="from-teal-600 to-cyan-700 dark:from-teal-700 dark:to-cyan-900"
				description="Gestión de documentación para inicio de proyectos"
			>
				<>
					<VideoTutorials
						className="flex size-9 items-center justify-center text-teal-600 dark:text-teal-700"
						videos={[
							{
								title: "Funcionalidad Carpetas de Arranque",
								description: "Tutorial de las funcionalidades de las carpetas de arranque.",
								url: "https://youtube.com/embed/bSlof1Rs5vI",
							},
						]}
					/>
				</>
			</MemoizedModuleHeader>

			<StartupFolderStatsContainer />

			<AdminStartupFoldersList id="startup-folders-list" />
		</div>
	)
}
