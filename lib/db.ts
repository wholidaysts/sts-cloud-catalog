import { Pool } from "pg"
import type { CloudService, SupportStatus, CloudProvider } from "./types"

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    })
  }
  return pool
}

function rowToService(row: any): CloudService {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider as CloudProvider,
    category: row.category,
    status: row.status as SupportStatus,
    description: row.description,
    supportNotes: row.support_notes ?? "",
    limitations: row.limitations ?? [],
    approvedUseCases: row.approved_use_cases ?? [],
    contactTeam: row.contact_team ?? "",
    documentationUrl: row.documentation_url ?? null,
    lastUpdated:
      row.last_updated instanceof Date
        ? row.last_updated.toISOString()
        : String(row.last_updated),
  }
}

async function logAudit(
  serviceId: string | null,
  action: string,
  userEmail: string,
  changes: unknown
) {
  try {
    await getPool().query(
      "INSERT INTO audit_log (service_id, action, user_email, changes) VALUES ($1, $2, $3, $4)",
      [serviceId, action, userEmail, JSON.stringify(changes)]
    )
  } catch (err) {
    console.error("[v0] Failed to write audit log:", err)
  }
}

export async function getAllServices(): Promise<CloudService[]> {
  const result = await getPool().query(
    "SELECT * FROM services ORDER BY provider ASC, name ASC"
  )
  return result.rows.map(rowToService)
}

export async function getServiceById(id: string): Promise<CloudService | null> {
  const result = await getPool().query("SELECT * FROM services WHERE id = $1", [id])
  if (result.rows.length === 0) return null
  return rowToService(result.rows[0])
}

export async function createService(
  service: Omit<CloudService, "id" | "lastUpdated">,
  userEmail: string
): Promise<CloudService> {
  const id = `${service.provider}-${service.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-${Date.now()}`

  const result = await getPool().query(
    `INSERT INTO services (
      id, name, provider, category, status, description,
      support_notes, limitations, approved_use_cases, contact_team, documentation_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      id,
      service.name,
      service.provider,
      service.category,
      service.status,
      service.description,
      service.supportNotes ?? "",
      service.limitations ?? [],
      service.approvedUseCases ?? [],
      service.contactTeam ?? "",
      service.documentationUrl ?? null,
    ]
  )

  const created = rowToService(result.rows[0])
  await logAudit(created.id, "create", userEmail, created)
  return created
}

export async function updateService(
  id: string,
  updates: Partial<Omit<CloudService, "id" | "lastUpdated">>,
  userEmail: string
): Promise<CloudService | null> {
  const fieldMap: Record<string, string> = {
    name: "name",
    provider: "provider",
    category: "category",
    status: "status",
    description: "description",
    supportNotes: "support_notes",
    limitations: "limitations",
    approvedUseCases: "approved_use_cases",
    contactTeam: "contact_team",
    documentationUrl: "documentation_url",
  }

  const fields: string[] = []
  const values: unknown[] = []
  let i = 1

  for (const [key, value] of Object.entries(updates)) {
    const column = fieldMap[key]
    if (column) {
      fields.push(`${column} = $${i++}`)
      values.push(value)
    }
  }

  if (fields.length === 0) {
    return getServiceById(id)
  }

  fields.push(`last_updated = NOW()`)
  values.push(id)

  const result = await getPool().query(
    `UPDATE services SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  )

  if (result.rows.length === 0) return null

  const updated = rowToService(result.rows[0])
  await logAudit(updated.id, "update", userEmail, updates)
  return updated
}

export async function deleteService(id: string, userEmail: string): Promise<boolean> {
  const result = await getPool().query("DELETE FROM services WHERE id = $1", [id])
  const deleted = (result.rowCount ?? 0) > 0
  if (deleted) {
    await logAudit(id, "delete", userEmail, { id })
  }
  return deleted
}

export async function getServiceStats() {
  const result = await getPool().query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'fully-supported')::int AS fully_supported,
      COUNT(*) FILTER (WHERE status = 'vendor-supported')::int AS vendor_supported,
      COUNT(*) FILTER (WHERE status = 'not-supported')::int AS not_supported,
      COUNT(*) FILTER (WHERE status = 'under-review')::int AS under_review,
      COUNT(*) FILTER (WHERE provider = 'aws')::int AS aws_count,
      COUNT(*) FILTER (WHERE provider = 'azure')::int AS azure_count
    FROM services
  `)
  return result.rows[0]
}
