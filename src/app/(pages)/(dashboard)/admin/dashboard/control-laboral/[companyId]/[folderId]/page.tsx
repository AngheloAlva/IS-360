import { FolderInputIcon } from "lucide-react"

import MemoizedModuleHeader from "@/shared/components/ModuleHeader"
import {
	Table,
	TableRow,
	TableCell,
	TableBody,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

export default async function StartupFolderReviewPage({
	params,
}: {
	params: Promise<{ companyId: string; folderId: string }>
}) {
	const asyncParams = await params

	const companyName = asyncParams.companyId.split("_")[0].replaceAll("-", " ")
	const folderName = asyncParams.folderId.split("_")[0].replaceAll("-", " ")

	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				title={companyName + " - " + folderName}
				className="from-blue-600 to-sky-500"
				backHref={"/admin/dashboard/control-laboral/" + asyncParams.companyId}
				description={`Gestion de la carpeta "${folderName}" de la empresa "${companyName}"`}
			/>

			<Card className="">
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
											"/admin/dashboard/control-laboral/" +
											asyncParams.companyId +
											"/" +
											asyncParams.folderId +
											"/acreditacion-empresa"
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
											"/admin/dashboard/control-laboral/" +
											asyncParams.companyId +
											"/" +
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
