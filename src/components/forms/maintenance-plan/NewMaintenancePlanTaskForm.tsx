"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { maintenancePlanTaskSchema, type MaintenancePlanTaskSchema } from "@/lib/form-schemas/maintenance-plan/maintenance-plan-task.schema"
import { createMaintenancePlanTask } from "@/actions/maintenance-plan-task/createMaintenancePlanTask"
import { type Company, useCompanies } from "@/hooks/companies/use-companies"
import { WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { WorkOrderCAPEXOptions } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { TaskFrequencyOptions } from "@/lib/consts/task-frequency"
import { useEquipments } from "@/hooks/use-equipments"
import { useUsers } from "@/hooks/users/use-users"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerFormField } from "../shared/DatePickerFormField"
import UploadFilesFormField from "../shared/UploadFilesFormField"
import { TextAreaFormField } from "../shared/TextAreaFormField"
import { SelectFormField } from "../shared/SelectFormField"
import { SwitchFormField } from "../shared/SwitchFormField"
import { FilePreview } from "@/components/ui/file-preview"
import { InputFormField } from "../shared/InputFormField"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import SubmitButton from "../shared/SubmitButton"

interface NewMaintenancePlanTaskFormProps {
  maintenancePlanSlug: string
  userId: string
}

export default function NewMaintenancePlanTaskForm({ maintenancePlanSlug, userId }: NewMaintenancePlanTaskFormProps): React.ReactElement {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  const form = useForm<MaintenancePlanTaskSchema>({
    resolver: zodResolver(maintenancePlanTaskSchema),
    defaultValues: {
      name: "",
      attachments: [],
      description: "",
      estimatedDays: "1",
      estimatedHours: "0",
      createdById: userId,
      maintenancePlanSlug,
      nextDate: undefined,
      companyId: undefined,
      frequency: undefined,
      equipmentId: undefined,
      responsibleId: undefined,
      workOrderType: undefined,
      workOrderCapex: undefined,
      workOrderPriority: undefined,
      isInternalResponsible: false,
    }
  })

  const { data: equipmentsData, isLoading: isEquipmentsLoading } = useEquipments({ limit: 1000 })
  const { data: companiesData, isLoading: isCompaniesLoading } = useCompanies({ limit: 1000 })
  const { data: usersData } = useUsers({ limit: 1000, showOnlyInternal: true })

  const isInternalResponsible = form.watch("isInternalResponsible")

  const onSubmit = async (values: MaintenancePlanTaskSchema) => {
    setIsSubmitting(true)

    try {
      const { ok, message } = await createMaintenancePlanTask({ values })

      if (ok) {
        toast.success("Tarea de mantenimiento creada exitosamente", {
          description: "La tarea de mantenimiento ha sido creada exitosamente",
          duration: 3000,
        })
        router.push(`/admin/dashboard/planes-de-mantenimiento/${maintenancePlanSlug}/tareas`)
      } else {
        toast.error("Error al crear la tarea de mantenimiento", {
          description: message,
          duration: 5000,
        })
      }
    } catch (error) {
      console.log(error)
      toast.error("Error al crear la tarea de mantenimiento", {
        description: "Ocurrió un error al intentar crear la tarea de mantenimiento",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full flex-col lg:flex-row gap-3 gap-y-5 max-w-screen-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-3">
          <Card>
            <CardContent className="grid gap-y-5 md:grid-cols-2 gap-x-3 ">
              <div className="flex flex-col md:col-span-2">
                <h2 className="text-text w-fit text-xl md:col-span-2 font-bold">Información General</h2>
                <p className="text-muted-foreground w-fit">Información general de la tarea de mantenimiento</p>
              </div>

              <InputFormField<MaintenancePlanTaskSchema>
                name="name"
                label="Nombre"
                control={form.control}
                placeholder="Nombre de la tarea"
              />

              <DatePickerFormField<MaintenancePlanTaskSchema>
                name="nextDate"
                control={form.control}
                label="Fecha de próxima ejecución"
              />

              <SelectFormField<MaintenancePlanTaskSchema>
                name="frequency"
                control={form.control}
                label="Frecuencia"
                options={TaskFrequencyOptions}
              />

              <FormField
                control={form.control}
                name="equipmentId"
                render={() => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Equipo</FormLabel>
                    <Select
                      disabled={isEquipmentsLoading}
                      onValueChange={(value) => {
                        form.setValue("equipmentId", value)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un equipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isEquipmentsLoading ? (
                          <div className="flex w-full items-center justify-center p-4">
                            <Skeleton className="h-4 w-full" />
                          </div>
                        ) : (
                          equipmentsData?.equipments.map((equipment) => (
                            <SelectItem key={equipment.id} value={equipment.id}>
                              {equipment.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TextAreaFormField<MaintenancePlanTaskSchema>
                name="description"
                label="Descripción"
                control={form.control}
                itemClassName="md:col-span-2"
                placeholder="Descripción de la tarea"
              />

              <UploadFilesFormField
                maxFileSize={200}
                isMultiple={true}
                name="attachments"
                control={form.control}
                containerClassName="md:col-span-2"
                selectedFileIndex={selectedFileIndex}
                setSelectedFileIndex={setSelectedFileIndex}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-y-5 gap-x-3 ">
              <div className="flex flex-col md:col-span-2">
                <h2 className="text-text w-fit text-xl md:col-span-2 font-bold">Responsable y/o Empresa</h2>
                <p className="text-muted-foreground w-fit">Información del responsable y/o empresa de la tarea de mantenimiento</p>
              </div>

              <SwitchFormField<MaintenancePlanTaskSchema>
                control={form.control}
                name="isInternalResponsible"
                itemClassName="md:col-span-2"
                label="¿El responsable es Interno?"
              />

              {!isInternalResponsible ? (
                <>
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={() => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Empresa Responsable</FormLabel>
                        <Select
                          disabled={isCompaniesLoading}
                          onValueChange={(value) => {
                            const company = companiesData?.companies.find((c) => c.id === value)
                            setSelectedCompany(company ?? null)
                            form.setValue("companyId", value)
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una empresa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isCompaniesLoading ? (
                              <div className="flex w-full items-center justify-center p-4">
                                <Skeleton className="h-4 w-full" />
                              </div>
                            ) : (
                              companiesData?.companies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {selectedCompany && (
                    <FormField
                      control={form.control}
                      name="responsibleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsable Externo</FormLabel>
                          <Select
                            disabled={!selectedCompany}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un responsable externo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {selectedCompany?.users
                                .filter((user) => user.isSupervisor)
                                .map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="responsibleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable Interno</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un responsable interno" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {usersData?.users
                            .map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-y-5 gap-x-3 ">
              <div className="flex flex-col md:col-span-2">
                <h2 className="text-text w-fit text-xl md:col-span-2 font-bold">Información para la orden de trabajo</h2>
                <p className="text-muted-foreground w-fit">Información que se requiere para la creación de la orden de trabajo</p>
              </div>

              <InputFormField<MaintenancePlanTaskSchema>
                type="number"
                name="estimatedDays"
                label="Días estimados"
                control={form.control}
                placeholder="Días estimados"
              />

              <InputFormField<MaintenancePlanTaskSchema>
                type="number"
                name="estimatedHours"
                label="Horas estimadas"
                control={form.control}
                placeholder="Horas estimadas"
              />

              <SelectFormField<MaintenancePlanTaskSchema>
                control={form.control}
                name="workOrderPriority"
                options={WorkOrderPriorityOptions}
                label="Prioridad de la orden de trabajo"
                placeholder="Prioridad de la orden de trabajo"
              />

              <SelectFormField<MaintenancePlanTaskSchema>
                control={form.control}
                name="workOrderType"
                options={WorkOrderTypeOptions}
                label="Tipo de la orden de trabajo"
                placeholder="Tipo de la orden de trabajo"
              />

              <SelectFormField<MaintenancePlanTaskSchema>
                control={form.control}
                name="workOrderCapex"
                options={WorkOrderCAPEXOptions}
                label="Capex de la orden de trabajo"
                placeholder="Capex de la orden de trabajo"
              />
            </CardContent>
          </Card>

          <SubmitButton label="Guardar tarea" isSubmitting={isSubmitting} className="hover:bg-primary/80" />
        </form>
      </Form>

      <FilePreview
        file={selectedFileIndex !== null ? form.getValues("attachments")[selectedFileIndex] : null}
      />
    </div>
  )
}
