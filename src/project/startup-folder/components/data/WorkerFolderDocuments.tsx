"use client"

import { ChevronLeft, EyeIcon, PencilIcon, Trash2Icon, Upload } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { useStartupFolderDocuments } from "../../hooks/use-startup-folder-documents"
import { deleteStartupFolderDocument } from "../../actions/delete-startup-folder-document"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import { type StartupFolderDocument } from "@/project/startup-folder/types"

import { StartupFolderStatusBadge } from "@/shared/components/ui/startup-folder-status-badge"
import { UploadDocumentsDialog } from "../forms/UploadDocumentsDialog"
import { Button } from "@/shared/components/ui/button"
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/shared/components/ui/table"

interface WorkerFolderDocumentsProps {
  workerId: string
  userId: string
  onBack: () => void
}

export function WorkerFolderDocuments({
  onBack,
  userId,
  workerId,
}: WorkerFolderDocumentsProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<StartupFolderDocument | null>(null)

  const { data, isLoading, refetch } = useStartupFolderDocuments({
    category: DocumentCategory.PERSONNEL,
    workerId,
  })
  const documents = data?.documents ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="cursor-pointer gap-1" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Button>

        <Button
          className="cursor-pointer gap-2 bg-cyan-600 transition-all hover:scale-105 hover:bg-cyan-700 hover:text-white"
          onClick={() => setShowUploadDialog(true)}
        >
          <Upload className="h-4 w-4" />
          Subir documento
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Subido por</TableHead>
            <TableHead>Fecha de vencimiento</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Cargando documentos...
              </TableCell>
            </TableRow>
          ) : documents.length > 0 ? (
            documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col items-start justify-center">
                    {doc.name}

                    {doc.status === ReviewStatus.REJECTED && (
                      <span className="text-rose-500">Rechazado: {doc.reviewNotes}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StartupFolderStatusBadge status={doc.status} />
                </TableCell>
                <TableCell>{doc.uploadedBy?.name ?? "Usuario desconocido"}</TableCell>
                <TableCell>
                  {doc.expirationDate ? new Date(doc.expirationDate).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {doc.url && (
                      <Button
                        size={"icon"}
                        variant="ghost"
                        className="text-teal-600"
                        onClick={() => window.open(doc.url!, "_blank")}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {(doc.status === "DRAFT" || doc.status === "REJECTED" || doc.status === "EXPIRED") && (
                      <Button
                        size={"icon"}
                        variant="ghost"
                        className="text-amber-600"
                        onClick={() => {
                          setSelectedDocument(doc)
                          setShowUploadDialog(true)
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {doc.status === "DRAFT" && (
                      <Button
                        size={"icon"}
                        variant="ghost"
                        className="text-rose-600"
                        onClick={async () => {
                          try {
                            await deleteStartupFolderDocument({
                              data: {
                                documentId: doc.id,
                                category: DocumentCategory.PERSONNEL,
                              },
                              userId,
                            })
                            await refetch()
                            toast.success("Documento eliminado exitosamente")
                          } catch (error) {
                            console.error("Error deleting document:", error)
                            toast.error("Error al eliminar el documento")
                          }
                        }}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No hay documentos subidos para este trabajador
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showUploadDialog && (
        <UploadDocumentsDialog
          category={DocumentCategory.PERSONNEL}
          userId={userId}
          isOpen={showUploadDialog}
          onClose={() => {
            setShowUploadDialog(false)
            setSelectedDocument(null)
          }}
          onUploadComplete={() => {
            setShowUploadDialog(false)
            setSelectedDocument(null)
          }}
          documentToUpdate={selectedDocument}
          workerId={workerId}
        />
      )}
    </div>
  )
}
