import {
	FolderIcon,
	FolderCheckIcon,
	FolderClockIcon,
	FolderCogIcon,
	FolderHeartIcon,
	FolderLockIcon,
} from "lucide-react"

import { SheetFooter } from "@/shared/components/ui/sheet"

export default function FolderTypes(): React.ReactElement {
	return (
		<SheetFooter className="py-8">
			<span className="text-muted-foreground text-center font-semibold underline decoration-wavy">
				Tipos de carpetas:
			</span>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-5 lg:flex-nowrap">
				<div className="text-muted-foreground flex flex-col items-center justify-center text-sm">
					<FolderIcon className="h-8 w-8 rounded-lg bg-yellow-500/10 p-1.5 text-yellow-500" />
					<span>Defecto</span>
				</div>
				<div className="text-muted-foreground flex flex-col items-center justify-center text-sm">
					<FolderCheckIcon className="h-8 w-8 rounded-lg bg-green-500/10 p-1.5 text-green-500" />
					<span>Check</span>
				</div>
				<div className="text-muted-foreground flex flex-col items-center justify-center text-sm">
					<FolderClockIcon className="h-8 w-8 rounded-lg bg-blue-500/10 p-1.5 text-blue-500" />
					<span>Reloj</span>
				</div>
				<div className="text-muted-foreground flex flex-col items-center justify-center text-sm">
					<FolderCogIcon className="h-8 w-8 rounded-lg bg-indigo-500/10 p-1.5 text-indigo-500" />
					<span>Servicio</span>
				</div>
				<div className="text-muted-foreground flex flex-col items-center justify-center text-sm">
					<FolderHeartIcon className="h-8 w-8 rounded-lg bg-red-500/10 p-1.5 text-red-500" />
					<span>Favorito</span>
				</div>
				<div className="text-muted-foreground flex flex-col items-center justify-center text-sm">
					<FolderLockIcon className="h-8 w-8 rounded-lg bg-gray-500/10 p-1.5 text-gray-500" />
					<span>Bloqueado</span>
				</div>
			</div>
		</SheetFooter>
	)
}
