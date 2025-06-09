import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { PLAN_FREQUENCY, WORK_ORDER_PRIORITY } from "@prisma/client"
import { add, format, isAfter } from "date-fns"
import { TaskFrequencyLabels } from "@/lib/consts/task-frequency"

export async function GET() {
	try {
		// Extraer parámetros de consulta si es necesario
		// const searchParams = request.nextUrl.searchParams

		// 1. Estadísticas básicas
		const [totalPlans, totalTasks, tasksWithUpcomingDate, tasksWithOverdueDate] = await Promise.all(
			[
				prisma.maintenancePlan.count(),
				prisma.maintenancePlanTask.count(),
				prisma.maintenancePlanTask.count({
					where: {
						nextDate: {
							gte: new Date(),
							lte: add(new Date(), { months: 1 }),
						},
					},
				}),
				prisma.maintenancePlanTask.count({
					where: {
						nextDate: {
							lt: new Date(),
						},
					},
				}),
			]
		)

		// 2. Datos para gráfico de pastel por frecuencia
		const tasksByFrequency = await prisma.maintenancePlanTask.groupBy({
			by: ["frequency"],
			_count: {
				id: true,
			},
		})

		const pieChartData = tasksByFrequency.map(
			(item: { frequency: string; _count: { id: number } }) => ({
				name: TaskFrequencyLabels[item.frequency as PLAN_FREQUENCY],
				value: item._count.id,
				frequency: item.frequency,
			})
		)

		// 3. Datos para gráfico de barras por prioridad de órdenes de trabajo
		const workOrdersByPriority = await prisma.workOrder.groupBy({
			by: ["priority"],
			_count: {
				id: true,
			},
			where: {
				maintenancePlanTaskId: {
					not: null,
				},
			},
		})

		const barChartData = workOrdersByPriority.map(
			(item: { priority: WORK_ORDER_PRIORITY; _count: { id: number } }) => ({
				value: item._count.id,
				priority: item.priority,
			})
		)

		// 4. Datos para gráfico de área (tareas creadas por mes)
		const sixMonthsAgo = add(new Date(), { months: -6 })

		const tasksCreatedOverTime = await prisma.maintenancePlanTask.findMany({
			select: {
				id: true,
				createdAt: true,
			},
			where: {
				createdAt: {
					gte: sixMonthsAgo,
				},
			},
			orderBy: {
				createdAt: "asc",
			},
		})

		// Agrupar por mes
		const tasksByMonth: Record<string, number> = {}

		tasksCreatedOverTime.forEach((task: { id: string; createdAt: Date }) => {
			const monthKey = format(task.createdAt, "MM-yyyy")
			tasksByMonth[monthKey] = (tasksByMonth[monthKey] || 0) + 1
		})

		// Llenar los meses faltantes y formatear para el gráfico de área
		let currentDate = sixMonthsAgo
		const areaChartData = []

		while (!isAfter(currentDate, new Date())) {
			const monthKey = format(currentDate, "MM-yyyy")
			const formattedDate = format(currentDate, "MMM yyyy")

			areaChartData.push({
				date: formattedDate,
				tasks: tasksByMonth[monthKey] || 0,
			})

			currentDate = add(currentDate, { months: 1 })
		}

		return NextResponse.json({
			basicStats: {
				totalPlans,
				totalTasks,
				tasksWithUpcomingDate,
				tasksWithOverdueDate,
			},
			pieChartData,
			barChartData,
			areaChartData,
		})
	} catch (error) {
		console.error("Error getting maintenance plan stats:", error)
		return NextResponse.json({ error: "Error getting maintenance plan stats" }, { status: 500 })
	}
}
