import AdminLaborControlFoldersList from "@/project/labor-control/components/data/AdminLaborControlFoldersList"
import CreateFoldersButton from "@/project/labor-control/components/data/CreateFoldersButton"
import MemoizedModuleHeader from "@/shared/components/ModuleHeader"

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
				</>
			</MemoizedModuleHeader>

			<AdminLaborControlFoldersList id="labor-control-folders-list" />
		</div>
	)
}
