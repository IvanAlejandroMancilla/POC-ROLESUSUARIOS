// Capa de API simulada — implementa el CONTRATO definido por el Agente 2
// (Especialista Oracle Fusion ERP). Ver docs/API_CONTRACT.md para el detalle
// de endpoints reales, payloads y autenticación OAuth que esta capa emula.
//
// Cuando existan endpoints reales, esta es la única capa que debe reemplazarse;
// los componentes de UI (Agente 1) consumen únicamente estas funciones y no
// conocen detalles de Fusion/IDCS.

import { mockUsers, mockRoles, mockDataAccessSets, BASE_ROLE } from '../data/mockData'

const NETWORK_DELAY_MS = [500, 1100]

function delay() {
  const [min, max] = NETWORK_DELAY_MS
  const ms = min + Math.random() * (max - min)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Flag global de demo para forzar errores y poder mostrar el manejo de
// errores del wizard sin depender de una instancia real de Fusion.
let simulateFailures = false
export function setSimulateFailures(value) {
  simulateFailures = value
}

function maybeFail(errorFactory) {
  if (simulateFailures && Math.random() < 0.35) {
    throw errorFactory()
  }
}

class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message)
    this.status = status
    this.code = code
  }
}

// ---------------------------------------------------------------------------
// Endpoint 1 — Buscar/validar usuario
// IDCS SCIM: GET /admin/v1/Users?filter=userName eq "{userName}"
// ---------------------------------------------------------------------------
export async function searchUser(userName) {
  await delay()
  maybeFail(() => new ApiError('Fallo de red simulado al consultar IDCS.', { status: 503, code: 'NETWORK_ERROR' }))

  const normalized = userName.trim().toLowerCase()
  const found = mockUsers.find((u) => u.userName.toLowerCase() === normalized)

  if (!found) {
    throw new ApiError(`No se encontró ningún usuario con userName "${userName}" en IDCS.`, {
      status: 404,
      code: 'USER_NOT_FOUND',
    })
  }
  if (!found.active) {
    throw new ApiError(`El usuario "${userName}" existe pero está inactivo/bloqueado en Fusion.`, {
      status: 409,
      code: 'USER_INACTIVE',
    })
  }
  return { ...found }
}

// Autocomplete liviano para sugerencias mientras se escribe.
export async function suggestUsers(partial) {
  await delay()
  const normalized = partial.trim().toLowerCase()
  if (normalized.length < 2) return []
  return mockUsers
    .filter(
      (u) =>
        u.userName.toLowerCase().includes(normalized) ||
        u.displayName.toLowerCase().includes(normalized)
    )
    .slice(0, 6)
    .map((u) => ({ id: u.id, userName: u.userName, displayName: u.displayName }))
}

// ---------------------------------------------------------------------------
// Endpoint 2 — Listar catálogo de roles disponibles / roles de un usuario
// FSCM `/hcmRestApi/resources/.../roles` + SCIM Roles API
// ---------------------------------------------------------------------------
export async function getAvailableRoles() {
  await delay()
  maybeFail(() => new ApiError('Fallo de red simulado al listar catálogo de roles.', { status: 503, code: 'NETWORK_ERROR' }))
  return [...mockRoles]
}

export async function getUserRoles(userId) {
  await delay()
  maybeFail(() => new ApiError('Fallo de red simulado al obtener roles del usuario.', { status: 503, code: 'NETWORK_ERROR' }))

  const user = mockUsers.find((u) => u.id === userId)
  if (!user) {
    throw new ApiError('Usuario origen no encontrado al leer sus roles.', { status: 404, code: 'USER_NOT_FOUND' })
  }
  return mockRoles.filter((r) => user.roleIds.includes(r.id))
}

// ---------------------------------------------------------------------------
// Endpoint 3 — Asignar roles a usuario
// POST/PATCH SCIM `/admin/v1/Users/{id}` (agregar roles)
// ---------------------------------------------------------------------------
export async function assignRolesToUser(userId, roleIds) {
  await delay()
  maybeFail(() => new ApiError('Fallo de red simulado al asignar roles (PATCH SCIM).', { status: 500, code: 'PATCH_FAILED' }))

  if (!roleIds || roleIds.length === 0) {
    throw new ApiError('Debe incluir al menos un rol (mínimo el rol base).', { status: 400, code: 'VALIDATION_ERROR' })
  }

  // Simula la respuesta que SCIM devolvería tras el PATCH.
  return {
    id: userId,
    roleIds: Array.from(new Set([BASE_ROLE.id, ...roleIds])),
    updatedAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Endpoint 4 — Asignar data access sets
// FSCM Security Console API — `/fscmRestApi/resources/.../dataAccessSets`
// ---------------------------------------------------------------------------
export async function assignDataAccessSets(userId, dataAccessSetIds) {
  await delay()
  maybeFail(() => new ApiError('Fallo de red simulado al asignar data access sets.', { status: 500, code: 'DAS_ASSIGN_FAILED' }))

  if (!dataAccessSetIds || dataAccessSetIds.length === 0) {
    throw new ApiError('Debe seleccionar al menos un data access set.', { status: 400, code: 'VALIDATION_ERROR' })
  }

  return {
    id: userId,
    dataAccessSetIds,
    updatedAt: new Date().toISOString(),
  }
}

export function getAllDataAccessSets() {
  return [...mockDataAccessSets]
}

export { ApiError }
