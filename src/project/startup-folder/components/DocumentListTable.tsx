import { Button } from "@/shared/components/ui/button"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table"
import {
	SAFETY_AND_HEALTH_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	VEHICLE_STRUCTURE,
	WORKER_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"
import { DocumentCategory } from "@prisma/client"
import { FileUp } from "lucide-react"

interface DocumentListTableProps {
	category: DocumentCategory
	onUploadDocument: (documentType: string, documentName: string) => void
}

export function DocumentListTable({ category, onUploadDocument }: DocumentListTableProps) {
	const getStructureByCategory = () => {
		switch (category) {
			case DocumentCategory.SAFETY_AND_HEALTH:
				return SAFETY_AND_HEALTH_STRUCTURE
			case DocumentCategory.ENVIRONMENTAL:
				return ENVIRONMENTAL_STRUCTURE
			case DocumentCategory.VEHICLES:
				return VEHICLE_STRUCTURE
			case DocumentCategory.PERSONNEL:
				return WORKER_STRUCTURE
			default:
				return null
		}
	}

	const structure = getStructureByCategory()
	if (!structure) return null

	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Documento</TableHead>
							<TableHead>Descripción</TableHead>
							<TableHead>Requerido</TableHead>
							<TableHead className="w-[100px]">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{structure.documents.map((doc) => (
							<TableRow key={doc.type}>
								<TableCell>{doc.name}</TableCell>
								<TableCell>{doc.description || "Sin descripción"}</TableCell>
								<TableCell>{doc.required ? "Sí" : "No"}</TableCell>
								<TableCell>
									<Button
										size="icon"
										variant="ghost"
										onClick={() => onUploadDocument(doc.type, doc.name)}
									>
										<FileUp className="h-4 w-4" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<p className="text-muted-foreground text-sm">
				Nota: Si necesita subir múltiples páginas para un documento, por favor comprímalas en un
				archivo ZIP. Para documentos que no aplican, suba un archivo con el texto &quot;No
				corresponde&quot;.
			</p>
		</div>
	)
}
