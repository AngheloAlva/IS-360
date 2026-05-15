import { PrismaClient } from "@/generated/prisma/client"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin as adminPlugin } from "better-auth/plugins"
import {
	ac,
	admin,
	user,
	operator,
	userOperator,
	partnerCompany,
	companyOperator,
	workBookOperator,
	workOrderOperator,
	equipmentOperator,
	workPermitOperator,
	safetyTalkOperator,
	documentationOperator,
	startupFolderOperator,
	maintenancePlanOperator,
} from "../../src/lib/permissions"
import prisma from "@/lib/prisma"

// Standalone auth instance for seeding (no Next.js context needed)
const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: "postgresql" }),
	emailAndPassword: { enabled: true },
	baseURL: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
	user: {
		additionalFields: {
			rut: { type: "string", required: true, unique: true, input: true },
			internalRole: { type: "string", required: false, nullable: true, input: true },
			area: { type: "string", required: false, nullable: true, input: true },
			companyId: { type: "string", required: false, input: true },
			isSupervisor: { type: "boolean", required: false, input: true },
			phone: { type: "string", required: false, input: true },
			accessRole: { type: "string", required: false, input: true },
			documentAreas: { type: "string[]", required: true, input: true },
			internalArea: { type: "string", required: false, nullable: true, input: true },
			isActive: { type: "boolean", required: false, input: false },
			allowedModules: { type: "string[]", required: false, input: true },
		},
	},
	plugins: [
		adminPlugin({
			ac,
			roles: {
				admin,
				user,
				operator,
				userOperator,
				partnerCompany,
				companyOperator,
				workBookOperator,
				workOrderOperator,
				equipmentOperator,
				safetyTalkOperator,
				workPermitOperator,
				documentationOperator,
				startupFolderOperator,
				maintenancePlanOperator,
			},
		}),
	],
})

async function seed() {
	console.log("🌱 Starting seed...")

	// ── 0. Cleanup (order matters for FK constraints) ──
	console.log("  🧹 Cleaning up existing data...")
	await prisma.workRequest.deleteMany()
	await prisma.workOrder.deleteMany()
	await prisma.maintenancePlanTask.deleteMany()
	await prisma.maintenancePlan.deleteMany()
	await prisma.equipment.deleteMany()
	await prisma.notification.deleteMany()
	await prisma.session.deleteMany()
	await prisma.account.deleteMany()
	await prisma.company.deleteMany()
	await prisma.user.deleteMany()
	console.log("  ✅ Cleanup done")

	// ── 1. Counters ──
	await prisma.counter.upsert({
		where: { id: "ot_counter" },
		update: {},
		create: { id: "ot_counter", value: 1 },
	})
	await prisma.workRequestCounter.upsert({
		where: { id: "work_request_counter" },
		update: {},
		create: { id: "work_request_counter", value: 1 },
	})
	await prisma.supportTicketCounter.upsert({
		where: { id: "support_ticket_counter" },
		update: {},
		create: { id: "support_ticket_counter", value: 1 },
	})
	console.log("  ✅ Counters created")

	// ── 2. Admin user via Better Auth ──
	const bootstrapUser = await auth.api.signUpEmail({
		body: {
			name: "Admin OTC",
			email: "admin@otc360.cl",
			password: "admin1234",
			rut: "11.111.111-1",
			accessRole: "ADMIN",
			documentAreas: [],
			allowedModules: ["ALL"],
		},
	})

	if (!bootstrapUser?.user?.id) {
		throw new Error("Failed to create admin user")
	}

	// Set role to admin (signUpEmail defaults to "user")
	await prisma.user.update({
		where: { id: bootstrapUser.user.id },
		data: { role: "admin", allowedCompanies: [] },
	})

	const adminUser = { user: { id: bootstrapUser.user.id } }
	console.log("  ✅ Admin user created (admin@otc360.cl / admin1234)")

	// ── 3. Company ──
	const company = await prisma.company.create({
		data: {
			name: "Empresa Demo S.A.",
			rut: "76.000.000-0",
			isActive: true,
			createdById: adminUser.user.id,
		},
	})
	console.log("  ✅ Company created:", company.name)

	// ── 4. Supervisor user ──
	const supervisorSignup = await auth.api.signUpEmail({
		body: {
			name: "Supervisor Demo",
			email: "supervisor@demo.cl",
			password: "supervisor1234",
			rut: "22.222.222-2",
			companyId: company.id,
			isSupervisor: true,
			accessRole: "PARTNER_COMPANY",
			documentAreas: [],
			allowedModules: ["ALL"],
		},
	})

	if (supervisorSignup?.user?.id) {
		await prisma.user.update({
			where: { id: supervisorSignup.user.id },
			data: { role: "partnerCompany", allowedCompanies: [] },
		})
	}

	const supervisorUser = { user: { id: supervisorSignup?.user?.id } }
	console.log("  ✅ Supervisor user created (supervisor@demo.cl / supervisor1234)")

	// ── 5. Equipment hierarchy ──
	const otcChile = await prisma.location.upsert({
		where: { id: "seed-otc-chile" },
		update: {},
		create: { id: "seed-otc-chile", name: "OTC Chile", parentId: null, path: "OTC Chile" },
	})

	const sectorNorte = await prisma.location.upsert({
		where: { id: "seed-sector-norte-km42" },
		update: {},
		create: {
			id: "seed-sector-norte-km42",
			name: "Sector Norte KM 42",
			parentId: otcChile.id,
			path: "OTC Chile / Sector Norte KM 42",
		},
	})

	const parentEquipment = await prisma.equipment.create({
		data: {
			barcode: "EQ-PARENT-001",
			name: "Planta de Bombeo Norte",
			locationId: sectorNorte.id,
			tag: "PBN-001",
			isOperational: true,
			type: "INSTALACION",
			criticality: "CRITICAL",
			createdById: adminUser.user.id,
		},
	})

	const childEquipments = await Promise.all([
		prisma.equipment.create({
			data: {
				barcode: "EQ-CHILD-001",
				name: "Bomba Centrifuga B-101",
				locationId: sectorNorte.id,
				tag: "BC-101",
				isOperational: true,
				type: "BOMBA",
				criticality: "CRITICAL",
				parentId: parentEquipment.id,
				createdById: adminUser.user.id,
			},
		}),
		prisma.equipment.create({
			data: {
				barcode: "EQ-CHILD-002",
				name: "Motor Eléctrico ME-201",
				locationId: sectorNorte.id,
				tag: "ME-201",
				isOperational: true,
				type: "MOTOR",
				criticality: "SEMICRITICAL",
				parentId: parentEquipment.id,
				createdById: adminUser.user.id,
			},
		}),
		prisma.equipment.create({
			data: {
				barcode: "EQ-CHILD-003",
				name: "Válvula de Control VC-301",
				locationId: sectorNorte.id,
				tag: "VC-301",
				isOperational: true,
				type: "VALVULA",
				criticality: "UNCITICAL",
				parentId: parentEquipment.id,
				createdById: adminUser.user.id,
			},
		}),
	])
	console.log("  ✅ Equipment hierarchy created (1 parent + 3 children)")

	// ── 6. Maintenance Plan + Tasks ──
	const plan = await prisma.maintenancePlan.create({
		data: {
			slug: "plan-preventivo-bombeo-norte",
			name: "Plan Preventivo Bombeo Norte",
			description: "Plan de mantenimiento preventivo para la planta de bombeo norte",
			isActive: true,
			equipmentId: parentEquipment.id,
			createdById: adminUser.user.id,
		},
	})

	const now = new Date()
	const tasks = await Promise.all([
		prisma.maintenancePlanTask.create({
			data: {
				slug: "inspeccion-bomba-b101",
				name: "Inspección Bomba B-101",
				description: "Inspección visual y operativa de la bomba centrifuga",
				frequency: "MONTHLY",
				nextDate: new Date(now.getFullYear(), now.getMonth(), 5),
				originalDayOfMonth: 5,
				specialty: "MECHANIC",
				taskType: "INSPECTION",
				isActive: true,
				isAutomated: true,
				automatedCompanyId: company.id,
				automatedSupervisorId: supervisorUser?.user?.id ?? adminUser.user.id,
				automatedWorkOrderType: "PREVENTIVE",
				automatedPriority: "MEDIUM",
				automatedEstimatedDays: 1,
				automatedEstimatedHours: 4,
				maintenancePlanId: plan.id,
				equipmentId: childEquipments[0].id,
				createdById: adminUser.user.id,
			},
		}),
		prisma.maintenancePlanTask.create({
			data: {
				slug: "lubricacion-motor-me201",
				name: "Lubricación Motor ME-201",
				description: "Lubricación de rodamientos y verificación de nivel de aceite",
				frequency: "WEEKLY",
				nextDate: new Date(now.getFullYear(), now.getMonth(), 10),
				originalDayOfMonth: 10,
				specialty: "MECHANIC",
				taskType: "LUBRICATION",
				isActive: true,
				isAutomated: false,
				maintenancePlanId: plan.id,
				equipmentId: childEquipments[1].id,
				createdById: adminUser.user.id,
			},
		}),
		prisma.maintenancePlanTask.create({
			data: {
				slug: "ajuste-valvula-vc301",
				name: "Ajuste Válvula VC-301",
				description: "Calibración y ajuste de la válvula de control",
				frequency: "QUARTERLY",
				nextDate: new Date(now.getFullYear(), now.getMonth(), 15),
				originalDayOfMonth: 15,
				specialty: "INSTRUMENTATION_CONTROL",
				taskType: "ADJUSTMENTS",
				isActive: true,
				isAutomated: false,
				maintenancePlanId: plan.id,
				equipmentId: childEquipments[2].id,
				createdById: adminUser.user.id,
			},
		}),
		prisma.maintenancePlanTask.create({
			data: {
				slug: "limpieza-general-planta",
				name: "Limpieza General Planta",
				description: "Limpieza de áreas operativas y equipos",
				frequency: "BIMONTHLY",
				nextDate: new Date(now.getFullYear(), now.getMonth(), 20),
				originalDayOfMonth: 20,
				specialty: "ELECTRIC",
				taskType: "CLEANING",
				isActive: true,
				isAutomated: false,
				maintenancePlanId: plan.id,
				equipmentId: parentEquipment.id,
				createdById: adminUser.user.id,
			},
		}),
	])
	console.log(`  ✅ Maintenance plan + ${tasks.length} tasks created`)

	// ── 7. Sample Work Orders (mix of types and statuses) ──
	const woData = [
		{ type: "PREVENTIVE", status: "COMPLETED", days: -30, hours: 4 },
		{ type: "CORRECTIVE", status: "COMPLETED", days: -25, hours: 8 },
		{ type: "PREVENTIVE", status: "COMPLETED", days: -15, hours: 6 },
		{ type: "CORRECTIVE", status: "IN_PROGRESS", days: -5, hours: 12 },
		{ type: "PREVENTIVE", status: "PLANNED", days: 5, hours: 4 },
		{ type: "PREVENTIVE", status: "COMPLETED", days: -60, hours: 3 },
		{ type: "CORRECTIVE", status: "COMPLETED", days: -45, hours: 16 },
		{ type: "PREVENTIVE", status: "CLOSURE_REQUESTED", days: -2, hours: 8 },
	]

	let otCounter = 1
	for (const wo of woData) {
		const programDate = new Date(now.getTime() + wo.days * 86400000)
		const otNumber = `OT-${String(otCounter).padStart(4, "0")}${String(programDate.getDate()).padStart(2, "0")}${String(programDate.getMonth() + 1).padStart(2, "0")}${String(programDate.getFullYear()).slice(2)}`

		const endDate =
			wo.status === "COMPLETED" ? new Date(programDate.getTime() + wo.hours * 3600000) : null
		const closureRequestedAt = ["COMPLETED", "CLOSURE_REQUESTED"].includes(wo.status)
			? new Date(programDate.getTime() + (wo.hours - 2) * 3600000)
			: null
		const closureApprovedAt =
			wo.status === "COMPLETED" ? new Date(programDate.getTime() + wo.hours * 3600000) : null

		await prisma.workOrder.create({
			data: {
				otNumber,
				type: wo.type as "PREVENTIVE" | "CORRECTIVE",
				status: wo.status as "COMPLETED" | "IN_PROGRESS" | "PLANNED" | "CLOSURE_REQUESTED",
				solicitationDate: programDate,
				solicitationTime: "08:00:00",
				programDate,
				estimatedHours: wo.hours,
				estimatedDays: Math.ceil(wo.hours / 8),
				estimatedEndDate: new Date(programDate.getTime() + Math.ceil(wo.hours / 8) * 86400000),
				endDate,
				workRequest: `Trabajo de mantenimiento ${wo.type.toLowerCase()}`,
				workDescription: `OT de prueba - ${wo.type} - ${wo.status}`,
				priority: wo.hours > 8 ? "HIGH" : "MEDIUM",
				supervisorId: supervisorUser?.user?.id ?? adminUser.user.id,
				responsibleId: adminUser.user.id,
				companyId: company.id,
				closureRequestedAt,
				closureApprovedAt,
				closureRequestedById: closureRequestedAt ? adminUser.user.id : null,
				closureApprovedById: closureApprovedAt ? adminUser.user.id : null,
				maintenancePlanTaskId: tasks[otCounter % tasks.length].id,
				equipments: {
					connect: [{ id: childEquipments[otCounter % childEquipments.length].id }],
				},
			},
		})
		otCounter++
	}

	// Update counter
	await prisma.counter.update({
		where: { id: "ot_counter" },
		data: { value: otCounter },
	})
	console.log(`  ✅ ${woData.length} Work Orders created`)

	// ── 8. Sample Work Requests ──
	const wrData = [
		{ desc: "Vibración excesiva en bomba B-101", urgent: true, status: "ATTENDED" },
		{ desc: "Fuga de aceite en motor ME-201", urgent: false, status: "REPORTED" },
		{ desc: "Válvula VC-301 no responde a señal", urgent: true, status: "ATTENDED" },
		{ desc: "Ruido anormal en sistema de bombeo", urgent: false, status: "REPORTED" },
	]

	let wrCounter = 1
	for (const wr of wrData) {
		const requestDate = new Date(now.getTime() - wrCounter * 7 * 86400000)
		const requestNumber = `ST-${String(wrCounter).padStart(4, "0")}`

		await prisma.workRequest.create({
			data: {
				requestNumber,
				description: wr.desc,
				isUrgent: wr.urgent,
				requestDate,
				status: wr.status as "ATTENDED" | "REPORTED",
				workType: wrCounter % 2 === 0 ? "ELECTRIC" : "MECHANIC",
				userId: adminUser.user.id,
				equipments: {
					connect: [{ id: childEquipments[wrCounter % childEquipments.length].id }],
				},
			},
		})
		wrCounter++
	}

	await prisma.workRequestCounter.update({
		where: { id: "work_request_counter" },
		data: { value: wrCounter },
	})
	console.log(`  ✅ ${wrData.length} Work Requests created`)

	console.log("\n🎉 Seed completed successfully!")
	console.log("\n📋 Login credentials:")
	console.log("   Admin:      admin@otc360.cl / admin1234")
	console.log("   Supervisor:  supervisor@demo.cl / supervisor1234")
}

seed()
	.catch((e) => {
		console.error("❌ Seed failed:", e)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
