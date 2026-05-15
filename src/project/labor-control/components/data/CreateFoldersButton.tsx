"use client"

import { createLaborControlFolders } from "../../actions/create-labor-control-folders"

import { Button } from "@/shared/components/ui/button"

export default function CreateFoldersButton(): React.ReactElement {
	return (
		<Button
			size={"lg"}
			className="bg-white text-blue-500"
			onClick={async () => {
				await createLaborControlFolders("cm9u473j90000yi0v60wxjid7")
			}}
		>
			Crear carpetas
		</Button>
	)
}
