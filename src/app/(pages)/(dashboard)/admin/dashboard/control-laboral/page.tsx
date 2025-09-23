import AdminLaborControlFoldersList from "@/project/labor-control/components/data/AdminLaborControlFoldersList"
import CreateFoldersButton from "@/project/labor-control/components/data/CreateFoldersButton"
import MemoizedModuleHeader from "@/shared/components/ModuleHeader"
import ScrollToTableButton from "@/shared/components/ScrollToTable"

export default function AdminLaborControlFoldersPage() {
	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				title="Control Laboral"
				className="from-blue-600 to-sky-500"
				description="Gestión de documentación mensual de los trabajadores"
			>
				<>
					<CreateFoldersButton />

					<ScrollToTableButton
						label="Lista Carpetas"
						id="labor-control-folders-list"
						className="text-blue-600 hover:bg-white hover:text-blue-600"
					/>
				</>
			</MemoizedModuleHeader>

			<AdminLaborControlFoldersList id="labor-control-folders-list" />
		</div>
	)
}
