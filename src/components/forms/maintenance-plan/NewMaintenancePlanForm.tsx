"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { CalendarSync } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { maintenancePlanSchema, type MaintenancePlanSchema } from "@/lib/form-schemas/maintenance-plan/maintenance-plan.schema"
import { createMaintenancePlan } from "@/actions/maintenance-plan-task/createMaintenancePlan"
import { PlanLocationOptions } from "@/lib/consts/plan-location"
import { useEquipments, WorkEquipment } from "@/hooks/use-equipments"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { TextAreaFormField } from "../shared/TextAreaFormField"
import { SelectFormField } from "../shared/SelectFormField"
import { InputFormField } from "../shared/InputFormField"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import SubmitButton from "../shared/SubmitButton"

interface NewMaintenancePlanFormProps {
  userId: string
}

export default function NewMaintenancePlanForm({ userId }: NewMaintenancePlanFormProps): React.ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [equipmentSelected, setEquipmentSelected] = useState<WorkEquipment | undefined>(undefined)

  const router = useRouter()

  const form = useForm<MaintenancePlanSchema>({
    resolver: zodResolver(maintenancePlanSchema),
    defaultValues: {
      name: "",
      description: "",
      createdById: userId,
      location: undefined,
      equipmentId: undefined,
    }
  })

  const { data: equipments, isLoading: isEquipmentsLoading } = useEquipments({ limit: 1000 })
  const formValues = form.watch()

  useEffect(() => {
    if (formValues.equipmentId) {
      const equipment = equipments?.equipments.find((equipment) => equipment.id === formValues.equipmentId)
      setEquipmentSelected(equipment || undefined)
    }
  }, [formValues.equipmentId, equipments])

  const onSubmit = async (values: MaintenancePlanSchema) => {
    setIsSubmitting(true)
    try {
      const { ok, message, code } = await createMaintenancePlan({ values })

      if (ok) {
        toast.success("Plan de mantenimiento creado exitosamente", {
          description: "El plan de mantenimiento ha sido creado exitosamente",
          duration: 3000,
        })
        router.push("/admin/dashboard/planes-de-mantenimiento")
      } else {
        if (code === "NAME_ALREADY_EXISTS") {
          toast.error("El nombre del plan de mantenimiento ya existe", {
            description: "Por favor, elige un nombre único para el plan de mantenimiento",
            duration: 5000,
            className: "bg-red-500/10 border border-red-500 text-white",
          })
        } else {
          toast.error("Error al crear el plan de mantenimiento", {
            description: message,
            duration: 5000,
          })
        }
      }
    } catch (error) {
      console.log(error)
      toast.error("Error al crear el plan de mantenimiento", {
        description: "Ocurrió un error al intentar crear el plan de mantenimiento",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full max-w-screen-xl flex-col gap-6 lg:flex-row">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full lg:w-2/3 flex-col gap-3">
          <Card>
            <CardContent className="grid gap-y-5 gap-x-3 md:grid-cols-2">
              <div className="flex flex-col md:col-span-2">
                <h2 className="text-text w-fit text-xl md:col-span-2 font-bold">Información General</h2>
                <p className="text-muted-foreground w-fit">Información general del plan de mantenimiento</p>
              </div>

              <InputFormField<MaintenancePlanSchema>
                name="name"
                label={`Nombre`}
                control={form.control}
                placeholder="Nombre del plan de mantenimiento"
              />

              <SelectFormField<MaintenancePlanSchema>
                name="location"
                label="Ubicación"
                control={form.control}
                options={PlanLocationOptions}
                placeholder="Selecciona la ubicación"
              />

              <FormField
                control={form.control}
                name="equipmentId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Equipo</FormLabel>
                    {isEquipmentsLoading ? (
                      <FormControl>
                        <Skeleton className="h-10 w-full" />
                      </FormControl>
                    ) : (
                      <Select
                        disabled={!equipments}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el equipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {equipments?.equipments?.map((equipment) => (
                            <SelectItem key={equipment.id} value={equipment.id}>
                              {equipment.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TextAreaFormField<MaintenancePlanSchema>
                name="description"
                label={`Descripción`}
                control={form.control}
                itemClassName="md:col-span-2"
                placeholder="Descripción del plan de mantenimiento"
              />
            </CardContent>
          </Card>

          <SubmitButton label="Crear Plan de Mantenimiento" isSubmitting={isSubmitting} className="hover:bg-primary/80" />
        </form>
      </Form>

      <Card className="hidden h-fit lg:col-span-1 lg:block lg:w-1/3">
        <CardContent className="pt-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
              <CalendarSync className="text-muted-foreground h-14 w-14" />
            </div>

            <div className="space-y-1 text-center">
              <h3 className="text-xl font-semibold">
                {formValues.name || "Plan de Mantenimiento"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {formValues.location || "Ubicación"}
              </p>
            </div>

            <div className="w-full space-y-1 pt-2">
              <span className="text-base underline mb-2 font-semibold">Equipo:</span>

              <div className="flex justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="text-end">{equipmentSelected?.name || "Nombre del Equipo"}</span>
              </div>
              <div className="flex justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Operativo:</span>
                <span className="text-end">{equipmentSelected?.isOperational ? "Sí" : "No"}</span>
              </div>
              <div className="flex justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Tag:</span>
                <span className="text-end">{equipmentSelected?.tag || "Nombre del Equipo"}</span>
              </div>
              <div className="flex justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Ubicación:</span>
                <span className="text-end">{equipmentSelected?.location || "Ubicación del Equipo"}</span>
              </div>
              <div className="flex justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="text-end">{equipmentSelected?.type || "Tipo del Equipo"}</span>
              </div>
              <div className="flex justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Cantidad de hijos:</span>
                <span className="text-end">{equipmentSelected?._count.children || "0"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
