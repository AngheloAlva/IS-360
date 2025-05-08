"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { UploadIcon } from "lucide-react"

import { uploadFilesToCloud } from "@/lib/upload-files"
import { fileSchema } from "@/lib/form-schemas/document-management/file.schema"
import { CompanyDocumentType } from "@prisma/client"

import { Form } from "@/components/ui/form"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { FilePreview } from "@/components/ui/file-preview"
import UploadFilesFormField from "@/components/forms/shared/UploadFilesFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"

// Schema específico para documentos de carpetas de arranque
const startupDocumentFormSchema = z.object({
  files: z.array(fileSchema).min(1, "Debe subir al menos un archivo"),
  name: z.string().optional(),
  description: z.string().optional(),
  userId: z.string(),
  folderId: z.string(),
  type: z.enum([
    // Company Document Types
    CompanyDocumentType.COMPANY_FILE,
    CompanyDocumentType.MUTUAL_AGREEMENT,
    CompanyDocumentType.REGULATIONS,
    CompanyDocumentType.ORGANIZATION_CHART,
    CompanyDocumentType.PREVENTION_PLAN,
    CompanyDocumentType.OTHER,
  ])
})

type StartupDocumentFormSchema = z.infer<typeof startupDocumentFormSchema>

interface UploadStartupDocumentFormProps {
  userId: string
  folderId: string
  documentType: CompanyDocumentType
  documentName: string
  onSuccess?: () => void
}

export function UploadStartupDocumentForm({
  userId,
  folderId,
  documentType,
  documentName,
  onSuccess
}: UploadStartupDocumentFormProps) {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const form = useForm<StartupDocumentFormSchema>({
    resolver: zodResolver(startupDocumentFormSchema),
    defaultValues: {
      userId,
      folderId,
      type: documentType,
      name: documentName,
      description: "",
      files: []
    }
  })

  const onSubmit = async (values: StartupDocumentFormSchema) => {
    const files = form.getValues("files")

    if (files.length === 0) {
      toast.error("Por favor, sube al menos un archivo")
      return
    }

    setIsSubmitting(true)

    try {
      // Subir archivos a Azure
      const uploadResults = await uploadFilesToCloud({
        randomString: userId,
        containerType: "startup", // Usamos el nuevo contenedor para carpetas de arranque
        secondaryName: documentName,
        files: files
      })

      // Actualizar el documento en la base de datos
      const response = await fetch("/api/startup-folders/documents/company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          folderId,
          type: documentType,
          name: values.name || documentName,
          description: values.description || "",
          url: uploadResults[0].url, // Tomamos la URL del primer archivo
          uploadedById: userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al guardar el documento")
      }

      toast.success("Documento subido correctamente")
      setOpen(false)
      
      // Refrescar la página o ejecutar callback
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Error al subir el documento")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="flex h-9 items-center justify-center gap-1 rounded-md bg-green-500 px-3 text-sm text-white hover:bg-green-500/80">
        <UploadIcon className="h-4 w-4" />
        <span className="text-nowrap">Subir</span>
      </SheetTrigger>

      <SheetContent className="gap-0 overflow-y-scroll pb-14 sm:max-w-[60dvw] 2xl:max-w-[50dvw]">
        <SheetHeader className="shadow">
          <SheetTitle>Subir Documento</SheetTitle>
          <SheetDescription>
            Suba el documento {documentName} para la carpeta de arranque
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4 pt-4 lg:flex-row">
          <UploadFilesFormField
            name="files"
            isMultiple={false}
            maxFileSize={500}
            control={form.control}
            className="hidden lg:grid"
            containerClassName="w-full lg:w-2/3"
            selectedFileIndex={selectedFileIndex}
            setSelectedFileIndex={setSelectedFileIndex}
          />

          <FilePreview
            className="hidden lg:block lg:w-1/3"
            file={selectedFileIndex !== null ? form.getValues("files")[selectedFileIndex] : null}
          />
        </div>

        <Separator className="mt-6 mb-4" />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-x-3 gap-y-5 px-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <h3 className="text-lg font-semibold">Información del Documento</h3>
              <p className="text-muted-foreground text-sm">
                Complete la información del documento {documentName}
              </p>
            </div>

            <InputFormField<StartupDocumentFormSchema>
              optional
              name="name"
              control={form.control}
              label="Nombre del documento"
              placeholder={documentName}
            />

            <TextAreaFormField<StartupDocumentFormSchema>
              optional
              name="description"
              label="Descripción"
              control={form.control}
              itemClassName="sm:col-span-2"
              placeholder="Agregue detalles adicionales..."
            />

            <SubmitButton
              label="Subir Documento"
              isSubmitting={isSubmitting}
              className="hover:bg-primary/80 sm:col-span-2"
              disabled={form.getValues("files")?.length === 0}
            />
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
