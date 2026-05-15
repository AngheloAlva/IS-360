import { FolderInputIcon } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import MemoizedModuleHeader from "@/shared/components/ModuleHeader"
import {
	Table,
	TableRow,
	TableCell,
	TableBody,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

export default async function StartupFolderReviewPage({
	params,
}: {
	params: Promise<{ folderId: string }>
}) {
	const asyncParams = await params

	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				title={"Carpetas de Control Laboral"}
				className="from-blue-600 to-sky-500"
				backHref={"/admin/dashboard/control-laboral"}
				description="Gestion y seguimiento de todas las carpetas de control laboral de la empresa"
			/>

			<Card className="gap-2">
				<CardHeader className="flex w-full items-start justify-between">
					<CardTitle className="text-xl font-semibold">Documentos y Colaboradores</CardTitle>
				</CardHeader>

				<CardContent>
					<Table className="bg-background">
						<TableHeader className="bg-background">
							<TableRow>
								<TableHead>Nombre</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							<TableRow>
								<TableCell>
									<Link
										href={
											"/dashboard/control-laboral/" + asyncParams.folderId + "/acreditacion-empresa"
										}
										className="flex items-center"
									>
										<FolderInputIcon className="mr-2 h-4 w-4 fill-blue-500/20 text-blue-500" />
										Acreditación empresa
									</Link>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<Link
										href={
											"/dashboard/control-laboral/" +
											asyncParams.folderId +
											"/acreditacion-trabajadores"
										}
										className="flex items-center"
									>
										<FolderInputIcon className="mr-2 h-4 w-4 fill-blue-500/20 text-blue-500" />
										Acreditación trabajadores
									</Link>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
