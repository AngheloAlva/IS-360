import { StartupFolderStatsContainer } from "@/project/startup-folder/components/stats/StartupFolderStatsContainer"
import { AdminStartupFoldersList } from "@/project/startup-folder/components/data/AdminStartupFoldersList"
import ScrollToTableButton from "@/shared/components/ScrollToTable"
import VideoTutorials from "@/shared/components/VideoTutorials"
import MemoizedModuleHeader from "@/shared/components/ModuleHeader"

export default function AdminStartupFoldersPage() {
	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				title="Carpetas de Arranque"
				className="from-teal-600 to-cyan-700"
				description="Gestión de documentación para inicio de proyectos"
			>
				<>
					<VideoTutorials
						className="text-teal-600"
						videos={[
							{
								title: "Funcionalidad Carpetas de Arranque",
								description: "Tutorial de las funcionalidades de las carpetas de arranque.",
								url: "https://youtube.com/embed/bSlof1Rs5vI",
							},
						]}
					/>

					<ScrollToTableButton
						label="Lista Carpetas"
						id="startup-folders-list"
						className="text-cyan-600 hover:bg-white hover:text-cyan-600"
					/>
				</>
			</MemoizedModuleHeader>

			<StartupFolderStatsContainer />

			<AdminStartupFoldersList id="startup-folders-list" />
		</div>
	)
}
