"use client"

import Link from "next/link"
import {
	ArrowLeftIcon,
	BookOpenIcon,
	DatabaseIcon,
	KeyIcon,
	LinkIcon,
	AlertTriangleIcon,
	ServerIcon,
	BarChart3Icon,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table"

// ---------------------------------------------------------------------------
// Code block component
// ---------------------------------------------------------------------------

function CodeBlock({ children, language }: { children: string; language?: string }) {
	return (
		<div className="relative overflow-hidden rounded-lg border">
			{language && (
				<div className="bg-muted border-b px-3 py-1.5 text-xs font-medium text-muted-foreground">
					{language}
				</div>
			)}
			<pre className="overflow-x-auto bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100 dark:bg-zinc-900">
				<code>{children}</code>
			</pre>
		</div>
	)
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({
	id,
	title,
	icon: Icon,
	children,
}: {
	id: string
	title: string
	icon: React.ComponentType<{ className?: string }>
	children: React.ReactNode
}) {
	return (
		<Card id={id}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<Icon className="size-5" />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">{children}</CardContent>
		</Card>
	)
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ApiDocsPage() {
	return (
		<div className="space-y-6 pb-12">
			{/* Back link */}
			<Link
				href="/admin/dashboard/api-keys"
				className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
			>
				<ArrowLeftIcon className="size-4" />
				Volver a API Keys
			</Link>

			{/* Table of contents */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Contenido</CardTitle>
					<CardDescription>Navegacion rapida por la documentacion</CardDescription>
				</CardHeader>
				<CardContent>
					<nav className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
						{[
							{ href: "#introduccion", label: "1. Introduccion" },
							{ href: "#autenticacion", label: "2. Autenticacion" },
							{ href: "#endpoints", label: "3. Endpoints Disponibles" },
							{ href: "#paginacion", label: "4. Paginacion" },
							{ href: "#powerbi", label: "5. Conexion con Power BI" },
							{ href: "#campos", label: "6. Campos por Endpoint" },
							{ href: "#errores", label: "7. Codigos de Error" },
							{ href: "#notas", label: "8. Notas Importantes" },
						].map((item) => (
							<a
								key={item.href}
								href={item.href}
								className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2 text-sm transition-colors"
							>
								{item.label}
							</a>
						))}
					</nav>
				</CardContent>
			</Card>

			{/* 1. Introduccion */}
			<Section id="introduccion" title="Introduccion" icon={BookOpenIcon}>
				<p className="text-muted-foreground leading-relaxed">
					OTC expone una API REST de solo lectura disenada para extraer datos operativos
					hacia Power BI u otras herramientas de Business Intelligence. Todos los
					endpoints devuelven datos en formato JSON y requieren autenticacion mediante
					API Key.
				</p>
				<div className="rounded-lg border bg-blue-500/10 p-4">
					<p className="text-sm font-medium">Base URL</p>
					<code className="mt-1 block text-sm font-mono">
						{"https://otc360.cl/api/v1"}
					</code>
				</div>
				<div className="rounded-lg border bg-blue-500/10 p-4">
					<p className="text-sm font-medium">Metodo de autenticacion</p>
					<p className="mt-1 text-sm text-muted-foreground">
						API Key enviada en el header <code className="bg-muted rounded px-1.5 py-0.5 text-xs">x-api-key</code>
					</p>
				</div>
			</Section>

			{/* 2. Autenticacion */}
			<Section id="autenticacion" title="Autenticacion" icon={KeyIcon}>
				<ul className="list-disc space-y-2 pl-5 text-muted-foreground text-sm leading-relaxed">
					<li>
						Todas las solicitudes requieren el header{" "}
						<code className="bg-muted rounded px-1.5 py-0.5 text-xs">x-api-key</code> con una
						API key valida.
					</li>
					<li>
						Las keys se generan desde el{" "}
						<Link
							href="/admin/dashboard/api-keys"
							className="text-blue-500 underline underline-offset-2 hover:text-blue-400"
						>
							panel de API Keys
						</Link>
						.
					</li>
					<li>
						Las keys expiran a los <strong className="text-foreground">90 dias</strong> por defecto.
						Renovar antes del vencimiento para evitar interrupciones.
					</li>
				</ul>
				<p className="text-sm font-medium pt-2">Ejemplo con curl</p>
				<CodeBlock language="bash">
					{`curl -H "x-api-key: otc_pk_..." https://otc360.cl/api/v1/companies`}
				</CodeBlock>
			</Section>

			{/* 3. Endpoints Disponibles */}
			<Section id="endpoints" title="Endpoints Disponibles" icon={ServerIcon}>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-20">Metodo</TableHead>
								<TableHead>Endpoint</TableHead>
								<TableHead>Descripcion</TableHead>
								<TableHead>Registros</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{[
								{
									endpoint: "/api/v1/companies",
									desc: "Empresas contratistas",
									detail: "Datos de empresa + conteos",
								},
								{
									endpoint: "/api/v1/users",
									desc: "Usuarios del sistema",
									detail: "Sin datos sensibles (sin email/RUT/telefono)",
								},
								{
									endpoint: "/api/v1/equipment",
									desc: "Equipos y activos",
									detail: "Jerarquia de equipos",
								},
								{
									endpoint: "/api/v1/work-orders",
									desc: "Ordenes de trabajo",
									detail: "Incluye equipos asignados",
								},
								{
									endpoint: "/api/v1/work-permits",
									desc: "Permisos de trabajo",
									detail: "Incluye participantes y riesgos",
								},
								{
									endpoint: "/api/v1/lockout-permits",
									desc: "Permisos de bloqueo",
									detail: "Incluye registros de bloqueo",
								},
							{
								endpoint: "/api/v1/safety-talks",
								desc: "Charlas de seguridad",
								detail: "Estado de cumplimiento por usuario",
							},
							{
								endpoint: "/api/v1/maintenance-plans",
								desc: "Tareas de planes de mantenimiento",
								detail: "Frecuencia, automatización, equipos",
							},
							{
								endpoint: "/api/v1/in-person-safety-talks",
								desc: "Charlas de seguridad presenciales",
								detail: "Registros de personas sin cuenta",
							},
							{
								endpoint: "/api/v1/work-requests",
								desc: "Solicitudes de trabajo",
								detail: "Pipeline solicitud → OT",
							},
							{
								endpoint: "/api/v1/work-entries",
								desc: "Actividades del libro de obra",
								detail: "Registros diarios de trabajo",
							},
							{
								endpoint: "/api/v1/milestones",
								desc: "Hitos de órdenes de trabajo",
								detail: "Progreso por hitos",
							},
							{
								endpoint: "/api/v1/startup-folders",
								desc: "Carpetas de arranque",
								detail: "Estado de cumplimiento documental",
							},
							{
								endpoint: "/api/v1/labor-control",
								desc: "Control laboral",
								detail: "Estado mensual por empresa",
							},
						].map((row) => (
								<TableRow key={row.endpoint}>
									<TableCell>
										<Badge className="bg-emerald-600 text-white font-mono text-xs">
											GET
										</Badge>
									</TableCell>
									<TableCell>
										<code className="text-sm font-mono">{row.endpoint}</code>
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{row.desc}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{row.detail}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</Section>

			{/* 4. Paginacion */}
			<Section id="paginacion" title="Paginacion" icon={DatabaseIcon}>
				<p className="text-muted-foreground text-sm leading-relaxed">
					Todos los endpoints soportan paginacion basada en cursor.
				</p>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Parametro</TableHead>
								<TableHead>Tipo</TableHead>
								<TableHead>Descripcion</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell>
									<code className="text-sm font-mono">cursor</code>
								</TableCell>
								<TableCell className="text-muted-foreground text-sm">string (opcional)</TableCell>
								<TableCell className="text-muted-foreground text-sm">
									Cursor de la pagina siguiente. Omitir para la primera pagina.
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<code className="text-sm font-mono">limit</code>
								</TableCell>
								<TableCell className="text-muted-foreground text-sm">number (opcional)</TableCell>
								<TableCell className="text-muted-foreground text-sm">
									Cantidad de registros por pagina. Default: 100, maximo: 500.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>

				<p className="text-sm font-medium pt-2">Estructura de respuesta</p>
				<CodeBlock language="json">
{`{
  "data": [...],
  "pagination": {
    "nextCursor": "abc123",
    "hasMore": true,
    "limit": 100
  },
  "meta": {
    "total": 1250,
    "generatedAt": "2026-01-01T00:00:00.000Z"
  }
}`}
				</CodeBlock>

				<div className="rounded-lg border bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-400">
					<strong>Tip:</strong> Para obtener todos los registros, seguir llamando con{" "}
					<code className="bg-muted rounded px-1.5 py-0.5 text-xs">?cursor=&#123;nextCursor&#125;</code>{" "}
					hasta que <code className="bg-muted rounded px-1.5 py-0.5 text-xs">hasMore</code> sea{" "}
					<code className="bg-muted rounded px-1.5 py-0.5 text-xs">false</code>.
				</div>

				<p className="text-sm font-medium pt-4">Refresh Incremental (updatedSince)</p>
				<p className="text-muted-foreground text-sm leading-relaxed">
					Todos los endpoints soportan el parametro{" "}
					<code className="bg-muted rounded px-1.5 py-0.5 text-xs">updatedSince</code> para
					carga incremental de datos:
				</p>
				<CodeBlock language="HTTP">
{`GET /api/v1/work-orders?updatedSince=2026-04-01T00:00:00.000Z&limit=500`}
				</CodeBlock>
				<ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground leading-relaxed">
					<li>
						Formato: timestamp{" "}
						<code className="bg-muted rounded px-1.5 py-0.5 text-xs">ISO 8601</code>
					</li>
					<li>
						Retorna solo registros actualizados despues de la fecha especificada
					</li>
					<li>
						Reduce significativamente la transferencia de datos en refreshes programados
					</li>
					<li>
						Si se omite, retorna todos los registros (full refresh)
					</li>
					<li>
						Nota:{" "}
						<code className="bg-muted rounded px-1.5 py-0.5 text-xs">/api/v1/work-entries</code>{" "}
						usa{" "}
						<code className="bg-muted rounded px-1.5 py-0.5 text-xs">createdAt</code> en vez de{" "}
						<code className="bg-muted rounded px-1.5 py-0.5 text-xs">updatedAt</code> (las
						entradas son inmutables)
					</li>
				</ul>
			</Section>

			{/* 5. Conexion con Power BI */}
			<Section id="powerbi" title="Conexion con Power BI" icon={BarChart3Icon}>
				<ol className="list-decimal space-y-3 pl-5 text-sm text-muted-foreground leading-relaxed">
					<li>
						<strong className="text-foreground">Abrir Power BI Desktop</strong>
					</li>
					<li>
						<strong className="text-foreground">Obtener datos → Web</strong>
					</li>
					<li>
						<strong className="text-foreground">Seleccionar &quot;Avanzada&quot;</strong>
					</li>
					<li>
						<strong className="text-foreground">URL:</strong>{" "}
						<code className="bg-muted rounded px-1.5 py-0.5 text-xs">
							https://otc360.cl/api/v1/companies
						</code>{" "}
						(o el endpoint deseado)
					</li>
					<li>
						<strong className="text-foreground">Encabezados HTTP:</strong> Agregar{" "}
						<code className="bg-muted rounded px-1.5 py-0.5 text-xs">x-api-key</code> con el
						valor de tu API key
					</li>
					<li>
						<strong className="text-foreground">Aceptar y transformar datos</strong>
					</li>
					<li>
						<strong className="text-foreground">En Power Query:</strong> Los datos vienen en el
						campo <code className="bg-muted rounded px-1.5 py-0.5 text-xs">data</code> — expandir
						la columna
					</li>
					<li>
						<strong className="text-foreground">Para paginacion automatica:</strong> Crear una
						funcion M que itere hasta{" "}
						<code className="bg-muted rounded px-1.5 py-0.5 text-xs">hasMore = false</code>
					</li>
				</ol>

				<p className="text-sm font-medium pt-4">Ejemplo de funcion M para Power Query (paginacion automatica)</p>
				<CodeBlock language="Power Query M">
{`let
    BaseUrl = "https://otc360.cl/api/v1/work-orders",
    ApiKey = "otc_pk_...",
    GetPage = (cursor as nullable text) =>
        let
            Url = if cursor = null
                  then BaseUrl & "?limit=500"
                  else BaseUrl & "?limit=500&cursor=" & cursor,
            Response = Json.Document(
                Web.Contents(Url, [Headers=[#"x-api-key"=ApiKey]])
            ),
            Data = Response[data],
            NextCursor = Response[pagination][nextCursor],
            HasMore = Response[pagination][hasMore]
        in
            [Data=Data, NextCursor=NextCursor, HasMore=HasMore],

    GetAllPages = List.Generate(
        () => GetPage(null),
        each [HasMore] = true or [Data] <> null,
        each if [HasMore]
             then GetPage([NextCursor])
             else [Data=null, NextCursor=null, HasMore=false]
    ),

    AllData = List.Combine(
        List.Transform(
            List.Select(GetAllPages, each [Data] <> null),
            each [Data]
        )
    ),
    Table = Table.FromList(
        AllData,
        Splitter.SplitByNothing(), null, null,
        ExtraValues.Error
    ),
    Expanded = Table.ExpandRecordColumn(
        Table, "Column1",
        Record.FieldNames(AllData{0})
    )
in
    Expanded`}
				</CodeBlock>
			</Section>

			{/* 6. Campos por Endpoint */}
			<Section id="campos" title="Campos por Endpoint" icon={LinkIcon}>
				<p className="text-muted-foreground text-sm leading-relaxed pb-2">
					Campos principales retornados por cada endpoint. No se listan todos los campos,
					solo los mas relevantes para reportes.
				</p>

				{[
					{
						name: "Companies",
						endpoint: "/api/v1/companies",
						fields: ["id", "name", "isActive", "userCount", "workOrderCount"],
					},
					{
						name: "Users",
						endpoint: "/api/v1/users",
						fields: [
							"id", "name", "role", "accessRole", "area", "isActive",
							"companyName", "allowedModules",
						],
					},
					{
						name: "Equipment",
						endpoint: "/api/v1/equipment",
						fields: [
							"id", "barcode", "name", "location", "isOperational",
							"tag", "criticality", "parentName",
						],
					},
					{
						name: "Work Orders",
						endpoint: "/api/v1/work-orders",
						fields: [
							"id", "otNumber", "type", "status", "progress", "priority",
							"companyName", "supervisorName", "responsibleName",
							"equipmentNames", "solicitationDate", "estimatedEndDate",
						],
					},
					{
						name: "Work Permits",
						endpoint: "/api/v1/work-permits",
						fields: [
							"id", "status", "isUrgent", "exactPlace", "tools",
							"riskIdentification", "companyName", "userName",
							"participantCount", "startDate", "endDate",
						],
					},
					{
						name: "Lockout Permits",
						endpoint: "/api/v1/lockout-permits",
						fields: [
							"id", "status", "lockoutType", "companyName",
							"equipmentNames", "supervisorName",
							"lockoutRegistrationCount",
						],
					},
					{
						name: "Charlas de Seguridad",
						endpoint: "/api/v1/safety-talks",
						fields: [
							"id", "category", "status", "score", "currentAttempts",
							"completedAt", "expiresAt", "userName", "manuallyApproved",
						],
					},
					{
						name: "Tareas de Mantenimiento",
						endpoint: "/api/v1/maintenance-plans",
						fields: [
							"id", "name", "frequency", "nextDate", "isAutomated",
							"planName", "planIsActive", "equipmentNames",
							"automatedWorkOrderType",
						],
					},
					{
						name: "Charlas Presenciales",
						endpoint: "/api/v1/in-person-safety-talks",
						fields: [
							"id", "rut", "name", "company", "category",
							"sessionDate", "expiresAt", "status", "score",
						],
					},
					{
						name: "Solicitudes de Trabajo",
						endpoint: "/api/v1/work-requests",
						fields: [
							"id", "requestNumber", "description", "status",
							"workType", "isUrgent", "userName", "equipmentNames",
							"workOrderCount",
						],
					},
					{
						name: "Actividades del Libro de Obra",
						endpoint: "/api/v1/work-entries",
						fields: [
							"id", "entryType", "executionDate", "activityName",
							"workOrderOtNumber", "milestoneName", "createdByName",
							"inspectionStatus",
						],
					},
					{
						name: "Hitos",
						endpoint: "/api/v1/milestones",
						fields: [
							"id", "name", "status", "weight", "isCompleted",
							"workOrderOtNumber", "activityCount", "startDate",
							"endDate",
						],
					},
					{
						name: "Carpetas de Arranque",
						endpoint: "/api/v1/startup-folders",
						fields: [
							"id", "name", "type", "status", "companyName",
							"safetyAndHealthStatus", "workerFolderCount",
						],
					},
					{
						name: "Control Laboral",
						endpoint: "/api/v1/labor-control",
						fields: [
							"id", "status", "companyFolderStatus", "companyName",
							"workerFolderCount", "documentCount",
						],
					},
				].map((ep) => (
					<div key={ep.endpoint} className="space-y-2">
						<h4 className="text-sm font-semibold">
							{ep.name}{" "}
							<code className="text-muted-foreground font-normal text-xs">
								{ep.endpoint}
							</code>
						</h4>
						<div className="flex flex-wrap gap-1.5">
							{ep.fields.map((field) => (
								<Badge key={field} variant="outline" className="font-mono text-xs">
									{field}
								</Badge>
							))}
						</div>
					</div>
				))}

				<div className="rounded-lg border bg-blue-500/10 p-4 text-sm text-blue-700 dark:text-blue-400">
					<strong>Nota:</strong> Los campos de tipo array (
					<code className="bg-muted rounded px-1.5 py-0.5 text-xs">tools</code>,{" "}
					<code className="bg-muted rounded px-1.5 py-0.5 text-xs">equipmentIds</code>,{" "}
					<code className="bg-muted rounded px-1.5 py-0.5 text-xs">equipmentNames</code>, etc.)
					son strings JSON. En Power BI usar{" "}
					<code className="bg-muted rounded px-1.5 py-0.5 text-xs">Json.Document()</code> para
					parsearlos.
				</div>
			</Section>

			{/* 7. Codigos de Error */}
			<Section id="errores" title="Codigos de Error" icon={AlertTriangleIcon}>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-24">Codigo</TableHead>
								<TableHead>Significado</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{[
								{ code: "401", desc: "API key faltante o invalida" },
								{ code: "403", desc: "API key revocada" },
								{ code: "400", desc: "Parametros de consulta invalidos" },
								{ code: "500", desc: "Error interno del servidor" },
							].map((row) => (
								<TableRow key={row.code}>
									<TableCell>
										<Badge
											className={
												row.code === "500"
													? "bg-red-600 text-white font-mono"
													: "bg-yellow-600 text-white font-mono"
											}
										>
											{row.code}
										</Badge>
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{row.desc}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</Section>

			{/* 8. Notas Importantes */}
			<Section id="notas" title="Notas Importantes" icon={AlertTriangleIcon}>
				<ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground leading-relaxed">
					<li>
						Los datos <strong className="text-foreground">NO</strong> incluyen informacion
						personal sensible (email, RUT, telefono).
					</li>
					<li>
						Los campos de fecha estan en formato{" "}
						<code className="bg-muted rounded px-1.5 py-0.5 text-xs">ISO 8601</code>.
					</li>
					<li>
						Los campos de array estan serializados como strings JSON.
					</li>
					<li>
						La API es de solo lectura (
						<Badge className="bg-emerald-600 text-white font-mono text-xs">GET</Badge>
						) — no se pueden modificar datos.
					</li>
					<li>
						Limite de requests: el uso es monitoreado mediante conteo de requests por key.
					</li>
					<li>
						Para refresh incremental, usar el parametro{" "}
						<code className="bg-muted rounded px-1.5 py-0.5 text-xs">updatedSince</code>{" "}
						con la fecha del ultimo refresh exitoso.
					</li>
					<li>
						Las keys expiran a los{" "}
						<strong className="text-foreground">90 dias</strong> — renovar desde el{" "}
						<Link
							href="/admin/dashboard/api-keys"
							className="text-blue-500 underline underline-offset-2 hover:text-blue-400"
						>
							panel de administracion
						</Link>
						.
					</li>
				</ul>
			</Section>
		</div>
	)
}
